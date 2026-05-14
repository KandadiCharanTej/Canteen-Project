import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Zap,
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
    { id: "gpay", name: "Google Pay", color: "#4285F4", emoji: "💸" },
    { id: "phonepe", name: "PhonePe", color: "#5F259F", emoji: "📱" },
    { id: "paytm", name: "Paytm App", color: "#00BAF2", emoji: "💰" },
    { id: "other", name: "Any UPI App", color: "#FF6B20", emoji: "🏦" },
  ];

  const openApp = (id: string) => {
    setOpening(id);
    setTimeout(() => setOpening(null), 2000);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

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
    setTimeout(() => navigate({ to: "/orders", search: { highlight: order.id } }), 1500);
  };

  if (!cart.length && !completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center space-y-20">
        <div className="text-[12rem] animate-bounce">🛒</div>
        <div className="space-y-8">
          <h2 className="text-7xl font-black tracking-tighter leading-none">Session Expired</h2>
          <p className="text-3xl font-bold text-muted-foreground opacity-60 max-w-2xl mx-auto">Your payment security window has closed. Please re-start from your tray.</p>
        </div>
        <button
          onClick={() => navigate({ to: "/" })}
          className="h-24 px-20 rounded-[3rem] bg-primary text-white font-black text-2xl shadow-3xl shadow-primary/30 active:scale-95 transition-all"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-[2500px] px-8 sm:px-24 h-28 sm:h-32 flex items-center gap-10 border-b-2 border-border/40 bg-background/60 backdrop-blur-3xl sticky top-0 z-50">
        <button
          onClick={() => navigate({ to: "/cart" })}
          className="p-6 rounded-[2rem] bg-muted/50 hover:bg-muted active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft className="h-10 w-10" />
        </button>
        <div>
           <h1 className="font-black text-4xl sm:text-5xl tracking-tighter leading-none">Checkout Secure</h1>
           <p className="text-[14px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3">Order Finalization · SSL v3 · Campus OS</p>
        </div>
        <div className="ml-auto hidden xl:flex items-center gap-6 text-[14px] font-black uppercase tracking-[0.5em] text-primary bg-primary/10 px-10 py-4 rounded-full border-2 border-primary/20 shadow-xl">
          <ShieldCheck className="h-6 w-6" /> Secured Campus Transaction
        </div>
      </header>

      <main className="flex-1 w-full max-w-[2500px] grid grid-cols-1 lg:grid-cols-12 gap-16 sm:gap-40 p-8 sm:p-24 pb-60">
        {/* Left: Summary & Apps */}
        <div className="lg:col-span-7 space-y-16 sm:space-y-32">
          {/* Amount Display - Massive for TV/Monitor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-foreground text-background rounded-[5rem] sm:rounded-[8rem] p-20 sm:p-40 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-10">
              <p className="text-[18px] font-black uppercase tracking-[0.8em] opacity-40 group-hover:opacity-60 transition-opacity">
                Total Amount Payable
              </p>
              <h1 className="text-white text-8xl sm:text-[14rem] group-hover:scale-[1.05] transition-transform duration-1000 leading-none">₹{grand}</h1>
              <div className="pt-16 flex flex-wrap items-center justify-center gap-8">
                <div className="px-12 py-6 rounded-[2.5rem] bg-white/5 border-2 border-white/10 text-[18px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                  {cart.length} Selections
                </div>
                <div className="px-12 py-6 rounded-[2.5rem] bg-white/5 border-2 border-white/10 text-[18px] font-black uppercase tracking-widest text-primary backdrop-blur-md flex items-center gap-4">
                  <Zap className="h-7 w-7 fill-current" /> Pickup: {pickup}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/30 blur-[200px] rounded-full -mr-64 -mt-64 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-orange-600/20 blur-[180px] rounded-full -ml-48 -mb-48" />
          </motion.div>

          {/* Quick Pay Apps */}
          <div className="space-y-16">
            <div className="flex items-center gap-8 px-6">
              <Smartphone className="h-14 w-14 text-primary" />
              <h2 className="text-[20px] font-black uppercase tracking-[0.6em] text-muted-foreground/60">
                Launch UPI Application
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-16">
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openApp(a.id)}
                  className="bg-card border-2 border-border/40 hover:border-primary/40 rounded-[4rem] p-12 flex flex-col items-center gap-10 hover:shadow-3xl hover:shadow-primary/10 active:scale-[0.96] transition-all group"
                >
                  <div
                    className="h-32 w-32 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform duration-1000"
                    style={{ background: a.color + "15" }}
                  >
                    {a.emoji}
                  </div>
                  <span className="text-2xl font-black tracking-tighter">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scan & Confirm */}
        <div className="lg:col-span-5 space-y-20">
          {/* QR Immersive Card */}
          <div className="bg-card/40 border-2 border-border/40 rounded-[6rem] p-16 sm:p-24 text-center space-y-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Zap className="h-48 w-48 text-primary" /></div>
            
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-6 px-4 mb-8">
                <CreditCard className="h-10 w-10 text-primary" />
                <h2 className="text-[18px] font-black uppercase tracking-[0.6em] text-muted-foreground">
                  Scan to Pay Now
                </h2>
              </div>
              <div className="mx-auto h-[400px] w-[400px] rounded-[6rem] bg-white p-16 shadow-3xl relative border-8 border-dashed border-border/40 group-hover:border-primary/40 transition-colors">
                <QrPattern />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-[3.5rem] bg-primary text-white flex items-center justify-center font-black text-5xl shadow-3xl shadow-primary/40 border-[12px] border-white group-hover:scale-110 transition-transform">
                    QB
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10 relative z-10">
              <button
                onClick={copyUpi}
                className="w-full inline-flex items-center justify-between h-24 px-12 rounded-[2.5rem] bg-muted/50 border-4 border-transparent hover:border-primary/20 text-2xl font-black hover:bg-muted active:scale-[0.98] transition-all shadow-inner"
              >
                <span className="opacity-40 font-black tracking-[0.5em] uppercase text-[14px]">UPI ID</span>
                <span className="flex items-center gap-6">
                   {copied ? <Check className="h-8 w-8 text-green-600" /> : <Copy className="h-8 w-8 opacity-30" />}
                   {UPI_ID}
                </span>
              </button>
              <p className="text-2xl font-bold text-muted-foreground/60 leading-relaxed max-w-md mx-auto">
                Scan via GPay, PhonePe or Paytm to finalize your smart campus order.
              </p>
            </div>
          </div>

          {/* Final Action - Massive CTA */}
          <div className="space-y-10 pt-12">
            <button
              onClick={finalizeOrder}
              className="w-full h-32 sm:h-40 rounded-[4rem] bg-green-600 text-white font-black text-4xl shadow-3xl shadow-green-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-10 hover:bg-green-500 group"
            >
              <Banknote className="h-16 w-16 group-hover:scale-125 transition-transform" /> 
              I Have Paid Successfully 
              <ChevronRight className="h-12 w-12 opacity-40 group-hover:translate-x-6 transition-transform duration-700" />
            </button>
            <div className="flex items-center justify-center gap-4 text-[16px] sm:text-[18px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] px-12 text-center leading-relaxed">
               Payment verification takes ~60 seconds at the campus counter
            </div>
          </div>
        </div>
      </main>

      {/* Success/Loading Overlays */}
      <AnimatePresence>
        {opening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-3xl p-12"
          >
            <motion.div
              initial={{ scale: 0.9, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card rounded-[8rem] p-32 text-center shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] border-4 border-border/40 w-full max-w-4xl"
            >
              <Loader2 className="h-40 w-40 mx-auto animate-spin text-primary mb-20" />
              <h3 className="text-7xl font-black tracking-tighter">
                Opening {apps.find((a) => a.id === opening)?.name}
              </h3>
              <p className="text-3xl text-muted-foreground font-bold mt-10 leading-relaxed">
                Securely launching your payment application. Please complete the transaction and return to QuickBite.
              </p>
            </motion.div>
          </motion.div>
        )}

        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-[150px] p-12"
          >
            <motion.div
              initial={{ scale: 0.7, y: 200 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card rounded-[10rem] p-40 text-center shadow-3xl border-4 border-border/40 w-full max-w-5xl"
            >
              <div className="h-64 w-64 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center mb-20 shadow-3xl shadow-green-600/40">
                <Check className="h-40 w-40 stroke-[8px]" />
              </div>
              <h2 className="text-8xl sm:text-[10rem] font-black tracking-tighter leading-none">Order Secured!</h2>
              <p className="text-4xl text-muted-foreground font-bold mt-12 opacity-60">
                Crafting your digital token...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QrPattern() {
  const cells = Array.from(
    { length: 144 },
    (_, i) =>
      Math.random() > 0.6 || [0, 1, 2, 10, 11, 12, 132, 133, 142, 143, 11, 23, 35, 47].includes(i % 12) || i < 12 || i > 132,
  );
  return (
    <div className="grid grid-cols-12 gap-3 h-full w-full opacity-90">
      {cells.map((on, i) => (
        <div key={i} className={cn("rounded-lg transition-colors duration-1000", on ? "bg-black" : "bg-muted/10")} />
      ))}
    </div>
  );
}
