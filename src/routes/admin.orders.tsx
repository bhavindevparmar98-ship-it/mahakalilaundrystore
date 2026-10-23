import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/laundry/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/lib/api/admin";
import { formatINR } from "@/lib/laundry/pricing";
import { ORDER_FLOW, STATUS_LABELS } from "@/lib/laundry/status";
import type { OrderStatus } from "@/lib/laundry/types";
import { getService } from "@/lib/laundry/services";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders & Bookings — Jay Mahakali Laundry" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOrders,
});

function formatDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
        parsed,
      );
}

function AdminOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: orders = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.orders.list(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.orders.updateStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "customers"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
      toast.success("Order status updated.");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not update order status.");
    },
  });

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        !query ||
        [
          order.code,
          order.customerName,
          order.phone,
          ...order.items.map((item) => getService(item.serviceSlug)?.name ?? item.serviceSlug),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Orders & bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review customer bookings and keep each order&apos;s progress up to date.
        </p>
      </header>

      <Card className="border-border/70 shadow-soft">
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order, customer, phone or service"
                aria-label="Search orders"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-56" aria-label="Filter orders by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_FLOW.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading orders…</p>
          ) : isError ? (
            <div className="py-8 text-center">
              <p className="text-sm text-destructive">Orders could not be loaded.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })}
              >
                Try again
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {orders.length === 0
                ? "No bookings yet. New customer bookings will appear here."
                : "No orders match your search or status filter."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="whitespace-nowrap">
                        <span className="block font-display font-semibold">{order.code}</span>
                        <span className="text-xs text-muted-foreground">
                          Booked {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block whitespace-nowrap">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">{order.phone}</span>
                      </TableCell>
                      <TableCell className="min-w-40">
                        {order.items.map((item) => (
                          <span className="block text-sm" key={`${order.id}-${item.serviceSlug}`}>
                            {getService(item.serviceSlug)?.name ?? item.serviceSlug} ×{" "}
                            {item.quantity}
                          </span>
                        ))}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="block">{formatDate(order.pickupDate)}</span>
                        <span className="text-xs text-muted-foreground">{order.pickupSlot}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium">
                        {formatINR(order.total)}
                      </TableCell>
                      <TableCell className="min-w-48">
                        <div className="flex flex-col items-start gap-2">
                          <StatusBadge status={order.status} />
                          <Select
                            value={order.status}
                            onValueChange={(status) => {
                              const nextStatus = ORDER_FLOW.find(
                                (candidate) => candidate === status,
                              );
                              if (nextStatus)
                                updateStatus.mutate({ id: order.id, status: nextStatus });
                            }}
                            disabled={
                              updateStatus.isPending && updateStatus.variables?.id === order.id
                            }
                          >
                            <SelectTrigger
                              className="h-8 w-44 text-xs"
                              aria-label={`Update status for order ${order.code}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_FLOW.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
