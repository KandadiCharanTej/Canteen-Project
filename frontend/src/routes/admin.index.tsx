import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  KeyRound,
  MessageSquare,
  Phone,
  CheckCircle2,
  ChefHat,
  BellRing,
  IndianRupee,
} from "lucide-react";
import { useStore, type Order } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminOrders,
});

const STATUSES: { key: Order["status"]; label: string; color: string }[] = [
  {
    key: "Payment Checking",
    label: "Payment",
    color: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  { key: "Preparing", label: "Preparing", color: "bg-primary/15 text-primary border-primary/30" },
  { key: "Ready", label: "Ready", color: "bg-success/15 text-success border-success/30" },
  { key: "Completed", label: "Done", color: "bg-muted text-muted-foreground border-border" },
];

function AdminOrders() {
  const { orders, updateOrder } = useStore();
  const [filter, setFilter] = useState<"All" | Order["status"]>("All");

  const counts = STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = orders.filter((o) => o.status === s.key).length;
      return acc;
    },
    {} as Record<Order["status"], number>,
  );

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-semibold">Live Orders</h1>
          <p className="text-[11px] text-muted-foreground">
            {orders.length} total · refresh as new orders arrive
          </p>
        </div>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setFilter("All")}
          className={cn(
            "p-2.5 rounded-xl border text-left transition",
            filter === "All"
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/40",
          )}
        >
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">All</div>
          <div className="text-xl font-bold">{orders.length}</div>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              "p-2.5 rounded-xl border text-left transition",
              filter === s.key
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
              {s.label}
            </div>
            <div className="text-xl font-bold">{counts[s.key]}</div>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visible.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No orders to show.{" "}
            <span className="block text-[11px] mt-1">
              When students order, they'll appear here.
            </span>
          </div>
        )}
        <AnimatePresence>
          {visible.map((o) => (
            <AdminOrderCard
              key={o.id}
              order={o}
              onAction={(next) => {
                updateOrder(o.id, {
                  status: next,
                  paid: next === "Payment Checking" ? o.paid : true,
                });
                toast.success(`Order #${o.id} → ${next}`);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AdminOrderCard({
  order,
  onAction,
}: {
  order: Order;
  onAction: (next: Order["status"]) => void;
}) {
  const next: Record<
    Order["status"],
    { label: string; status: Order["status"]; icon: typeof IndianRupee } | null
  > = {
    "Payment Checking": { label: "Payment Received", status: "Preparing", icon: IndianRupee },
    Preparing: { label: "Mark Ready", status: "Ready", icon: BellRing },
    Ready: { label: "Complete Order", status: "Completed", icon: CheckCircle2 },
    Completed: null,
  };
  const action = next[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-2.5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground">#{order.id}</div>
          <div className="text-[14px] font-semibold truncate">{order.customerName}</div>
          <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
            <Phone className="h-3 w-3" /> {order.customerPhone}
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md border",
            STATUSES.find((s) => s.key === order.status)?.color,
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[12px]">
        <span className="inline-flex items-center gap-1 font-semibold">
          <Clock className="h-3.5 w-3.5 text-primary" /> {order.pickupTime}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold">₹{order.total}</span>
      </div>

      <div className="bg-muted/50 rounded-lg p-2 space-y-1">
        {order.items.map((i) => (
          <div key={i.food.id} className="flex justify-between text-[12px]">
            <span className="truncate">{i.food.name}</span>
            <span className="font-semibold shrink-0 ml-2">× {i.qty}</span>
          </div>
        ))}
      </div>

      {order.instructions && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 text-[11px] flex gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-warning-foreground" />
          <span>{order.instructions}</span>
        </div>
      )}

      <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1.5">
        <KeyRound className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Pickup OTP
          </div>
          <div className="text-base font-bold tracking-[0.25em] text-primary leading-none">
            {order.otp}
          </div>
        </div>
      </div>

      {action && (
        <button
          onClick={() => onAction(action.status)}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {action.status === "Preparing" ? (
            <ChefHat className="h-4 w-4" />
          ) : (
            <action.icon className="h-4 w-4" />
          )}
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
