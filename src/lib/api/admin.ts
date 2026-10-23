/**
 * Admin panel API adapter. Demo mode reads/writes browser storage; when
 * VITE_API_BASE_URL is set the same calls hit the Laravel 12 admin endpoints
 * (Filament panel roles enforced server-side).
 */
import { apiFetch, setToken, usingRemoteApi } from "./client";
import { BRAND_EMAIL } from "@/lib/brand";
import {
  ensureStaffStore,
  localDeleteStaff,
  localReadStaff,
  localSaveStaff,
  seedDemoOrders,
} from "./admin-store";
import { localReadOrders, localSaveOrder, projectedStatus } from "./local-store";
import { STATUS_COPY } from "@/lib/laundry/status";
import type {
  AdminCustomer,
  AdminRole,
  AdminUser,
  Order,
  OrderStatus,
  StaffMember,
} from "@/lib/laundry/types";

const SESSION_KEY = "bl.admin.session";

export type AdminSection = "dashboard" | "orders" | "customers" | "staff";

const SECTION_ROLES: Record<AdminSection, AdminRole[]> = {
  dashboard: ["admin", "manager", "staff"],
  orders: ["admin", "manager", "staff"],
  customers: ["admin", "manager"],
  staff: ["admin", "manager"],
};

/** Only owners can add, edit or remove staff accounts. */
export function canManageStaff(role: AdminRole): boolean {
  return role === "admin";
}

export function canAccess(role: AdminRole, section: AdminSection): boolean {
  return SECTION_ROLES[section].includes(role);
}

export function readAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function writeAdminSession(user: AdminUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(SESSION_KEY);
}

/** Demo accounts — replaced by Laravel token auth once VITE_API_BASE_URL is set. */
const DEMO_PANEL_USERS: (AdminUser & { password: string })[] = [
  {
    id: "adm-1",
    name: "Bhavin Parmar",
    email: BRAND_EMAIL,
    role: "admin",
    password: "admin123",
  },
  {
    id: "mgr-1",
    name: "Kiran Patel",
    email: "manager@jaymahakalilaundry.in",
    role: "manager",
    password: "manager123",
  },
  {
    id: "stf-1",
    name: "Jignesh Vyas",
    email: "staff@jaymahakalilaundry.in",
    role: "staff",
    password: "staff123",
  },
];

export const adminAuth = {
  current: readAdminSession,

  async signIn(input: { email: string; password: string }): Promise<AdminUser> {
    const email = input.email.trim().toLowerCase();
    if (usingRemoteApi) {
      const result = await apiFetch<{ user: AdminUser; token: string }>("/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password: input.password }),
      });
      setToken(result.token);
      writeAdminSession(result.user);
      return result.user;
    }

    const match = DEMO_PANEL_USERS.find(
      (user) => user.email === email && user.password === input.password,
    );
    if (!match) throw new Error("Invalid email or password.");
    ensureStaffStore();
    const { password: _password, ...user } = match;
    writeAdminSession(user);
    return user;
  },

  async signOut(): Promise<void> {
    if (usingRemoteApi) {
      try {
        await apiFetch<null>("/admin/logout", { method: "POST" });
      } catch {
        /* token already invalid — clear locally anyway */
      }
    }
    setToken(null);
    writeAdminSession(null);
  },
};

function hydrate(order: Order): Order {
  const status = order.statusLocked ? order.status : projectedStatus(order);
  return { ...order, status };
}

function deriveCustomers(orders: Order[]): AdminCustomer[] {
  const byPhone = new Map<string, AdminCustomer>();
  for (const order of orders) {
    const existing = byPhone.get(order.phone);
    const customer: AdminCustomer = {
      name: order.customerName,
      phone: order.phone,
      ...(order.email ? { email: order.email } : {}),
      address: order.address,
      pincode: order.pincode,
      orders: (existing?.orders ?? 0) + 1,
      totalSpend: (existing?.totalSpend ?? 0) + order.total,
      lastOrderAt:
        !existing || order.createdAt > existing.lastOrderAt
          ? order.createdAt
          : existing.lastOrderAt,
    };
    byPhone.set(order.phone, customer);
  }
  return [...byPhone.values()].sort((a, b) => b.totalSpend - a.totalSpend);
}

export interface StaffInput {
  name: string;
  phone: string;
  email?: string;
  role: AdminRole;
  active?: boolean;
}

export const adminApi = {
  orders: {
    async list(): Promise<Order[]> {
      if (usingRemoteApi) return apiFetch<Order[]>("/admin/orders");
      return localReadOrders().map(hydrate);
    },

    async updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
      if (usingRemoteApi) {
        return apiFetch<Order>(`/admin/orders/${encodeURIComponent(id)}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status, note }),
        });
      }
      const order = localReadOrders().find((candidate) => candidate.id === id);
      if (!order) throw new Error("Order not found.");
      const updated: Order = {
        ...order,
        status,
        statusLocked: true,
        timeline: [
          ...order.timeline,
          { status, at: new Date().toISOString(), note: note?.trim() || STATUS_COPY[status] },
        ],
      };
      localSaveOrder(updated);
      return updated;
    },
  },

  customers: {
    async list(): Promise<AdminCustomer[]> {
      if (usingRemoteApi) return apiFetch<AdminCustomer[]>("/admin/customers");
      return deriveCustomers(localReadOrders().map(hydrate));
    },
  },

  staff: {
    async list(): Promise<StaffMember[]> {
      if (usingRemoteApi) return apiFetch<StaffMember[]>("/admin/staff");
      ensureStaffStore();
      return localReadStaff();
    },

    async create(input: StaffInput): Promise<StaffMember> {
      if (usingRemoteApi) {
        return apiFetch<StaffMember>("/admin/staff", {
          method: "POST",
          body: JSON.stringify(input),
        });
      }
      const member: StaffMember = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        phone: input.phone.trim(),
        ...(input.email ? { email: input.email.trim() } : {}),
        role: input.role,
        active: input.active ?? true,
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      localSaveStaff(member);
      return member;
    },

    async update(member: StaffMember): Promise<StaffMember> {
      if (usingRemoteApi) {
        return apiFetch<StaffMember>(`/admin/staff/${encodeURIComponent(member.id)}`, {
          method: "PATCH",
          body: JSON.stringify(member),
        });
      }
      localSaveStaff(member);
      return member;
    },

    async remove(id: string): Promise<void> {
      if (usingRemoteApi) {
        await apiFetch<null>(`/admin/staff/${encodeURIComponent(id)}`, { method: "DELETE" });
        return;
      }
      localDeleteStaff(id);
    },
  },

  /** Demo-mode helper: populates sample orders so tables are not empty. */
  seedDemoData(): number {
    ensureStaffStore();
    return seedDemoOrders();
  },
};
