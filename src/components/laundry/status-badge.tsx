import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/laundry/status";
import type { OrderStatus } from "@/lib/laundry/types";
import { cn } from "@/lib/utils";

const TONE: Record<OrderStatus, string> = {
  placed: "bg-secondary text-secondary-foreground",
  picked_up: "bg-sky/20 text-primary",
  processing: "bg-sky/25 text-primary",
  quality_check: "bg-warning/25 text-warning-foreground",
  out_for_delivery: "bg-sky/35 text-primary",
  delivered: "bg-success/20 text-success",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", TONE[status], className)}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
