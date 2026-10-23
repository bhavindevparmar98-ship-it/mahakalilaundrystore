import { ORDER_FLOW } from "@/lib/laundry/status";
import type { Order, OrderStatus } from "@/lib/laundry/types";

const ORDERS_KEY = "bl.orders";

function read(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function localReadOrders(): Order[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function localSaveOrder(order: Order) {
  write([...read().filter((existing) => existing.id !== order.id), order]);
}

export function localFindByCode(code: string): Order | undefined {
  const needle = code.trim().toUpperCase();
  return read().find((order) => order.code.toUpperCase() === needle);
}

/**
 * Demo-only progression so tracking looks alive before the Laravel API is wired.
 * One step forward per 20 minutes since the order was placed.
 */
export function projectedStatus(order: Order): OrderStatus {
  if (order.statusLocked) return order.status;
  const minutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;
  const steps = Math.min(ORDER_FLOW.length - 1, Math.floor(minutes / 20));
  return ORDER_FLOW[steps] ?? "placed";
}
