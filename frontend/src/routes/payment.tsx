import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  Smartphone,
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
      <header className="w-full max-w-5xl px-4 sm:px-8 h-16 sm:h-20 flex items-center gap-4 border-b bg-card sticky top-0 z-40">
        <button onClick={() => navigate({ to: "/cart" })} className="p-2 hover:bg-muted rounded-lg transition-all"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="font-bold text-lg">Secure Payment</h1>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" /> Secure
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-8 text-center space-y-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Payable Amount</p>
            <h1 className="text-5xl font-bold text-primary">₹{grand}</h1>
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded uppercase tracking-widest">{cart.length} Items</span>
              <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded uppercase tracking-widest">Pickup: {pickup}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">UPI Apps</h2>
            <div className="grid grid-cols-3 gap-3">
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setOpening(a.id)}
                  className="bg-card border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary/40 transition-all group"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-xs font-bold">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 text-center space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scan QR Code</h2>
            <div className="mx-auto h-48 w-48 bg-muted rounded-xl p-4 flex items-center justify-center relative border-2 border-dashed border-border">
               <div className="text-xs font-bold text-muted-foreground opacity-20">QR CODE</div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-lg">QB</div>
               </div>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(UPI_ID); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000); }}
              className="w-full flex items-center justify-between h-10 px-4 rounded-xl bg-muted/50 text-xs font-bold"
            >
              <span className="opacity-40">UPI ID</span>
              <span className="flex items-center gap-2">{copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />} {UPI_ID}</span>
            </button>
          </div>

          <button
            onClick={finalizeOrder}
            className="w-full h-12 rounded-xl bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-600/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            I Have Paid Successfully <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      <AnimatePresence>
        {opening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-card border rounded-3xl p-8 text-center shadow-xl space-y-4 max-w-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <h3 className="font-bold">Opening UPI App...</h3>
              <p className="text-xs text-muted-foreground">Please complete the payment and return here.</p>
              <button onClick={() => setOpening(null)} className="text-primary text-xs font-bold">Cancel</button>
            </div>
          </motion.div>
        )}
        {completed && (
          <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
               <div className="h-16 w-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                 <Check className="h-8 w-8 stroke-[4px]" />
               </div>
               <h2 className="text-2xl font-bold">Order Confirmed!</h2>
               <p className="text-sm text-muted-foreground">Redirecting to history...</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
