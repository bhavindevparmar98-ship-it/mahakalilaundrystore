import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Sparkles } from "lucide-react";

import { BRAND_EMAIL, BRAND_NAME, BRAND_PHONE } from "@/lib/brand";
import { SERVICES } from "@/lib/laundry/services";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky text-sky-foreground">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="font-display text-lg font-semibold">{BRAND_NAME}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-navy-foreground/70">
            Doorstep laundry, dry cleaning, iron press and saree roll polish across Rajkot. Free
            pickup and drop, transparent per-kg pricing and garment-level tracking.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-navy-foreground/80">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky" /> {BRAND_PHONE}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky" />
              <a href={`mailto:${BRAND_EMAIL}`} className="transition-smooth hover:text-sky">
                {BRAND_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky" /> 150 Feet Ring Road, Rajkot, Gujarat 360005
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky" /> Mon–Sun, 8:00 AM – 9:00 PM
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-sky">
            Services
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/75">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link to="/services" className="transition-smooth hover:text-sky">
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-sky">
            Quick links
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/75">
            <li>
              <Link to="/book" className="transition-smooth hover:text-sky">
                Schedule a pickup
              </Link>
            </li>
            <li>
              <Link to="/track" className="transition-smooth hover:text-sky">
                Track your order
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="transition-smooth hover:text-sky">
                Customer dashboard
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition-smooth hover:text-sky">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10 py-6 text-center text-xs text-navy-foreground/55">
        © {new Date().getFullYear()} {BRAND_NAME}, Rajkot. All rights reserved.
      </div>
    </footer>
  );
}
