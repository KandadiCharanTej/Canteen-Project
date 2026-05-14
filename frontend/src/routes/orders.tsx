import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, KeyRound, CheckCircle2, Circle, ShoppingBasket, Search } from "lucide-react";
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
      <div className="space-y-8 sm:space-y-12">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your History</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Track and manage your campus orders.</p>
          </div>
          
          <div className="p-1 rounded-xl bg-muted flex gap-1 w-full sm:w-auto">
            {(["active", "previous"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 px-6 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  tab === t
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/50",
                )}
              >
                {t === "active" ? `Active (${active.length})` : `History (${previous.length})`}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.length === 0 ? (
            <div className="col-span-full py-24 flex flex-col items-center text-center space-y-4">
              <ShoppingBasket className="h-12 w-12 text-muted-foreground/20" />
              <div className="space-y-1">
                <p className="text-lg font-bold">No {tab} orders</p>
                <p className="text-sm text-muted-foreground">Head to the menu to find something delicious.</p>
              </div>
              <Link to="/" className="text-primary font-bold hover:underline">Go to Menu</Link>
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
        "bg-card border rounded-2xl overflow-hidden self-start transition-all",
        highlight ? "ring-2 ring-primary border-primary" : "hover:border-primary/30",
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-5 flex items-center gap-4 text-left group"
      >
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all",
          isReady ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-primary/5 text-primary"
        )}>
          {isReady ? "✨" : "🍱"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-lg">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>{order.items.length} Items</span>
            <span>·</span>
            <span className="text-primary">₹{order.total}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {order.pickupTime}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
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
              <div className="flex justify-between relative px-2">
                <div className="absolute top-2.5 left-6 right-6 h-[2px] bg-muted -z-0" />
                <div 
                  className="absolute top-2.5 left-6 h-[2px] bg-primary -z-0 transition-all duration-500" 
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 90}%` }}
                />
                {STATUS_STEPS.map((s, i) => {
                  const done = i <= currentStepIdx;
                  const active = i === currentStepIdx;
                  return (
                    <div key={s} className="flex flex-col items-center gap-2 z-10">
                      <div className={cn(
                        "h-5 w-5 rounded-full border-4 transition-all",
                        done ? "bg-primary border-white" : "bg-white border-muted",
                        active && "scale-125 shadow-lg shadow-primary/20"
                      )} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider mt-1", done ? "text-foreground" : "text-muted-foreground/70")}>
                        {s.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* OTP */}
              <div className={cn(
                "rounded-xl p-4 flex items-center justify-between gap-4 border",
                isReady ? "bg-green-600 border-green-700 text-white shadow-lg shadow-green-600/20" : "bg-card"
              )}>
                <div className="flex items-center gap-3">
                   <KeyRound className={cn("h-5 w-5", isReady ? "text-white" : "text-primary")} />
                   <div className="space-y-0.5">
                      <p className={cn("text-[9px] font-bold uppercase tracking-widest", isReady ? "text-white/60" : "text-muted-foreground")}>Pickup Token</p>
                      <p className="text-xl font-bold tracking-[0.2em]">{order.otp}</p>
                   </div>
                </div>
                {isReady && <span className="text-[10px] font-bold bg-white text-green-600 px-2 py-1 rounded">READY</span>}
              </div>

              {/* Summary */}
              <div className="space-y-3">
                {order.items.map((it) => (
                  <div key={it.food.id} className="flex justify-between text-sm font-bold text-foreground">
                    <span className="text-foreground/80"><span className="text-primary mr-3">x{it.qty}</span>{it.food.name}</span>
                    <span>₹{it.food.price * it.qty}</span>
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
    Ready: "bg-green-100 text-green-700 animate-pulse",
    Completed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", map[status])}>
      {status}
    </span>
  );
}
