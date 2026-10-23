import { createFileRoute, Link, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { adminAuth, canAccess, readAdminSession, type AdminSection } from "@/lib/api/admin";
import { BRAND_NAME } from "@/lib/brand";
import type { AdminRole, AdminUser } from "@/lib/laundry/types";

const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Owner",
  manager: "Manager",
  staff: "Staff",
};

interface NavItem {
  to: string;
  label: string;
  section: AdminSection;
  icon: typeof Package;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", section: "dashboard", icon: LayoutDashboard },
  { to: "/admin/orders", label: "Orders & bookings", section: "orders", icon: Package },
  { to: "/admin/customers", label: "Customers", section: "customers", icon: Users },
  { to: "/admin/staff", label: "Staff", section: "staff", icon: UserCog },
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    if (!readAdminSession()) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function NavLinks({
  items,
  onNavigate,
  className = "",
}: {
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={className}>
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/admin" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function AdminLayout() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(readAdminSession());
  }, []);

  const items = NAV.filter((item) => user && canAccess(user.role, item.section));

  const handleSignOut = async () => {
    await adminAuth.signOut();
    setUser(null);
    setOpen(false);
    router.navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — Filament-style navy rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-soft">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-semibold">{BRAND_NAME}</span>
            <span className="block text-[11px] font-medium tracking-wide text-sidebar-foreground/60">
              Admin panel
            </span>
          </span>
        </div>
        <NavLinks items={items} className="flex-1 space-y-1 px-3" />
        {user && (
          <div className="border-t border-sidebar-border p-4">
            <p className="truncate font-display text-sm font-semibold">{user.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sidebar-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5 text-sidebar-primary" />
              {ROLE_LABEL[user.role]} access
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="mt-3 w-full justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut /> Sign out
            </Button>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open admin menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[17rem] bg-sidebar text-sidebar-foreground">
                <SheetTitle className="flex items-center gap-2 font-display text-base">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </span>
                  Admin panel
                </SheetTitle>
                <NavLinks items={items} onNavigate={() => setOpen(false)} className="mt-6 flex flex-col gap-1" />
                <Button
                  variant="ghost"
                  className="mt-6 w-full justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut /> Sign out
                </Button>
              </SheetContent>
            </Sheet>
            <span className="font-display text-sm font-semibold">{BRAND_NAME}</span>
          </div>

          <p className="hidden font-display text-sm font-medium text-muted-foreground lg:block">
            Operations control centre
          </p>

          {user && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="border-0 bg-sky/20 text-primary">
                {ROLE_LABEL[user.role]}
              </Badge>
              <span className="hidden font-display text-sm font-semibold sm:block">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          )}
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
