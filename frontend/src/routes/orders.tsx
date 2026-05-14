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
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Your Orders</h1>
            <p className="text-sm text-muted-foreground font-medium">Track your campus dining history.</p>
          </div>
          
          <div className="p-1 rounded-xl bg-muted flex gap-1 w-full sm:w-auto border shadow-inner">
            {(["active", "previous"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 px-6 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center text-center space-y-4 bg-card rounded-2xl border shadow-sm">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-foreground">No {tab} orders</p>
                <p className="text-sm text-muted-foreground font-medium max-w-sm">Head to the menu to find something delicious.</p>
              </div>
              <Link to="/" className="h-10 px-6 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center mt-2">
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
        "bg-card border rounded-2xl overflow-hidden self-start transition-all shadow-sm",
        highlight ? "ring-2 ring-primary border-primary" : "hover:border-primary/40 hover:shadow-md",
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-5 flex items-center gap-4 text-left group"
      >
        <div className={cn(
          "h-14 w-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-all",
          isReady ? "bg-green-600 text-white shadow-md shadow-green-600/30" : "bg-primary/10 text-primary"
        )}>
          {isReady ? "✨" : "🍱"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-lg text-foreground">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <span>{order.items.length} Items</span>
            <span>·</span>
            <span className="text-foreground">₹{order.total}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {order.pickupTime}</span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-muted transition-colors shrink-0">
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t bg-muted/20"
          >
            <div className="p-5 space-y-6">
              {/* Timeline */}
              <div className="flex justify-between relative px-2 sm:px-4">
                <div className="absolute top-2.5 left-6 right-6 h-1 rounded-full bg-border -z-0" />
                <div 
                  className="absolute top-2.5 left-6 h-1 rounded-full bg-primary -z-0 transition-all duration-700" 
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%` }}
                />
                {STATUS_STEPS.map((s, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2 z-10">
                      <div className={cn(
                        "h-6 w-6 rounded-full border-[5px] transition-all",
                        done ? "bg-primary border-background" : "bg-background border-border",
                        active && "scale-110 shadow-md shadow-primary/30"
                      )} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-1 hidden sm:block", done ? "text-foreground" : "text-muted-foreground/60")}>
                        {s.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* OTP */}
              <div className={cn(
                "rounded-xl p-5 flex items-center justify-between gap-4 border",
                isReady ? "bg-green-600 border-green-500 text-white shadow-md shadow-green-600/20" : "bg-card border-border shadow-sm"
              )}>
                <div className="flex items-center gap-4">
                   <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", isReady ? "bg-white/20" : "bg-primary/10")}>
                      <KeyRound className={cn("h-6 w-6", isReady ? "text-white" : "text-primary")} />
                   </div>
                   <div className="space-y-0.5">
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", isReady ? "text-white/80" : "text-muted-foreground")}>Pickup Token</p>
                      <p className="text-2xl font-bold tracking-[0.1em]">{order.otp}</p>
                   </div>
                </div>
                {isReady && <span className="text-xs font-bold bg-white text-green-600 px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest hidden sm:block">Ready</span>}
              </div>

              {/* Summary */}
              <div className="space-y-3 bg-card border rounded-xl p-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Order Items</h3>
                {order.items.map((it) => (
                  <div key={it.food.id} className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span className="text-foreground/90"><span className="text-primary font-bold mr-2">x{it.qty}</span>{it.food.name}</span>
                    <span className="font-bold">₹{it.food.price * it.qty}</span>
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
    "Payment Checking": "bg-amber-100 text-amber-700 border border-amber-200",
    Preparing: "bg-blue-100 text-blue-700 border border-blue-200",
    Ready: "bg-green-500 text-white animate-pulse shadow-sm",
    Completed: "bg-muted text-muted-foreground border",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md", map[status])}>
      {status}
    </span>
  );
}
