import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, KeyRound, ShoppingCart } from "lucide-react";
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
      <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border/50 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Your Orders</h1>
            <p className="text-base text-muted-foreground font-medium">Track your campus dining history.</p>
          </div>
          
          <div className="p-1.5 rounded-2xl bg-muted flex gap-1 w-full md:w-auto shadow-inner">
            {(["active", "previous"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 px-8 h-12 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card/50",
                )}
              >
                {t === "active" ? `Active (${active.length})` : `History (${previous.length})`}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {list.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center text-center space-y-6 bg-card rounded-[3rem] border border-dashed border-border/50 shadow-sm">
              <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center shadow-inner">
                <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-black text-foreground">No {tab} orders</p>
                <p className="text-lg text-muted-foreground font-medium max-w-sm">Head to the menu to find something delicious.</p>
              </div>
              <Link to="/" className="h-14 px-8 rounded-2xl bg-primary text-white text-base font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center mt-4">
                Explore Menu
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
      className={cn(
        "bg-card border border-border/50 rounded-[2rem] overflow-hidden self-start transition-all shadow-md hover:shadow-lg",
        highlight ? "ring-4 ring-primary/20 border-primary" : "hover:border-primary/40",
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-6 md:p-8 flex items-center gap-5 md:gap-6 text-left group"
      >
        <div className={cn(
          "h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all shadow-inner",
          isReady ? "bg-green-600 text-white shadow-green-600/30" : "bg-primary/10 text-primary"
        )}>
          {isReady ? "✨" : "🍱"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-black text-xl md:text-2xl text-foreground">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span>{order.items.length} Items</span>
            <span>·</span>
            <span className="text-foreground">₹{order.total}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {order.pickupTime}</span>
          </div>
        </div>
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
          <ChevronDown className={cn("h-6 w-6 text-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/50 bg-muted/20"
          >
            <div className="p-6 md:p-8 space-y-8">
              {/* Timeline */}
              <div className="flex justify-between relative px-2 sm:px-6">
                <div className="absolute top-3 left-8 right-8 h-1.5 rounded-full bg-border -z-0" />
                <div 
                  className="absolute top-3 left-8 h-1.5 rounded-full bg-primary -z-0 transition-all duration-700" 
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%` }}
                />
                {STATUS_STEPS.map((s, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-3 z-10">
                      <div className={cn(
                        "h-7 w-7 rounded-full border-[6px] transition-all",
                        done ? "bg-primary border-background" : "bg-background border-border",
                        active && "scale-125 shadow-xl shadow-primary/30"
                      )} />
                      <span className={cn("text-xs font-bold uppercase tracking-widest mt-1 hidden sm:block", done ? "text-foreground" : "text-muted-foreground/60")}>
                        {s.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* OTP */}
              <div className={cn(
                "rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-2",
                isReady ? "bg-green-600 border-green-500 text-white shadow-xl shadow-green-600/20" : "bg-card border-border/50 shadow-sm"
              )}>
                <div className="flex items-center gap-5">
                   <div className={cn("h-14 w-14 rounded-xl flex items-center justify-center shadow-inner", isReady ? "bg-white/20" : "bg-primary/10")}>
                      <KeyRound className={cn("h-7 w-7", isReady ? "text-white" : "text-primary")} />
                   </div>
                   <div className="space-y-1">
                      <p className={cn("text-xs font-bold uppercase tracking-widest", isReady ? "text-white/80" : "text-muted-foreground")}>Pickup Token</p>
                      <p className="text-3xl font-black tracking-widest">{order.otp}</p>
                   </div>
                </div>
                {isReady && <span className="text-sm font-black bg-white text-green-600 px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest">Ready for Pickup</span>}
              </div>

              {/* Summary */}
              <div className="space-y-4 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Order Items</h3>
                {order.items.map((it) => (
                  <div key={it.food.id} className="flex items-center justify-between text-base font-bold text-foreground">
                    <span className="text-foreground/90"><span className="text-primary mr-3">x{it.qty}</span>{it.food.name}</span>
                    <span className="text-lg">₹{it.food.price * it.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    "Payment Checking": "bg-amber-100 text-amber-700",
    Preparing: "bg-blue-100 text-blue-700",
    Ready: "bg-green-500 text-white animate-pulse shadow-md",
    Completed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-md", map[status])}>
      {status}
    </span>
  );
}
