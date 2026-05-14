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
    color: "bg-warning/10 text-warning-foreground border-warning/20",
  },
  { key: "Preparing", label: "Preparing", color: "bg-primary/10 text-primary border-primary/20" },
  { key: "Ready", label: "Ready", color: "bg-success/10 text-success border-success/20" },
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
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Orders</h1>
          <p className="text-sm text-muted-foreground font-medium">
            {orders.length} total orders · Command Center
          </p>
        </div>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setFilter("All")}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all",
            filter === "All"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30",
          )}
        >
          <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">All Active</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all",
              filter === s.key
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30",
            )}
          >
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
              {s.label}
            </div>
            <div className="text-2xl font-bold">{counts[s.key]}</div>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-muted/30 rounded-3xl border border-dashed">
            <div className="text-4xl opacity-50">📥</div>
            <div>
               <h2 className="text-lg font-bold">No {filter} orders</h2>
               <p className="text-sm text-muted-foreground">Awaiting new campus activity.</p>
            </div>
          </div>
        )}
        <AnimatePresence mode="popLayout">
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
    "Payment Checking": { label: "Verify Payment", status: "Preparing", icon: IndianRupee },
    Preparing: { label: "Mark Ready", status: "Ready", icon: BellRing },
    Ready: { label: "Complete Pickup", status: "Completed", icon: CheckCircle2 },
    Completed: null,
  };
  const action = next[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border rounded-2xl p-5 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">#{order.id}</span>
             <span
               className={cn(
                 "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border",
                 STATUSES.find((s) => s.key === order.status)?.color,
               )}
             >
               {order.status}
             </span>
          </div>
          <div className="text-lg font-bold truncate">{order.customerName}</div>
          <div className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
            <Phone className="h-4 w-4" /> {order.customerPhone}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm font-bold">
        <span className="inline-flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
          <Clock className="h-4 w-4 text-primary" /> {order.pickupTime}
        </span>
        <span className="text-muted-foreground">•</span>
        <span className="text-base text-foreground">₹{order.total}</span>
      </div>

      <div className="bg-muted/50 rounded-xl p-3 space-y-2 border">
        {order.items.map((i) => (
          <div key={i.food.id} className="flex justify-between items-center text-sm">
            <span className="truncate pr-2 font-medium">{i.food.name}</span>
            <span className="font-bold text-primary shrink-0">x{i.qty}</span>
          </div>
        ))}
      </div>

      {order.instructions && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm font-medium flex gap-2 italic">
          <MessageSquare className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <span>"{order.instructions}"</span>
        </div>
      )}

      <div className="flex items-center gap-4 bg-foreground text-background rounded-xl p-4 shadow-sm">
        <KeyRound className="h-6 w-6 text-primary" />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Pickup Token
          </div>
          <div className="text-2xl font-bold tracking-widest">
            {order.otp}
          </div>
        </div>
      </div>

      {action && (
        <button
          onClick={() => onAction(action.status)}
          className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto"
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
