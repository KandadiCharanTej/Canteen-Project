import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { ordersApi } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STAGES: OrderStatus[] = ["Placed", "Preparing", "Ready", "Completed"];

export default function Orders() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await ordersApi.getOrders();
      setOrders(data);
    } catch {}
    setLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    fetchOrders();
    // Poll every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn, navigate, fetchOrders]);

  if (!isLoggedIn) return null;
  if (loading)
    return (
      <>
        <PageHeader title="My Orders" />
        <Spinner label="Loading orders..." />
      </>
    );

  return (
    <>
      <PageHeader title="My Orders" />
      <div className="max-w-2xl mx-auto px-4 py-4 safe-bottom space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => navigate("/")} className="rounded-full">
              Order Now
            </Button>
          </div>
        ) : (
          orders.map((o) => {
            const stageIdx = STAGES.indexOf(o.status);
            return (
              <div
                key={o.id}
                className="bg-card rounded-2xl shadow-soft border border-border/50 p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">Order #{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()} · Pickup{" "}
                      {o.time_slot}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={o.status} />
                    <Badge
                      className={cn(
                        "text-[10px]",
                        o.payment_status === "paid"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning-foreground"
                      )}
                    >
                      {o.payment_status === "paid" ? "💰 Paid" : "⏳ Pending"}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <div className="text-sm text-muted-foreground space-y-0.5 my-3">
                  {o.items.map((i) => (
                    <div key={i.id} className="flex justify-between">
                      <span>
                        {i.item?.name || `Item #${i.item_id}`} × {i.quantity}
                      </span>
                      <span>₹{i.price_at_time * i.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mb-3">
                  <span>Total (UPI)</span>
                  <span>₹{o.total_price}</span>
                </div>

                {/* OTP Display */}
                {o.otp && o.status !== "Completed" && (
                  <div className="bg-accent/50 rounded-xl p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Pickup OTP:</span>
                      <span className="text-lg font-bold tracking-widest text-primary">
                        {o.otp}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(o.otp || "");
                        toast.success("OTP copied!");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Progress Bar */}
                {o.status !== "Completed" && (
                  <>
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
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-medium">
                      <span>Placed</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                    </div>
                  </>
                )}

                {o.status === "Completed" && (
                  <div className="text-center text-xs text-success font-medium bg-success/10 rounded-lg py-2">
                    ✓ Order completed successfully
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
