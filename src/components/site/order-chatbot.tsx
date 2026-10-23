import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ordersApi } from "@/lib/api/orders";
import { BRAND_EMAIL, BRAND_NAME, BRAND_PHONE } from "@/lib/brand";
import { formatINR, quoteFor } from "@/lib/laundry/pricing";
import { PICKUP_SLOTS, SERVICES, getService } from "@/lib/laundry/services";
import type { BookingItem, PaymentMethod } from "@/lib/laundry/types";

type Step =
  | "service"
  | "quantity"
  | "more"
  | "name"
  | "phone"
  | "address"
  | "pincode"
  | "slot"
  | "payment"
  | "confirm"
  | "done";

interface Message {
  from: "bot" | "user";
  text: string;
}

interface Draft {
  items: BookingItem[];
  currentService: string | null;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  slot: string;
  payment: PaymentMethod;
}

const EMPTY_DRAFT: Draft = {
  items: [],
  currentService: null,
  name: "",
  phone: "",
  address: "",
  pincode: "",
  slot: PICKUP_SLOTS[0],
  payment: "cod",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on pickup",
  upi_on_pickup: "UPI on pickup",
};

const WELCOME: Message[] = [
  {
    from: "bot",
    text: `Namaste! 🙏 Welcome to ${BRAND_NAME}. I can place a free pickup order for you right here.`,
  },
  { from: "bot", text: "Which service would you like to book?" },
];

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function summaryLines(draft: Draft): string {
  const lines = draft.items.map((item) => {
    const service = getService(item.serviceSlug);
    return `• ${service?.name ?? item.serviceSlug} × ${item.quantity} ${service?.unit === "kg" ? "kg" : "pcs"}`;
  });
  const quote = quoteFor(draft.items);
  return [
    ...lines,
    `Total: ${formatINR(quote.total)} (pickup & delivery free)`,
    `Name: ${draft.name}`,
    `Phone: ${draft.phone}`,
    `Address: ${draft.address} - ${draft.pincode}`,
    `Pickup: tomorrow, ${draft.slot}`,
    `Payment: ${PAYMENT_LABEL[draft.payment]}`,
  ].join("\n");
}

export function OrderChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(WELCOME);
  const [step, setStep] = useState<Step>("service");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, step, open]);

  const say = (...texts: string[]) =>
    setMessages((current) => [...current, ...texts.map((text) => ({ from: "bot" as const, text }))]);
  const userSays = (text: string) =>
    setMessages((current) => [...current, { from: "user", text }]);

  const reset = () => {
    setMessages(WELCOME);
    setDraft(EMPTY_DRAFT);
    setStep("service");
    setInput("");
  };

  const chooseService = (slug: string) => {
    const service = getService(slug);
    if (!service) return;
    userSays(service.name);
    setDraft((current) => ({ ...current, currentService: slug }));
    setStep("quantity");
    say(
      `${service.name} is ${formatINR(service.price)} per ${service.unit}. How many ${
        service.unit === "kg" ? "kilograms" : "pieces"
      }?`,
    );
  };

  const chooseSlot = (slot: string) => {
    userSays(slot);
    setDraft((current) => ({ ...current, slot }));
    setStep("payment");
    say("How would you like to pay?");
  };

  const choosePayment = (payment: PaymentMethod) => {
    userSays(PAYMENT_LABEL[payment]);
    const next = { ...draft, payment };
    setDraft(next);
    setStep("confirm");
    say("Please confirm your order:", summaryLines(next));
  };

  const confirmOrder = async () => {
    userSays("Confirm order");
    setBusy(true);
    try {
      const order = await ordersApi.create({
        customerName: draft.name,
        phone: draft.phone,
        address: draft.address,
        pincode: draft.pincode,
        items: draft.items,
        pickupDate: dateOffset(1),
        pickupSlot: draft.slot,
        dropDate: dateOffset(3),
        dropSlot: PICKUP_SLOTS[3],
        paymentMethod: draft.payment,
        notes: "Placed via website chatbot",
      });
      setStep("done");
      say(
        `✅ Order placed! Your order code is ${order.code}. Use it on the Track order page to follow your laundry.`,
        `Questions? Call ${BRAND_PHONE} or email ${BRAND_EMAIL}.`,
      );
      toast.success(`Pickup confirmed — order ${order.code}`);
    } catch {
      say("Sorry, we couldn't place the order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleText = (event: React.FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    if (step === "quantity") {
      const quantity = Number(value);
      if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 500) {
        userSays(value);
        setInput("");
        say("Please enter a valid quantity (a number like 3).");
        return;
      }
      userSays(value);
      setDraft((current) => {
        const slug = current.currentService;
        if (!slug) return current;
        const others = current.items.filter((item) => item.serviceSlug !== slug);
        return {
          ...current,
          currentService: null,
          items: [...others, { serviceSlug: slug, quantity }],
        };
      });
      setStep("more");
      say("Added to your basket. Anything else?");
    } else if (step === "name") {
      userSays(value);
      setDraft((current) => ({ ...current, name: value }));
      setStep("phone");
      say("Thanks! What is your 10-digit mobile number?");
    } else if (step === "phone") {
      userSays(value);
      if (!/^[6-9]\d{9}$/.test(value)) {
        say("That doesn't look right. Please enter a valid 10-digit Indian mobile number.");
      } else {
        setDraft((current) => ({ ...current, phone: value }));
        setStep("address");
        say("Please share your complete pickup address.");
      }
    } else if (step === "address") {
      userSays(value);
      if (value.length < 10) {
        say("Please enter a more complete address (house no, society, area).");
      } else {
        setDraft((current) => ({ ...current, address: value }));
        setStep("pincode");
        say("And your 6-digit pincode?");
      }
    } else if (step === "pincode") {
      userSays(value);
      if (!/^\d{6}$/.test(value)) {
        say("Please enter a valid 6-digit pincode.");
      } else {
        setDraft((current) => ({ ...current, pincode: value }));
        setStep("slot");
        say("Choose a pickup time slot for tomorrow:");
      }
    } else {
      return;
    }
    setInput("");
  };

  const textStep = step === "quantity" || step === "name" || step === "phone" || step === "address" || step === "pincode";
  const placeholder =
    step === "quantity"
      ? "Enter quantity"
      : step === "name"
        ? "Your name"
        : step === "phone"
          ? "Mobile number"
          : step === "address"
            ? "Pickup address"
            : "Pincode";

  const chip =
    "rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          role="dialog"
          aria-label={`${BRAND_NAME} order assistant`}
          className="flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lift"
        >
          <div className="flex items-center justify-between bg-gradient-brand px-4 py-3 text-primary-foreground">
            <div>
              <p className="font-display text-sm font-semibold">{BRAND_NAME}</p>
              <p className="text-xs opacity-85">Order assistant · {BRAND_PHONE}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 hover:bg-white/15"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={message.from === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                    message.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground shadow-soft"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {step === "service" && (
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    className={chip}
                    onClick={() => chooseService(service.slug)}
                  >
                    {service.name} · {formatINR(service.price)}/{service.unit}
                  </button>
                ))}
              </div>
            )}

            {step === "more" && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={chip}
                  onClick={() => {
                    userSays("Add another service");
                    setStep("service");
                    say("Sure! Which service?");
                  }}
                >
                  Add another service
                </button>
                <button
                  type="button"
                  className={chip}
                  onClick={() => {
                    userSays("Continue");
                    setStep("name");
                    say("Great! May I have your name?");
                  }}
                >
                  Continue
                </button>
              </div>
            )}

            {step === "slot" && (
              <div className="flex flex-wrap gap-2">
                {PICKUP_SLOTS.map((slot) => (
                  <button key={slot} type="button" className={chip} onClick={() => chooseSlot(slot)}>
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {step === "payment" && (
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={chip}
                    onClick={() => choosePayment(method)}
                  >
                    {PAYMENT_LABEL[method]}
                  </button>
                ))}
              </div>
            )}

            {step === "confirm" && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="hero" disabled={busy} onClick={confirmOrder}>
                  {busy ? "Placing…" : "Confirm order"}
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={reset}>
                  Start over
                </Button>
              </div>
            )}

            {step === "done" && (
              <Button size="sm" variant="outline" onClick={reset}>
                Place another order
              </Button>
            )}
            <div ref={endRef} />
          </div>

          {textStep && (
            <form onSubmit={handleText} className="flex gap-2 border-t border-border bg-background p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                inputMode={step === "quantity" || step === "phone" || step === "pincode" ? "numeric" : "text"}
                autoFocus
                className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send />
              </Button>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close order chat" : "Open order chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
