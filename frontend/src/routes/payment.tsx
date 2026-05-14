import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
  validateSearch: (s: Record<string, unknown>) => ({
    pickup: (s.pickup as string) || "12:40 PM",
    instructions: (s.instructions as string) || "",
  }),
});

const UPI_ID = "quickbite@upi";

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
    { id: "gpay", name: "GPay", color: "#4285F4", emoji: "💸" },
    { id: "phonepe", name: "PhonePe", color: "#5F259F", emoji: "📱" },
    { id: "paytm", name: "Paytm", color: "#00BAF2", emoji: "💰" },
  ];

  const finalizeOrder = () => {
    if (!user) return;
    const order = placeOrder({
      items: cart,
      total: grand,
      pickupTime: pickup,
      instructions,
      paid: true,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
    });
    clear();
    setCompleted(true);
    setTimeout(() => navigate({ to: "/orders", search: { highlight: order.id } }), 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-3xl px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-3 border-b bg-card sticky top-0 z-40">
        <button onClick={() => navigate({ to: "/cart" })} className="p-2 hover:bg-muted rounded-lg transition-all"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Payment</h1>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Secure
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl p-4 sm:p-6 space-y-6">
        <div className="bg-card border rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">To Pay</p>
          <h1 className="text-4xl font-bold text-foreground">₹{grand}</h1>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="text-xs font-medium text-muted-foreground">{cart.length} Items</span>
            <span className="text-xs font-medium text-muted-foreground">•</span>
            <span className="text-xs font-medium text-muted-foreground">Pickup: {pickup}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground px-1">Pay via UPI</h2>
          <div className="grid grid-cols-3 gap-3">
            {apps.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpening(a.id)}
                className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all group"
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-bold">{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-bold">Scan QR Code</h2>
          </div>
          
          <div className="mx-auto h-40 w-40 bg-muted/30 rounded-xl p-3 flex items-center justify-center relative border border-dashed border-border/60">
             <div className="text-[10px] font-bold text-muted-foreground opacity-30">SCAN TO PAY</div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-md">QB</div>
             </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t">
             <p className="text-xs font-medium text-muted-foreground">Or pay via UPI ID:</p>
             <button
               onClick={() => { navigator.clipboard.writeText(UPI_ID); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000); }}
               className="w-full flex items-center justify-between h-10 px-4 rounded-xl bg-muted/50 border hover:bg-muted text-sm font-medium transition-all"
             >
               <span className="text-foreground">{UPI_ID}</span>
               {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
             </button>
          </div>
        </div>

        <button
          onClick={finalizeOrder}
          className="w-full h-12 rounded-xl bg-green-600 text-white font-bold text-sm shadow-md hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Confirm Payment <ChevronRight className="h-4 w-4" />
        </button>
      </main>

      <AnimatePresence>
        {opening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border rounded-2xl p-6 text-center shadow-lg space-y-4 max-w-[280px] w-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <div className="space-y-1">
                 <h3 className="text-sm font-bold">Opening UPI App</h3>
                 <p className="text-xs text-muted-foreground">Complete payment securely.</p>
              </div>
              <button onClick={() => setOpening(null)} className="w-full h-9 rounded-lg border text-xs font-bold hover:bg-muted">Cancel</button>
            </div>
          </motion.div>
        )}
        {completed && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="text-center space-y-4">
               <div className="h-14 w-14 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                 <Check className="h-6 w-6 stroke-[3px]" />
               </div>
               <div className="space-y-1">
                  <h2 className="text-xl font-bold">Order Confirmed</h2>
                  <p className="text-sm text-muted-foreground">Redirecting...</p>
               </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
