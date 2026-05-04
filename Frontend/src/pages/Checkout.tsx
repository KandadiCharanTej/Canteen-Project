import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { TimeSlot } from "@/lib/types";
import { Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [payment, setPayment] = useState<"Cash" | "UPI">("Cash");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const slotId = sessionStorage.getItem("checkout_slot");
    if (!slotId || items.length === 0) {
      navigate("/cart");
      return;
    }
    api.getSlots().then((slots) => {
      const found = slots.find((s) => s.id === slotId);
      if (!found) navigate("/cart");
      else setSlot(found);
    });
  }, [items.length, navigate]);

  const placeOrder = async () => {
    if (!user || !slot) return;
    setPlacing(true);
    try {
      const order = await api.createOrder({
        userId: user.id,
        userName: user.name,
        items,
        total,
        slotLabel: slot.label,
        paymentMethod: payment,
      });
      clear();
      sessionStorage.removeItem("checkout_slot");
      toast.success(`Order ${order.id} placed!`);
      navigate("/orders");
    } catch {
      toast.error("Could not place order. Try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (!slot) return null;

  return (
    <>
      <PageHeader title="Checkout" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 safe-bottom">
        <section className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{i.emoji} {i.name} × {i.qty}</span>
                <span className="font-medium">₹{i.price * i.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">₹{total}</span>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Pickup at <span className="font-semibold text-foreground">{slot.label}</span>
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: "Cash", label: "Cash on pickup", icon: Banknote },
              { id: "UPI", label: "UPI / GPay / PhonePe", icon: Smartphone },
            ] as const).map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  payment === p.id
                    ? "border-primary bg-accent shadow-soft"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <p.icon className={cn("h-6 w-6 mb-2", payment === p.id ? "text-primary" : "text-muted-foreground")} />
                <p className="font-semibold text-sm">{p.label}</p>
                {payment === p.id && (
                  <CheckCircle2 className="h-4 w-4 text-primary absolute top-3 right-3" />
                )}
              </button>
            ))}
          </div>
          {payment === "UPI" && (
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Pay manually via your UPI app and show receipt at pickup.
            </p>
          )}
        </section>

        <Button
          onClick={placeOrder}
          disabled={placing}
          className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold"
        >
          {placing ? "Placing order..." : `Confirm Order · ₹${total}`}
        </Button>
      </div>
    </>
  );
}
