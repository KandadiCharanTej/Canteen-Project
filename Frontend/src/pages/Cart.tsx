import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { TimeSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotId, setSlotId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    api.getSlots().then(setSlots);
  }, []);

  const proceed = () => {
    if (!slotId) {
      toast.error("Please pick a pickup time");
      return;
    }
    sessionStorage.setItem("checkout_slot", slotId);
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your Cart" showBack />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center safe-bottom">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <Button onClick={() => navigate("/")} className="rounded-full">Browse Menu</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your Cart" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 safe-bottom space-y-5">
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 divide-y divide-border">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-warm flex items-center justify-center text-2xl shrink-0">
                {i.emoji ?? "🍽️"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{i.name}</p>
                <p className="text-sm text-muted-foreground">₹{i.price} each</p>
              </div>
              <div className="flex items-center gap-1.5 bg-accent rounded-full p-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setQty(i.id, i.qty - 1)}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="font-semibold w-5 text-center text-sm">{i.qty}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setQty(i.id, i.qty + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(i.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-semibold mb-3">Pick a time slot</h2>
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s) => {
              const full = s.booked >= s.capacity;
              const selected = slotId === s.id;
              return (
                <button
                  key={s.id}
                  disabled={full}
                  onClick={() => setSlotId(s.id)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium border transition-all",
                    full && "bg-muted text-muted-foreground border-border cursor-not-allowed line-through",
                    !full && selected && "bg-primary text-primary-foreground border-primary shadow-soft",
                    !full && !selected && "bg-card border-border hover:border-primary"
                  )}
                >
                  {s.label}
                  {full && <div className="text-[10px]">Slot full</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-border">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <Button onClick={proceed} className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold">
          Proceed to Checkout →
        </Button>
      </div>
    </>
  );
}
