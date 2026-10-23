import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { formatINR } from "@/lib/laundry/pricing";
import { CATEGORY_LABELS, SERVICE_PINCODES, SERVICES } from "@/lib/laundry/services";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Price List — Jay Mahakali Laundry Rajkot" },
      {
        name: "description",
        content:
          "Transparent laundry pricing in Rajkot: wash & fold ₹69/kg, wash & iron ₹89/kg, dry cleaning from ₹199, iron press ₹15/piece and saree roll polish ₹149.",
      },
      { property: "og:title", title: "Laundry & Dry Cleaning Price List — Jay Mahakali Laundry Rajkot" },
      {
        property: "og:description",
        content:
          "Per-kg and per-piece rates for wash & fold, dry cleaning, iron press and saree roll polish, with turnaround times.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky">Services</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-balance-tight sm:text-5xl">
          Everything we clean, and exactly what it costs
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Pickup and delivery are always free. Weights are measured on a certified digital scale in
          front of you, and per-piece items are counted on your digital receipt.
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {SERVICES.map((service) => (
          <Card key={service.slug} className="border-border/70 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="border-0">
                    {CATEGORY_LABELS[service.category]}
                  </Badge>
                  <h2 className="mt-3 font-display text-xl font-semibold">{service.name}</h2>
                  <p className="mt-1 text-sm text-sky">{service.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold">{formatINR(service.price)}</p>
                  <p className="text-xs text-muted-foreground">per {service.unit}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <ul className="mt-5 space-y-2">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" /> {highlight}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                <span className="text-xs text-muted-foreground">
                  Turnaround: {service.turnaround}
                </span>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/book" search={{ service: service.slug }}>
                    Book this <ArrowRight />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Price list at a glance</h2>
        <Card className="mt-5 overflow-hidden border-border/70 shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Turnaround</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SERVICES.map((service) => (
                <TableRow key={service.slug}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {CATEGORY_LABELS[service.category]}
                  </TableCell>
                  <TableCell>
                    {formatINR(service.price)} / {service.unit}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {service.turnaround}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      <section className="mt-16 rounded-3xl bg-secondary/60 p-8 sm:p-10">
        <h2 className="font-display text-2xl font-semibold">Pincodes we serve in Rajkot</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Not on the list? Book anyway and our team will confirm coverage on call.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {SERVICE_PINCODES.map((pincode) => (
            <Badge key={pincode} variant="outline" className="bg-card">
              {pincode}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
