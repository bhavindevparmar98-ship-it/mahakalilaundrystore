import { apiFetch, usingRemoteApi } from "./client";
import { localFindByCode, localReadOrders, localSaveOrder, projectedStatus } from "./local-store";
import { quoteFor } from "@/lib/laundry/pricing";
import { ORDER_FLOW, STATUS_COPY } from "@/lib/laundry/status";
import type { BookingItem, Order, OrderStatus, PaymentMethod } from "@/lib/laundry/types";

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  items: BookingItem[];
  pickupDate: string;
  pickupSlot: string;
  dropDate: string;
  dropSlot: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

function newCode(): string {
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `JM-${new Date().getFullYear().toString().slice(2)}${random}`;
}

function buildTimeline(status: OrderStatus, createdAt: string) {
  const upto = ORDER_FLOW.indexOf(status);
  return ORDER_FLOW.slice(0, upto + 1).map((step, index) => ({
    status: step,
    at: new Date(new Date(createdAt).getTime() + index * 20 * 60000).toISOString(),
    note: STATUS_COPY[step],
  }));
}

function hydrate(order: Order): Order {
  const status = projectedStatus(order);
  return { ...order, status, timeline: buildTimeline(status, order.createdAt) };
}

export const ordersApi = {
  async create(input: CreateOrderInput): Promise<Order> {
    if (usingRemoteApi) {
      return apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(input) });
    }

    const { subtotal, deliveryFee, total } = quoteFor(input.items);
    const createdAt = new Date().toISOString();
    const order: Order = {
      ...input,
      id: crypto.randomUUID(),
      code: newCode(),
      subtotal,
      deliveryFee,
      total,
      status: "placed",
      timeline: buildTimeline("placed", createdAt),
      createdAt,
    };
    localSaveOrder(order);
    return order;
  },

  async listMine(): Promise<Order[]> {
    if (usingRemoteApi) return apiFetch<Order[]>("/orders");
    return localReadOrders().map(hydrate);
  },

  async findByCode(code: string): Promise<Order | null> {
    if (usingRemoteApi) {
      try {
        return await apiFetch<Order>(`/orders/track/${encodeURIComponent(code)}`);
      } catch {
        return null;
      }
    }
    const found = localFindByCode(code);
    return found ? hydrate(found) : null;
  },
};
