import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

import { OrderTimeline } from "@/components/laundry/order-timeline";
import { StatusBadge } from "@/components/laundry/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/lib/api/orders";
import { useAuth } from "@/lib/auth/auth-context";
import { formatINR } from "@/lib/laundry/pricing";
import { getService } from "@/lib/laundry/services";
import { ORDER_FLOW } from "@/lib/laundry/status";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My Laundry Orders — Jay Mahakali Laundry Dashboard" },
      {
        name: "description",
        content:
          "View your Jay Mahakali Laundry order history, live pickup and delivery status, and amounts payable in one dashboard.",
      },
      { property: "og:title", content: "My Laundry Orders — Jay Mahakali Laundry Dashboard" },
      {
        property: "og:description",
        content: "Live status, schedules and invoices for every laundry order you have placed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.navigate({ to: "/login" });
  }, [ready, user, router]);

  const { data: orders, isPending } = useQuery({
    queryKey: ["orders", "mine", user?.id ?? "guest"],
    queryFn: () => ordersApi.listMine(),
    enabled: Boolean(user),
  });

  const active = (orders ?? []).filter((order) => order.status !== "delivered");
  const spend = (orders ?? []).reduce((sum, order) => sum + order.total, 0);

  if (!ready || !user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-sky">Dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Hello, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as {user.phone} · Rajkot service area
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/book">
            New pickup <ArrowRight />
          </Link>
        </Button>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[
          ["Total orders", String(orders?.length ?? 0)],
          ["Active orders", String(active.length)],
          ["Lifetime value", formatINR(spend)],
        ].map(([label, value]) => (
          <Card key={label} className="border-border/70 shadow-soft">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-14 font-display text-2xl font-semibold">Order history</h2>

      {isPending ? (
        <Skeleton className="mt-5 h-48 w-full" />
      ) : (orders ?? []).length === 0 ? (
        <Card className="mt-5 border-dashed shadow-none">
          <CardContent className="p-12 text-center">
            <PackageSearch className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-4 font-medium">No orders yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Book your first free pickup and it will show up here with live tracking.
            </p>
            <Button variant="hero" className="mt-6" asChild>
              <Link to="/book">Schedule a pickup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-5 space-y-5">
          {(orders ?? []).map((order) => (
            <Card key={order.id} className="border-border/70 shadow-soft">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-semibold">{order.code}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.items
                        .map((item) => {
                          const service = getService(item.serviceSlug);
                          return service
                            ? `${service.name} × ${item.quantity} ${service.unit}`
                            : item.serviceSlug;
                        })
                        .join(" · ")}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pickup {order.pickupDate} · {order.pickupSlot} — Delivery {order.dropDate} ·{" "}
                      {order.dropSlot}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="mt-2 font-display text-lg font-semibold">
                      {formatINR(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Step {ORDER_FLOW.indexOf(order.status) + 1} of {ORDER_FLOW.length}
                    </p>
                  </div>
                </div>
                <div className="mt-8 border-t border-border pt-8">
                  <OrderTimeline order={order} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
