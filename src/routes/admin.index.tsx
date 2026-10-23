import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, DatabaseZap, IndianRupee, Package, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/laundry/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, readAdminSession } from "@/lib/api/admin";
import { usingRemoteApi } from "@/lib/api/client";
import { formatINR } from "@/lib/laundry/pricing";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Jay Mahakali Laundry" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const session = readAdminSession();

  const { data: orders = [], isPending } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders.list(),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => adminApi.customers.list(),
  });

  const today = new Date().toISOString().slice(0, 10);
  const active = orders.filter((order) => order.status !== "delivered");
  const todaysOrders = orders.filter((order) => order.createdAt.slice(0, 10) === today);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const recent = orders.slice(0, 6);

  const stats: { label: string; value: string; icon: typeof Package }[] = [
    { label: "Today's bookings", value: String(todaysOrders.length), icon: Package },
    { label: "Active orders", value: String(active.length), icon: TrendingUp },
    { label: "Booking value", value: formatINR(revenue), icon: IndianRupee },
    { label: "Customers", value: String(customers.length), icon: Users },
  ];

  const handleSeed = () => {
    const added = adminApi.seedDemoData();
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    toast.success(added > 0 ? `Added ${added} demo orders.` : "Demo data already loaded.");
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of bookings, pickups and deliveries.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/admin/orders">
            Manage orders <ArrowRight />
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70 shadow-soft">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-2xl font-semibold">{stat.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky/15 text-primary">
                <stat.icon className="h-5 w-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {!usingRemoteApi && (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/15 text-primary">
                <DatabaseZap className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-semibold">Demo dataset</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This panel is running on browser storage. Load sample orders and customers to see
                  it in action — connect the Laravel API to manage live data.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSeed}>
              Load demo data
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/70 shadow-soft">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent orders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>

          {isPending ? (
            <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>
          ) : recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No bookings yet. Load the demo dataset above or wait for live orders.
            </p>
          ) : (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-display font-semibold">{order.code}</TableCell>
                    <TableCell>
                      <span className="block">{order.customerName}</span>
                      <span className="block text-xs text-muted-foreground">{order.phone}</span>
                    </TableCell>
                    <TableCell className="text-right">{formatINR(order.total)}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {session && (
        <p className="text-xs text-muted-foreground">
          Signed in as {session.name} ({session.role}). Access to customers and staff sections is
          limited by role.
        </p>
      )}
    </div>
  );
}
