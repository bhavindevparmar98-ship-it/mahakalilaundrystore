import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeIndianRupee,
  CalendarClock,
  Layers,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";

import heroImage from "@/assets/hero-laundry.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS, SERVICES } from "@/lib/laundry/services";
import { formatINR } from "@/lib/laundry/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jay Mahakali Laundry Rajkot — Laundry, Dry Cleaning & Saree Polish" },
      {
        name: "description",
        content:
          "Doorstep laundry in Rajkot: wash & fold from ₹69/kg, premium dry cleaning, iron press and saree roll polish. Free pickup and drop with live order tracking.",
      },
      { property: "og:title", content: "Jay Mahakali Laundry Rajkot — Doorstep Laundry & Dry Cleaning" },
      {
        property: "og:description",
        content:
          "Book a free pickup in 60 seconds. Wash & fold, dry cleaning, iron press and saree roll polish, delivered back in 48 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const PROMISES = [
  {
    icon: Truck,
    title: "Free pickup & drop",
    body: "Two-hour slots across Rajkot, seven days a week. No delivery charges, ever.",
  },
  {
    icon: CalendarClock,
    title: "48-hour turnaround",
    body: "Iron-only orders come back in 24 hours. Express same-day available on request.",
  },
  {
    icon: ShieldCheck,
    title: "Garment-level care",
    body: "Every item is tagged, sorted by fabric and inspected before it is packed.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Transparent pricing",
    body: "Per-kg and per-piece rates published upfront. Pay by cash or UPI on pickup.",
  },
];

const STEPS = [
  { title: "Book a slot", body: "Pick your services, pickup date and a two-hour time window." },
  { title: "We collect", body: "Our partner tags your clothes at the door and shares a digital receipt." },
  { title: "We clean", body: "Fabric-wise washing, dry cleaning, pressing and quality inspection." },
  { title: "We deliver", body: "Packed, pressed and back at your doorstep on your chosen slot." },
];

function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="absolute inset-0 bg-gradient-brand opacity-95" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge
              variant="secondary"
              className="border-0 bg-primary-foreground/15 text-primary-foreground backdrop-blur"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Serving all of Rajkot
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold text-balance-tight sm:text-5xl lg:text-6xl">
              Laundry day, handled.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              Wash &amp; fold, premium dry cleaning, iron press and traditional saree roll polish —
              collected from your door and returned in 48 hours.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button variant="sky" size="xl" asChild>
                <Link to="/book">
                  Schedule free pickup <ArrowRight />
                </Link>
              </Button>
              <Button variant="outlineOnBrand" size="xl" asChild>
                <Link to="/track">Track an order</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["12,400+", "Orders delivered"],
                ["4.8/5", "Customer rating"],
                ["48 hrs", "Standard turnaround"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-semibold">{value}</dt>
                  <dd className="mt-1 text-xs text-primary-foreground/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Freshly folded laundry and pressed shirts from Jay Mahakali Laundry Rajkot"
              width={1600}
              height={1200}
              className="w-full rounded-3xl shadow-lift"
            />
            <Card className="absolute -bottom-6 left-4 w-56 border-0 shadow-lift sm:left-8">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success/15 text-success">
                  <Star className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Wash &amp; fold</p>
                  <p className="text-xs text-muted-foreground">from {formatINR(69)} / kg</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-border/70 shadow-soft transition-smooth hover:shadow-lift">
              <CardContent className="p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-sky text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky">Our services</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Care for every fabric in your wardrobe
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/services">
              See full price list <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card
              key={service.slug}
              className="group border-border/70 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-lift"
            >
              <CardContent className="flex h-full flex-col p-6">
                <Badge variant="secondary" className="w-fit border-0">
                  {CATEGORY_LABELS[service.category]}
                </Badge>
                <h3 className="mt-4 font-display text-lg font-semibold">{service.name}</h3>
                <p className="mt-1 text-sm text-sky">{service.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <p className="font-display text-lg font-semibold">
                    {formatINR(service.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {service.unit}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">{service.turnaround}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky">How it works</p>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Four steps, zero laundry stress
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl bg-card p-6 shadow-soft">
                <span className="font-display text-3xl font-semibold text-sky">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Card className="overflow-hidden border-0 bg-gradient-brand text-primary-foreground shadow-lift">
          <CardContent className="flex flex-col items-start gap-6 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Layers className="h-8 w-8 text-sky" />
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                Your first pickup is on us
              </h2>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
                Book in under a minute, pay cash or UPI when we collect, and follow every stage from
                your dashboard.
              </p>
            </div>
            <Button variant="sky" size="xl" asChild>
              <Link to="/book">
                Book now <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
