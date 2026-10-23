import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminAuth, readAdminSession } from "@/lib/api/admin";
import { usingRemoteApi } from "@/lib/api/client";
import { BRAND_EMAIL, BRAND_NAME } from "@/lib/brand";
import type { AdminRole } from "@/lib/laundry/types";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  beforeLoad: () => {
    if (readAdminSession()) throw redirect({ to: "/admin" });
  },
  head: () => ({
    meta: [
      { title: "Staff Sign In — Jay Mahakali Laundry Admin Panel" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLoginPage,
});

const DEMO_ACCOUNTS: { email: string; password: string; role: AdminRole; label: string }[] = [
  { email: BRAND_EMAIL, password: "admin123", role: "admin", label: "Owner — full access" },
  {
    email: "manager@jaymahakalilaundry.in",
    password: "manager123",
    role: "manager",
    label: "Manager — orders & customers",
  },
  { email: "staff@jaymahakalilaundry.in", password: "staff123", role: "staff", label: "Staff — orders only" },
];

function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await adminAuth.signIn({ email, password });
      toast.success(`Signed in as ${user.name}`);
      router.navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand shadow-soft">
            <LockKeyhole className="h-5.5 w-5.5 text-primary-foreground" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {BRAND_NAME} operations panel · Rajkot
          </p>
        </div>

        <Card className="mt-8 border-border/70 shadow-soft">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={BRAND_EMAIL}
                  className="mt-2"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="mt-2"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in to panel"}
              </Button>
            </form>

            {!usingRemoteApi && (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts (click to fill)
                </p>
                <div className="mt-3 space-y-2">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => {
                        setEmail(account.email);
                        setPassword(account.password);
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-background px-3 py-2 text-left text-xs shadow-soft transition-smooth hover:bg-accent"
                    >
                      <span>
                        <span className="block font-medium">{account.email}</span>
                        <span className="block text-muted-foreground">{account.label}</span>
                      </span>
                      <span className="font-mono text-muted-foreground">{account.password}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">
              <ArrowLeft /> Back to store
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
