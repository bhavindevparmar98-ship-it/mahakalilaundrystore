import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ordersApi } from "@/lib/api/orders";
import { useAuth } from "@/lib/auth/auth-context";
import { formatINR, lineTotal, quoteFor } from "@/lib/laundry/pricing";
import { PICKUP_SLOTS, SERVICES, getService } from "@/lib/laundry/services";
import type { BookingItem, Order, PaymentMethod } from "@/lib/laundry/types";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>) => ({
    service: typeof search["service"] === "string" ? (search["service"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book a Free Laundry Pickup in Rajkot — Jay Mahakali Laundry" },
      {
        name: "description",
        content:
          "Schedule a free laundry pickup and drop in Rajkot in under a minute. Choose services, pick a two-hour slot and pay by cash or UPI.",
      },
      { property: "og:title", content: "Book a Free Laundry Pickup — Jay Mahakali Laundry Rajkot" },
      {
        property: "og:description",
        content: "Pick your services, choose a pickup slot and we handle the rest. No delivery fee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function BookPage() {
  const { service: preselected } = Route.useSearch();
  const { user } = useAuth();
  const router = useRouter();

  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    preselected && getService(preselected) ? { [preselected]: 1 } : {},
  );
  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [pickupDate, setPickupDate] = useState(todayPlus(1));
  const [pickupSlot, setPickupSlot] = useState<string>(PICKUP_SLOTS[0]);
  const [dropDate, setDropDate] = useState(todayPlus(3));
  const [dropSlot, setDropSlot] = useState<string>(PICKUP_SLOTS[3]);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const items: BookingItem[] = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([serviceSlug, quantity]) => ({ serviceSlug, quantity })),
    [quantities],
  );
  const quote = quoteFor(items);

  const step = (slug: string, delta: number) =>
    setQuantities((current) => {
      const next = Math.max(0, (current[slug] ?? 0) + delta);
      return { ...current, [slug]: next };
    });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Add at least one service to your basket.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Please tell us your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (address.trim().length < 10) {
      toast.error("Please enter a complete pickup address.");
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error("Enter a valid 6-digit pincode.");
      return;
    }
    if (dropDate < pickupDate) {
      toast.error("Delivery date cannot be before the pickup date.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        customerName: customerName.trim(),
        phone: phone.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        address: address.trim(),
        pincode: pincode.trim(),
        items,
        pickupDate,
        pickupSlot,
        dropDate,
        dropSlot,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        paymentMethod,
      });
      setPlaced(order);
      toast.success(`Pickup confirmed — order ${order.code}`);
    } catch {
      toast.error("We couldn't place that booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <Card className="border-border/70 shadow-lift">
          <CardContent className="p-8 text-center sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-6 font-display text-2xl font-semibold">Pickup scheduled</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save your order code — you can track every stage with it.
            </p>
            <p className="mt-6 font-display text-3xl font-semibold text-sky">{placed.code}</p>
            <dl className="mt-8 space-y-3 rounded-2xl bg-secondary/60 p-5 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Pickup</dt>
                <dd className="font-medium">
                  {placed.pickupDate} · {placed.pickupSlot}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium">
                  {placed.dropDate} · {placed.dropSlot}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payable</dt>
                <dd className="font-display text-base font-semibold">
                  {formatINR(placed.total)}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="hero" size="lg" className="flex-1" onClick={() => router.navigate({ to: "/track" })}>
                Track this order
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setPlaced(null)}>
                Book another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky">Book a pickup</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Schedule your free pickup</h1>
        <p className="mt-3 text-muted-foreground">
          Approximate quantities are fine — we weigh and count everything at your door and update the
          invoice before washing.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Card className="border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">1. Choose services</h2>
              <div className="mt-5 space-y-3">
                {SERVICES.map((service) => {
                  const quantity = quantities[service.slug] ?? 0;
                  return (
                    <div
                      key={service.slug}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-smooth hover:border-sky/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatINR(service.price)} / {service.unit} · {service.turnaround}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Reduce ${service.name}`}
                          onClick={() => step(service.slug, -1)}
                          disabled={quantity === 0}
                        >
                          <Minus />
                        </Button>
                        <span className="w-14 text-center text-sm font-semibold">
                          {quantity} {quantity > 0 ? service.unit : ""}
                        </span>
                        <Button
                          type="button"
                          variant="sky"
                          size="icon"
                          aria-label={`Add ${service.name}`}
                          onClick={() => step(service.slug, 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">2. Pickup &amp; drop schedule</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pickupDate">Pickup date</Label>
                  <Input
                    id="pickupDate"
                    type="date"
                    min={todayPlus(0)}
                    value={pickupDate}
                    onChange={(event) => setPickupDate(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupSlot">Pickup slot</Label>
                  <Select value={pickupSlot} onValueChange={setPickupSlot}>
                    <SelectTrigger id="pickupSlot" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dropDate">Delivery date</Label>
                  <Input
                    id="dropDate"
                    type="date"
                    min={pickupDate}
                    value={dropDate}
                    onChange={(event) => setDropDate(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="dropSlot">Delivery slot</Label>
                  <Select value={dropSlot} onValueChange={setDropSlot}>
                    <SelectTrigger id="dropSlot" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">3. Contact &amp; address</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="customerName">Full name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Jay Patel"
                    className="mt-2"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="9825000000"
                    inputMode="numeric"
                    maxLength={10}
                    className="mt-2"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    onChange={(event) => setPincode(event.target.value)}
                    placeholder="360005"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-2"
                    autoComplete="postal-code"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Pickup address</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Flat / house no, building, street, landmark, Rajkot"
                    className="mt-2"
                    rows={3}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Special instructions (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ring the bell twice, handle the silk saree separately…"
                    className="mt-2"
                    rows={2}
                    maxLength={500}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-semibold">4. Payment</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                {[
                  { value: "cod", title: "Cash on delivery", body: "Pay in cash when we hand over your clothes." },
                  { value: "upi_on_pickup", title: "UPI on pickup", body: "Scan and pay our partner's UPI QR at your door." },
                ].map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-smooth has-[[data-state=checked]]:border-sky has-[[data-state=checked]]:bg-accent"
                  >
                    <RadioGroupItem id={option.value} value={option.value} className="mt-0.5" />
                    <span>
                      <span className="block text-sm font-semibold">{option.title}</span>
                      <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {option.body}
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              <p className="mt-4 text-xs text-muted-foreground">
                Razorpay online payment will appear here once the merchant account is connected.
              </p>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border/70 shadow-lift">
            <CardContent className="p-6">
              <h2 className="font-display text-lg font-semibold">Your basket</h2>
              {items.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Nothing added yet. Pick a service to see your estimate.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {items.map((item) => {
                    const service = getService(item.serviceSlug);
                    if (!service) return null;
                    return (
                      <li key={item.serviceSlug} className="flex justify-between gap-3 text-sm">
                        <span>
                          {service.name}
                          <span className="block text-xs text-muted-foreground">
                            {item.quantity} {service.unit} × {formatINR(service.price)}
                          </span>
                        </span>
                        <span className="font-medium">{formatINR(lineTotal(item))}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatINR(quote.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pickup &amp; delivery</dt>
                  <dd className="text-success">Free</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <dt className="font-semibold">Estimated total</dt>
                  <dd className="font-display text-lg font-semibold">{formatINR(quote.total)}</dd>
                </div>
              </dl>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                disabled={submitting}
              >
                {submitting ? "Confirming…" : "Confirm pickup"} <ArrowRight />
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Final invoice is generated after weighing at pickup.
              </p>
            </CardContent>
          </Card>
        </aside>
      </form>
    </div>
  );
}
