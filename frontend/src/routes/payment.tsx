import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
  validateSearch: (s: Record<string, unknown>) => ({
    pickup: (s.pickup as string) || "12:40 PM",
    instructions: (s.instructions as string) || "",
  }),
});

const UPI = "quickbite@upi";

function PaymentPage() {
  const navigate = useNavigate();
  const { pickup, instructions } = Route.useSearch();
  const { cart, total, user, placeOrder, clear } = useStore();
  const [opening, setOpening] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const fee = cart.length ? 5 : 0;
  const grand = total + fee;

  const apps = [
    { id: "phonepe", name: "PhonePe", color: "#5F259F", emoji: "📱" },
    { id: "gpay", name: "Google Pay", color: "#1A73E8", emoji: "💸" },
    { id: "paytm", name: "Paytm", color: "#00BAF2", emoji: "💰" },
    { id: "upi", name: "Other UPI", color: "#FF6B20", emoji: "🏦" },
  ];

  const openApp = (id: string) => {
    setOpening(id);
    setTimeout(() => setOpening(null), 1800);
  };

  const copy = () => {
    navigator.clipboard.writeText(UPI);
    setCopied(true);
    toast.success("UPI ID copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const complete = () => {
    if (!user) return;
    const order = placeOrder({
      items: cart,
      total: grand,
      pickupTime: pickup,
      instructions,
      paid: true,
      customerName: user.name,
      customerPhone: user.phone,
    });
    clear();
    setCompleted(true);
    setTimeout(() => navigate({ to: "/orders", search: { highlight: order.id } }), 1200);
  };

  if (!cart.length && !completed) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <p className="text-sm font-medium">Cart is empty</p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-3 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Browse menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 h-14 flex items-center gap-2 border-b border-border/60 sticky top-0 bg-background/85 glass-blur z-10">
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Payment</span>
        <span className="ml-auto text-[12px] text-muted-foreground">
          Pickup: <span className="font-semibold text-foreground">{pickup}</span>
        </span>
      </header>

      <div className="flex-1 mx-auto w-full max-w-md px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-4 text-center shadow-[var(--shadow-soft)]"
        >
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Amount payable
          </div>
          <div className="text-3xl font-bold text-primary mt-1">₹{grand}</div>

          {/* Fake QR */}
          <div className="mt-4 mx-auto h-40 w-40 rounded-xl bg-white border-2 border-dashed border-border grid place-items-center relative overflow-hidden">
            <QrPattern />
            <div className="absolute inset-0 grid place-items-center">
              <div className="h-10 w-10 rounded-lg bg-primary grid place-items-center text-white font-bold text-xs shadow-md">
                QB
              </div>
            </div>
          </div>

          <button
            onClick={copy}
            className="mt-3 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-muted hover:bg-accent/50 text-sm font-medium"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {UPI}
          </button>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Scan QR or pay using any UPI app below
          </p>
        </motion.div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {apps.map((a) => (
            <button
              key={a.id}
              onClick={() => openApp(a.id)}
              className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1 hover:border-primary/40 active:scale-[0.97] transition relative overflow-hidden"
            >
              <div
                className="h-9 w-9 rounded-lg grid place-items-center text-lg"
                style={{ background: a.color + "15" }}
              >
                {a.emoji}
              </div>
              <span className="text-[12px] font-semibold">{a.name}</span>
              <span className="text-[10px] text-muted-foreground">Pay ₹{grand}</span>
            </button>
          ))}
        </div>

        <button
          onClick={complete}
          className="mt-4 w-full h-12 rounded-xl bg-success text-success-foreground font-semibold text-sm active:scale-[0.99] transition"
        >
          ✓ I Have Completed Payment
        </button>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          Order will move to “Payment Checking” for staff verification.
        </p>
      </div>

      {/* App opening modal */}
      <AnimatePresence>
        {opening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="bg-card rounded-2xl p-6 text-center w-72"
            >
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-3 text-sm font-semibold">
                Opening {apps.find((a) => a.id === opening)?.name}…
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Complete payment in the app, then return here.
              </p>
            </motion.div>
          </motion.div>
        )}
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220 }}
              className="bg-card rounded-2xl p-6 text-center w-72"
            >
              <div className="h-14 w-14 mx-auto rounded-full bg-success grid place-items-center">
                <Check className="h-7 w-7 text-white" />
              </div>
              <p className="mt-3 text-base font-semibold">Order Placed!</p>
              <p className="text-[12px] text-muted-foreground mt-1">Redirecting to your orders…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QrPattern() {
  // Decorative pseudo-QR
  const cells = Array.from(
    { length: 144 },
    (_, i) => Math.random() > 0.55 || [0, 1, 2, 9, 10, 11, 132, 133, 134].includes(i),
  );
  return (
    <div className="grid grid-cols-12 gap-px p-2 h-full w-full">
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-foreground" : "bg-transparent"} />
      ))}
    </div>
  );
}
