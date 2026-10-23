/**
 * Local (demo-mode) storage for the admin panel: staff directory and a
 * one-click demo dataset so the panel has realistic rows before the Laravel
 * API is wired. Mirrors the adapter pattern in ./local-store.ts.
 */
import { quoteFor } from "@/lib/laundry/pricing";
import { ORDER_FLOW, STATUS_COPY } from "@/lib/laundry/status";
import type { BookingItem, Order, OrderStatus, StaffMember } from "@/lib/laundry/types";

const STAFF_KEY = "bl.staff";

function readStaff(): StaffMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as StaffMember[]) : [];
  } catch {
    return [];
  }
}

function writeStaff(members: StaffMember[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_KEY, JSON.stringify(members));
}

export function localReadStaff(): StaffMember[] {
  return readStaff().sort((a, b) => a.name.localeCompare(b.name));
}

export function localSaveStaff(member: StaffMember) {
  writeStaff([...readStaff().filter((existing) => existing.id !== member.id), member]);
}

export function localDeleteStaff(id: string) {
  writeStaff(readStaff().filter((member) => member.id !== id));
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "mgr-1",
    name: "Kiran Patel",
    phone: "9825099902",
    email: "manager@jaymahakalilaundry.in",
    role: "manager",
    active: true,
    joinedAt: "2025-08-02",
  },
  {
    id: "stf-1",
    name: "Jignesh Vyas",
    phone: "9825099901",
    email: "staff@jaymahakalilaundry.in",
    role: "staff",
    active: true,
    joinedAt: "2026-01-12",
  },
  {
    id: "stf-2",
    name: "Ravi Chauhan",
    phone: "9825099903",
    role: "staff",
    active: false,
    joinedAt: "2025-11-20",
  },
];

/** Seeds the staff directory once so the panel is never empty in demo mode. */
export function ensureStaffStore(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STAFF_KEY)) return;
  writeStaff(DEFAULT_STAFF);
}

interface DemoSpec {
  code: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  items: BookingItem[];
  paymentMethod: Order["paymentMethod"];
  status: OrderStatus;
  /** Minutes before now the order was placed. */
  ageMinutes: number;
  pickupSlot: string;
  dropSlot: string;
}

const DEMO_SPECS: DemoSpec[] = [
  {
    code: "BL-260101",
    name: "Rakesh Shah",
    phone: "9825011223",
    email: "rakesh.shah@example.com",
    address: "22, Kalawad Road, Near Race Course",
    pincode: "360001",
    items: [{ serviceSlug: "wash-fold", quantity: 5 }],
    paymentMethod: "cod",
    status: "processing",
    ageMinutes: 60 * 26,
    pickupSlot: "08:00 – 10:00",
    dropSlot: "18:00 – 20:00",
  },
  {
    code: "BL-260102",
    name: "Meera Joshi",
    phone: "9825022334",
    address: "7, Panchshil Society, University Road",
    pincode: "360002",
    items: [{ serviceSlug: "saree-roll-polish", quantity: 2 }],
    paymentMethod: "upi_on_pickup",
    status: "quality_check",
    ageMinutes: 60 * 40,
    pickupSlot: "10:00 – 12:00",
    dropSlot: "16:00 – 18:00",
  },
  {
    code: "BL-260103",
    name: "Arjun Trivedi",
    phone: "9879503345",
    email: "arjun.t@example.com",
    address: "14, Ranchoddas Society, Amin Marg",
    pincode: "360005",
    items: [
      { serviceSlug: "dry-cleaning", quantity: 3 },
      { serviceSlug: "iron-press", quantity: 6 },
    ],
    paymentMethod: "cod",
    status: "out_for_delivery",
    ageMinutes: 60 * 55,
    pickupSlot: "12:00 – 14:00",
    dropSlot: "18:00 – 20:00",
  },
  {
    code: "BL-260104",
    name: "Priya Bhatt",
    phone: "9825044456",
    address: "3, Shreeji Flats, Rajkot-Jamnagar Highway",
    pincode: "360003",
    items: [{ serviceSlug: "wash-iron", quantity: 4 }],
    paymentMethod: "upi_on_pickup",
    status: "placed",
    ageMinutes: 45,
    pickupSlot: "08:00 – 10:00",
    dropSlot: "18:00 – 20:00",
  },
  {
    code: "BL-260105",
    name: "Kunal Mehta",
    phone: "9825055567",
    address: "9, Nandanvan Row House, Gandhigram",
    pincode: "360006",
    items: [{ serviceSlug: "iron-press", quantity: 10 }],
    paymentMethod: "cod",
    status: "delivered",
    ageMinutes: 60 * 96,
    pickupSlot: "16:00 – 18:00",
    dropSlot: "10:00 – 12:00",
  },
  {
    code: "BL-260106",
    name: "Nisha Parekh",
    phone: "9825066678",
    email: "nisha.parekh@example.com",
    address: "31, Bhupendra Road, Near Globe Cinema",
    pincode: "360001",
    items: [
      { serviceSlug: "saree-dryclean", quantity: 1 },
      { serviceSlug: "wash-fold", quantity: 3 },
    ],
    paymentMethod: "upi_on_pickup",
    status: "picked_up",
    ageMinutes: 60 * 8,
    pickupSlot: "10:00 – 12:00",
    dropSlot: "16:00 – 18:00",
  },
  {
    code: "BL-260107",
    name: "Devang Amin",
    phone: "9825077789",
    address: "5, Riviera Residency, Kalawad",
    pincode: "360007",
    items: [{ serviceSlug: "wash-iron", quantity: 6 }],
    paymentMethod: "cod",
    status: "processing",
    ageMinutes: 60 * 30,
    pickupSlot: "18:00 – 20:00",
    dropSlot: "12:00 – 14:00",
  },
  {
    code: "BL-260108",
    name: "Hetal Soni",
    phone: "9825088890",
    address: "18, Soni Niwas, Danapith",
    pincode: "360020",
    items: [{ serviceSlug: "dry-cleaning", quantity: 2 }],
    paymentMethod: "upi_on_pickup",
    status: "delivered",
    ageMinutes: 60 * 120,
    pickupSlot: "08:00 – 10:00",
    dropSlot: "18:00 – 20:00",
  },
];

function dateOnly(offsetDays: number): string {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60000);
  return date.toISOString().slice(0, 10);
}

function buildDemoOrder(spec: DemoSpec): Order {
  const createdAt = new Date(Date.now() - spec.ageMinutes * 60000).toISOString();
  const { subtotal, deliveryFee, total } = quoteFor(spec.items);
  const upto = ORDER_FLOW.indexOf(spec.status);
  const timeline = ORDER_FLOW.slice(0, upto + 1).map((step, index) => ({
    status: step,
    at: new Date(new Date(createdAt).getTime() + index * 45 * 60000).toISOString(),
    note: STATUS_COPY[step],
  }));

  return {
    id: `demo-${spec.code.toLowerCase()}`,
    code: spec.code,
    customerName: spec.name,
    phone: spec.phone,
    ...(spec.email ? { email: spec.email } : {}),
    address: spec.address,
    pincode: spec.pincode,
    items: spec.items,
    pickupDate: dateOnly(-1),
    pickupSlot: spec.pickupSlot,
    dropDate: dateOnly(2),
    dropSlot: spec.dropSlot,
    paymentMethod: spec.paymentMethod,
    subtotal,
    deliveryFee,
    total,
    status: spec.status,
    statusLocked: true,
    timeline,
    createdAt,
  };
}

/**
 * Adds the demo dataset to the shared order store (skips codes that already
 * exist) so the admin panel, tracking page and dashboards all show them.
 * Returns the number of orders added.
 */
export function seedDemoOrders(): number {
  if (typeof window === "undefined") return 0;
  const existing = new Set(readOrdersRaw().map((order) => order.code));
  const fresh = DEMO_SPECS.filter((spec) => !existing.has(spec.code)).map(buildDemoOrder);
  if (fresh.length > 0) {
    window.localStorage.setItem(
      "bl.orders",
      JSON.stringify([...readOrdersRaw(), ...fresh]),
    );
  }
  return fresh.length;
}

function readOrdersRaw(): Order[] {
  try {
    const raw = window.localStorage.getItem("bl.orders");
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}
