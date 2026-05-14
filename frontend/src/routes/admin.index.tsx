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
    <div className="mx-auto max-w-[2500px] px-8 sm:px-24 py-12 sm:py-24 space-y-16">
      <div className="flex items-center justify-between">
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter">Live Command Center</h1>
          <p className="text-xl sm:text-3xl text-muted-foreground font-bold opacity-60">
            {orders.length} total orders · Real-time campus fulfillment
          </p>
        </div>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-10">
        <button
          onClick={() => setFilter("All")}
          className={cn(
            "p-8 sm:p-12 rounded-[3rem] border-4 text-left transition-all duration-500",
            filter === "All"
              ? "border-primary bg-primary/5 shadow-3xl shadow-primary/10 scale-105"
              : "border-border/40 bg-card hover:border-primary/40 shadow-xl",
          )}
        >
          <div className="text-[14px] uppercase font-black tracking-[0.4em] text-muted-foreground/40 mb-4">Total Active</div>
          <div className="text-6xl sm:text-8xl font-black tracking-tighter">{orders.length}</div>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={cn(
              "p-8 sm:p-12 rounded-[3rem] border-4 text-left transition-all duration-500",
              filter === s.key
                ? "border-primary bg-primary/5 shadow-3xl shadow-primary/10 scale-105"
                : "border-border/40 bg-card hover:border-primary/40 shadow-xl",
            )}
          >
            <div className="text-[14px] uppercase font-black tracking-[0.4em] text-muted-foreground/40 mb-4">
              {s.label}
            </div>
            <div className="text-6xl sm:text-8xl font-black tracking-tighter">{counts[s.key]}</div>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 sm:gap-20">
        {visible.length === 0 && (
          <div className="col-span-full py-60 text-center space-y-10 bg-muted/10 rounded-[6rem] border-4 border-dashed border-border/40">
            <div className="text-[12rem] opacity-10">📥</div>
            <div className="space-y-4">
               <h2 className="text-5xl font-black tracking-tighter">No {filter} orders</h2>
               <p className="text-2xl text-muted-foreground font-bold opacity-60 uppercase tracking-widest">Awaiting new campus activity.</p>
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
    "Payment Checking": { label: "Payment Verified", status: "Preparing", icon: IndianRupee },
    Preparing: { label: "Mark Ready", status: "Ready", icon: BellRing },
    Ready: { label: "Complete Pickup", status: "Completed", icon: CheckCircle2 },
    Completed: null,
  };
  const action = next[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-card border-4 border-border rounded-[4rem] p-10 sm:p-16 flex flex-col gap-10 shadow-xl hover:shadow-3xl transition-all relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-8 relative z-10">
        <div className="min-w-0 space-y-2">
          <div className="text-[16px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">Order #{order.id}</div>
          <div className="text-4xl sm:text-5xl font-black truncate tracking-tighter">{order.customerName}</div>
          <div className="text-xl text-muted-foreground font-bold inline-flex items-center gap-3">
            <Phone className="h-6 w-6 text-primary" /> {order.customerPhone}
          </div>
        </div>
        <span
          className={cn(
            "text-[14px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-2xl border-2 shadow-xl",
            STATUSES.find((s) => s.key === order.status)?.color,
          )}
        >
          {order.status}
        </span>
      </div>

      <div className="flex items-center gap-8 text-2xl font-black relative z-10">
        <span className="inline-flex items-center gap-4 bg-primary/10 text-primary px-8 py-4 rounded-3xl border-2 border-primary/20">
          <Clock className="h-8 w-8" /> {order.pickupTime}
        </span>
        <span className="text-muted-foreground/20">·</span>
        <span className="text-4xl">₹{order.total}</span>
      </div>

      <div className="bg-muted/30 rounded-[3rem] p-10 space-y-4 shadow-inner relative z-10">
        {order.items.map((i) => (
          <div key={i.food.id} className="flex justify-between items-center text-2xl font-bold">
            <span className="truncate pr-4 opacity-80">{i.food.name}</span>
            <span className="font-black shrink-0 text-primary">× {i.qty}</span>
          </div>
        ))}
      </div>

      {order.instructions && (
        <div className="bg-amber-500/5 border-2 border-amber-500/20 rounded-[2.5rem] p-10 text-2xl font-bold flex gap-6 italic relative z-10">
          <MessageSquare className="h-8 w-8 shrink-0 mt-1 text-amber-600" />
          <span>"{order.instructions}"</span>
        </div>
      )}

      <div className="flex items-center gap-8 bg-foreground text-background border-4 border-foreground rounded-[3rem] px-12 py-8 shadow-2xl relative z-10">
        <KeyRound className="h-10 w-10 text-primary" />
        <div className="flex-1">
          <div className="text-[14px] uppercase tracking-[0.5em] font-black opacity-40 mb-2">
            Pickup Authorization Token
          </div>
          <div className="text-6xl sm:text-7xl font-black tracking-[0.5em] leading-none">
            {order.otp}
          </div>
        </div>
      </div>

      {action && (
        <button
          onClick={() => onAction(action.status)}
          className="w-full h-24 sm:h-28 rounded-[3rem] bg-primary text-white font-black text-2xl inline-flex items-center justify-center gap-8 shadow-3xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all relative z-10"
        >
          {action.status === "Preparing" ? (
            <ChefHat className="h-10 w-10" />
          ) : (
            <action.icon className="h-10 w-10" />
          )}
          {action.label}
        </button>
      )}

      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
