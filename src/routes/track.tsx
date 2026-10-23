import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { OrderTimeline } from "@/components/laundry/order-timeline";
import { StatusBadge } from "@/components/laundry/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ordersApi } from "@/lib/api/orders";
import { formatINR } from "@/lib/laundry/pricing";
import { getService } from "@/lib/laundry/services";
import type { Order } from "@/lib/laundry/types";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Laundry Order — Jay Mahakali Laundry Rajkot" },
      {
        name: "description",
        content:
          "Enter your Jay Mahakali Laundry order code to see live pickup, washing, quality check and delivery status for your garments.",
      },
      { property: "og:title", content: "Track Your Laundry Order — Jay Mahakali Laundry" },
      {
        property: "og:description",
        content: "Live status for every stage: picked up, processing, quality check and delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) {
      toast.error("Enter your order code to continue.");
      return;
    }
    setLoading(true);
    const found = await ordersApi.findByCode(code);
    setOrder(found);
    setSearched(true);
    setLoading(false);
    if (!found) toast.error("No order found with that code.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-sky">Order tracking</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Where are my clothes?</h1>
        <p className="mt-3 text-muted-foreground">
          Your order code looks like <span className="font-medium text-foreground">JM-261234</span>{" "}
          and is on the confirmation screen and your SMS receipt.
        </p>
      </header>

      <Card className="mt-8 border-border/70 shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="code">Order code</Label>
              <Input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="JM-261234"
                className="mt-2"
                autoComplete="off"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={loading}>
              <Search /> {loading ? "Searching…" : "Track order"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {order ? (
        <Card className="mt-8 border-border/70 shadow-soft">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-semibold">{order.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed{" "}
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Pickup</dt>
                <dd className="mt-1 text-sm font-medium">
                  {order.pickupDate} · {order.pickupSlot}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Delivery</dt>
                <dd className="mt-1 text-sm font-medium">
                  {order.dropDate} · {order.dropSlot}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Items</dt>
                <dd className="mt-1 text-sm">
                  {order.items
                    .map((item) => {
                      const service = getService(item.serviceSlug);
                      return service
                        ? `${service.name} × ${item.quantity} ${service.unit}`
                        : item.serviceSlug;
                    })
                    .join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payable</dt>
                <dd className="mt-1 font-display text-lg font-semibold">
                  {formatINR(order.total)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Payment</dt>
                <dd className="mt-1 text-sm font-medium">
                  {order.paymentMethod === "cod" ? "Cash on delivery" : "UPI on pickup"}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-border pt-8">
              <OrderTimeline order={order} />
            </div>
          </CardContent>
        </Card>
      ) : searched ? (
        <Card className="mt-8 border-dashed border-border shadow-none">
          <CardContent className="p-10 text-center">
            <p className="font-medium">We couldn&apos;t find that order</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Double-check the code, or book a fresh pickup and we&apos;ll take it from there.
            </p>
            <Button variant="hero" className="mt-6" asChild>
              <Link to="/book">Schedule a pickup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
