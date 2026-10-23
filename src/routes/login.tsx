import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Jay Mahakali Laundry Customer Account" },
      {
        name: "description",
        content:
          "Sign in to your Jay Mahakali Laundry account to view past laundry orders, invoices and live pickup status.",
      },
      { property: "og:title", content: "Sign In — Jay Mahakali Laundry" },
      {
        property: "og:description",
        content: "Access your laundry order history and live tracking in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setSubmitting(true);
    try {
      await signIn({ name, phone: phone.trim() });
      toast.success("Signed in. Welcome back!");
      router.navigate({ to: "/dashboard" });
    } catch {
      toast.error("Could not sign you in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the mobile number you booked with to see your orders and invoices.
      </p>

      <Card className="mt-8 border-border/70 shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              <LogIn /> {submitting ? "Signing in…" : "Continue"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              OTP verification and password sign-in are handled by the Laravel auth API once it is
              connected.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
