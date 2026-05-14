import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, KeyRound, CheckCircle2, Circle, ShoppingBasket, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Order } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  validateSearch: (search: Record<string, unknown>): { highlight?: string } => {
    return { highlight: typeof search.highlight === "string" ? search.highlight : undefined };
  },
});

function OrdersPage() {
  const { orders } = useStore();
  const [tab, setTab] = useState<"active" | "previous">("active");
  const active = orders.filter((o) => o.status !== "Completed");
  const previous = orders.filter((o) => o.status === "Completed");
  const list = tab === "active" ? active : previous;
  const { highlight } = Route.useSearch();

  return (
    <AppShell>
      <div className="space-y-20 sm:space-y-40">
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 sm:gap-24">
          <div className="space-y-6 text-center xl:text-left">
            <h1 className="text-5xl sm:text-[10rem] font-black tracking-tighter leading-none">Your History</h1>
            <p className="text-2xl sm:text-5xl text-muted-foreground font-bold opacity-60">Track your live orders and past campus treats.</p>
          </div>
          
          <div className="p-3 rounded-[3rem] bg-muted/40 backdrop-blur-3xl flex gap-3 w-full max-w-2xl mx-auto xl:mx-0 shadow-inner">
            {(["active", "previous"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 h-20 sm:h-28 rounded-[2.5rem] text-[18px] sm:text-[22px] font-black uppercase tracking-[0.2em] transition-all duration-700",
                  tab === t
                    ? "bg-primary text-white shadow-3xl shadow-primary/30 scale-[1.05]"
                    : "text-muted-foreground hover:bg-background/60",
                )}
              >
                {t === "active" ? `Ongoing (${active.length})` : `History (${previous.length})`}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-12 sm:gap-24">
          {list.length === 0 ? (
            <div className="col-span-full py-60 flex flex-col items-center text-center space-y-16 bg-card/40 rounded-[6rem] border-4 border-dashed border-border/60 backdrop-blur-xl">
              <div className="h-56 w-56 rounded-[5rem] bg-muted/40 flex items-center justify-center text-muted-foreground/10 shadow-inner">
                <ShoppingBasket className="h-32 w-32" />
              </div>
              <div className="space-y-8 px-6">
                <h2 className="text-6xl sm:text-8xl font-black tracking-tighter">No {tab} orders found</h2>
                <p className="text-2xl sm:text-4xl text-muted-foreground font-bold opacity-60 max-w-2xl mx-auto leading-relaxed">
                  Your tray is empty. Why not head to the menu and find something delicious?
                </p>
              </div>
              <Link to="/" className="h-28 px-20 rounded-[3rem] bg-primary text-white font-black text-2xl flex items-center gap-6 hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary/40">
                Go to Menu <Search className="h-10 w-10" />
              </Link>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {list.map((o) => (
                <OrderCard key={o.id} order={o} highlight={o.id === highlight} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppShell>
  );
}

const STATUS_STEPS: Order["status"][] = ["Payment Checking", "Preparing", "Ready", "Completed"];

function OrderCard({ order, highlight }: { order: Order; highlight?: boolean }) {
  const [open, setOpen] = useState(highlight);
  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const isReady = order.status === "Ready";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-card/60 border-4 transition-all duration-700 rounded-[4.5rem] overflow-hidden self-start backdrop-blur-3xl relative",
        highlight ? "border-primary shadow-3xl shadow-primary/20" : "border-border/40 shadow-xl hover:shadow-3xl hover:shadow-primary/5",
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-12 sm:p-20 flex items-center gap-12 text-left group"
      >
        <div
          className={cn(
            "h-28 w-28 sm:h-32 sm:w-32 rounded-[3rem] flex items-center justify-center text-5xl sm:text-6xl shadow-inner shrink-0 transition-all duration-1000 group-hover:rotate-12",
            isReady ? "bg-green-600 text-white shadow-3xl shadow-green-600/30" : "bg-primary/10 text-primary",
          )}
        >
          {isReady ? "✨" : "🍽️"}
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[15px] sm:text-[18px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
            <span>{order.items.length} Choice{order.items.length > 1 ? "s" : ""}</span>
            <span className="h-2 w-2 rounded-full bg-primary/40" />
            <span className="text-primary font-black">₹{order.total}</span>
            <span className="h-2 w-2 rounded-full bg-primary/40" />
            <span className="flex items-center gap-3">
              <Clock className="h-6 w-6" /> {order.pickupTime}
            </span>
          </div>
        </div>
        <div className={cn(
          "h-20 w-20 rounded-[2rem] bg-muted/50 flex items-center justify-center transition-all duration-700",
          open && "rotate-180 bg-primary/10 text-primary"
        )}>
          <ChevronDown className="h-10 w-10" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t-4 border-border/20 bg-muted/10"
          >
            <div className="p-12 sm:p-24 space-y-16">
              {/* Status Timeline - High Visibility */}
              <div className="flex justify-between items-start px-4">
                {STATUS_STEPS.map((s, i) => {
                  const completed = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-6 relative flex-1">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center z-10 transition-all duration-1000 border-[8px]",
                          completed ? "bg-primary border-primary/20 text-white" : "bg-muted border-transparent",
                          active && "animate-pulse shadow-3xl shadow-primary"
                        )}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-3 w-3 text-muted-foreground/10" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[12px] sm:text-[14px] font-black uppercase tracking-[0.25em] text-center leading-tight max-w-[120px]",
                          completed ? "text-foreground opacity-100" : "text-muted-foreground opacity-20",
                        )}
                      >
                        {s}
                      </span>

                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "absolute top-6 left-[50%] right-[-50%] h-[6px] -z-10 rounded-full",
                            i < currentStepIdx ? "bg-primary shadow-2xl shadow-primary/20" : "bg-muted",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* OTP Section - Immersive TV UI */}
              <div
                className={cn(
                  "rounded-[4rem] p-16 sm:p-24 flex flex-col sm:flex-row items-center gap-16 border-4 transition-all duration-1000",
                  isReady
                    ? "bg-green-600 border-green-700 text-white shadow-3xl shadow-green-600/40 scale-[1.02]"
                    : "bg-background border-border/40 shadow-inner",
                )}
              >
                <div
                  className={cn(
                    "h-32 w-32 rounded-[3rem] flex items-center justify-center shadow-2xl",
                    isReady ? "bg-white/20" : "bg-primary/10 text-primary",
                  )}
                >
                  <KeyRound className="h-16 w-16" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-4">
                  <p
                    className={cn(
                      "text-[16px] sm:text-[18px] font-black uppercase tracking-[0.5em]",
                      isReady ? "text-white/60" : "text-muted-foreground/60",
                    )}
                  >
                    Your Pickup Token
                  </p>
                  <p className="text-8xl sm:text-[10rem] font-black tracking-[0.5em] leading-none">{order.otp}</p>
                </div>
                {isReady && (
                  <div className="px-16 py-6 rounded-[2.5rem] bg-white text-green-600 text-[18px] sm:text-[22px] font-black uppercase tracking-[0.2em] shadow-3xl animate-bounce">
                    Ready Now
                  </div>
                )}
              </div>

              {/* Order Breakdown */}
              <div className="space-y-10">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-[16px] sm:text-[18px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
                     Line Items
                   </h3>
                   <span className="text-3xl font-black opacity-30 italic">₹{order.total} total</span>
                </div>
                <div className="space-y-6 bg-background border-2 border-border/40 rounded-[4rem] p-12 sm:p-20 shadow-inner">
                  {order.items.map((it) => (
                    <div key={it.food.id} className="flex justify-between items-center text-3xl sm:text-5xl font-black group/item">
                      <span className="text-foreground/90 flex items-center gap-10">
                        <span className="h-16 w-16 rounded-3xl bg-muted flex items-center justify-center text-[20px] font-black text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all duration-700">{it.qty}</span>
                        {it.food.name}
                      </span>
                      <span className="text-primary/60">₹{it.food.price * it.qty}</span>
                    </div>
                  ))}
                  {order.instructions && (
                    <div className="mt-16 pt-16 border-t-4 border-dashed border-border/40">
                      <div className="bg-primary/5 p-12 rounded-[3.5rem] border-4 border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><Sparkles className="h-32 w-32 text-primary" /></div>
                        <span className="font-black uppercase text-[14px] tracking-[0.6em] text-primary mb-6 block">Note for Chef:</span>
                        <p className="text-3xl sm:text-5xl font-bold text-foreground/80 leading-relaxed italic">"{order.instructions}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    "Payment Checking": "bg-amber-500 text-white shadow-amber-500/30",
    Preparing: "bg-blue-600 text-white shadow-blue-600/30",
    Ready: "bg-green-600 text-white shadow-green-600/30 animate-pulse",
    Completed: "bg-muted text-muted-foreground shadow-none",
  };
  return (
    <span
      className={cn(
        "text-[12px] sm:text-[14px] font-black uppercase tracking-[0.5em] px-8 py-3 rounded-2xl shadow-2xl transition-all",
        map[status],
      )}
    >
      {status}
    </span>
  );
}
