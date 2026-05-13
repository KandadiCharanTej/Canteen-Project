import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, KeyRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Order } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
  validateSearch: (search: Record<string, unknown>): { highlight?: string } => {
    return { highlight: search.highlight as string };
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
      <div className="mx-auto max-w-2xl px-4 pt-3">
        <h1 className="text-base font-semibold">My Orders</h1>

        <div className="mt-3 inline-flex p-0.5 rounded-xl bg-muted text-[12px] font-medium">
          {(["active", "previous"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("h-8 px-4 rounded-lg transition", tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
            >
              {t === "active" ? `Active (${active.length})` : `Previous (${previous.length})`}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          {list.length === 0 ? (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              No {tab} orders yet.<br />
              <Link to="/" className="text-primary font-medium">Order something →</Link>
            </div>
          ) : (
            list.map((o) => <OrderCard key={o.id} order={o} highlight={o.id === highlight} />)
          )}
        </div>
      </div>
    </AppShell>
  );
}

const STATUSES: Order["status"][] = ["Payment Checking", "Preparing", "Ready", "Completed"];

function OrderCard({ order, highlight }: { order: Order; highlight?: boolean }) {
  const [open, setOpen] = useState(highlight);
  const stepIdx = STATUSES.indexOf(order.status);
  const isReady = order.status === "Ready";

  return (
    <motion.div layout
      initial={highlight ? { scale: 0.98, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("bg-card border rounded-xl overflow-hidden", highlight ? "border-primary shadow-[var(--shadow-pop)]" : "border-border")}>
      <button onClick={() => setOpen((o) => !o)} className="w-full p-3 flex items-center gap-3 text-left">
        <div className={cn("h-10 w-10 rounded-lg grid place-items-center text-base shrink-0",
          isReady ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
        )}>
          {isReady ? "🎉" : "🍳"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold truncate">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {order.pickupTime}</span>
            <span>·</span>
            <span>₹{order.total}</span>
            <span>·</span>
            <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-3 pb-3 border-t border-border pt-3 space-y-3">
              {/* Timeline */}
              <div className="flex items-center justify-between gap-1">
                {STATUSES.map((s, i) => {
                  const done = i <= stepIdx;
                  return (
                    <div key={s} className="flex-1 flex flex-col items-center">
                      <div className={cn("h-2 w-2 rounded-full", done ? "bg-primary" : "bg-border")} />
                      <span className={cn("text-[9px] mt-1 text-center leading-tight", done ? "text-foreground font-medium" : "text-muted-foreground")}>{s}</span>
                      {i < STATUSES.length - 1 && <div className={cn("h-[2px] w-full -mt-3 -z-10", done && i < stepIdx ? "bg-primary" : "bg-border")} style={{ transform: "translateX(50%)" }} />}
                    </div>
                  );
                })}
              </div>

              {/* OTP */}
              <div className={cn("rounded-lg p-3 flex items-center gap-3", isReady ? "bg-success/10 border border-success/30" : "bg-muted")}>
                <KeyRound className={cn("h-5 w-5", isReady ? "text-success" : "text-muted-foreground")} />
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pickup OTP</div>
                  <div className="text-xl font-bold tracking-[0.3em]">{order.otp}</div>
                </div>
                {isReady && <span className="text-[10px] font-semibold text-success uppercase">Show at counter</span>}
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                {order.items.map((it) => (
                  <div key={it.food.id} className="flex justify-between text-[12px]">
                    <span>{it.food.name} × {it.qty}</span>
                    <span className="text-muted-foreground">₹{it.food.price * it.qty}</span>
                  </div>
                ))}
              </div>
              {order.instructions && (
                <div className="text-[11px] bg-warning/10 border border-warning/30 rounded-lg p-2">
                  <span className="font-semibold">Note: </span>{order.instructions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    "Payment Checking": "bg-warning/15 text-warning-foreground",
    "Preparing": "bg-primary/15 text-primary",
    "Ready": "bg-success/15 text-success",
    "Completed": "bg-muted text-muted-foreground",
  };
  return <span className={cn("text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md", map[status])}>{status}</span>;
}
