import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const STAGES: OrderStatus[] = ["Placed", "Preparing", "Ready", "Completed"];

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getOrders(user.id).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  if (loading) return (<><PageHeader title="My Orders" /><Spinner /></>);

  return (
    <>
      <PageHeader title="My Orders" />
      <div className="max-w-2xl mx-auto px-4 py-4 safe-bottom space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          orders.map((o) => {
            const stageIdx = STAGES.indexOf(o.status);
            return (
              <div key={o.id} className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString()} · Pickup {o.slotLabel}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="text-sm text-muted-foreground space-y-0.5 my-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span>{i.emoji} {i.name} × {i.qty}</span>
                      <span>₹{i.price * i.qty}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mb-3">
                  <span>Total ({o.paymentMethod})</span>
                  <span>₹{o.total}</span>
                </div>

                {o.status !== "Completed" && (
                  <div className="flex items-center gap-1">
                    {STAGES.slice(0, 3).map((stage, idx) => (
                      <div key={stage} className="flex-1 flex items-center gap-1">
                        <div
                          className={cn(
                            "h-2 flex-1 rounded-full transition-colors",
                            idx <= stageIdx ? "bg-primary" : "bg-muted"
                          )}
                        />
                        {idx < 2 && <div className="w-1" />}
                      </div>
                    ))}
                  </div>
                )}
                {o.status !== "Completed" && (
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-medium">
                    <span>Placed</span><span>Preparing</span><span>Ready</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
