import { DELIVERY_FEE } from "./services";
import { getService } from "./services";
import type { BookingItem } from "./types";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function lineTotal(item: BookingItem): number {
  const service = getService(item.serviceSlug);
  if (!service) return 0;
  return service.price * item.quantity;
}

export function quoteFor(items: BookingItem[]) {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
