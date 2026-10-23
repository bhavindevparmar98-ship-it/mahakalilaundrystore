import type { OrderStatus } from "./types";

export const ORDER_FLOW: OrderStatus[] = [
  "placed",
  "picked_up",
  "processing",
  "quality_check",
  "out_for_delivery",
  "delivered",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  picked_up: "Picked up",
  processing: "In processing",
  quality_check: "Quality check",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export const STATUS_COPY: Record<OrderStatus, string> = {
  placed: "We have your booking. A pickup partner is being assigned.",
  picked_up: "Your clothes are with our pickup partner and on the way to the unit.",
  processing: "Washing, dry cleaning and pressing in progress.",
  quality_check: "Final inspection, spot check and packing.",
  out_for_delivery: "On the way back to your doorstep.",
  delivered: "Delivered. Thank you for choosing us.",
};

export function progressPercent(status: OrderStatus): number {
  const index = ORDER_FLOW.indexOf(status);
  return Math.round(((index + 1) / ORDER_FLOW.length) * 100);
}
