import { Check, CircleDashed } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { ORDER_FLOW, STATUS_COPY, STATUS_LABELS, progressPercent } from "@/lib/laundry/status";
import type { Order } from "@/lib/laundry/types";
import { cn } from "@/lib/utils";

export function OrderTimeline({ order }: { order: Order }) {
  const currentIndex = ORDER_FLOW.indexOf(order.status);

  return (
    <div>
      <Progress value={progressPercent(order.status)} className="h-2" />
      <ol className="mt-6 space-y-5">
        {ORDER_FLOW.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          const entry = order.timeline.find((item) => item.status === step);
          return (
            <li key={step} className="flex gap-4">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-smooth",
                  done
                    ? "border-transparent bg-gradient-brand text-primary-foreground shadow-soft"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
              </span>
              <div className="pb-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {STATUS_LABELS[step]}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{STATUS_COPY[step]}</p>
                {entry ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(entry.at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
