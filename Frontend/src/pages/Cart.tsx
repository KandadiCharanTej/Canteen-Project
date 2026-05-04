import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { slotsApi } from "@/lib/api";
import { TimeSlot } from "@/lib/types";
import { toast } from "sonner";

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const { isLoggedIn } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: "/cart" }} replace />;
  }

  useEffect(() => {
    slotsApi
      .getSlots()
      .then((s) => {
        setSlots(s);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, []);

  const availableSlots = slots.filter(
    (s) => s.current_orders < s.max_orders && s.is_active
  );

  const proceed = () => {
    if (!selectedSlot) {
      toast.error("Please select a pickup time");
      return;
    }
    sessionStorage.setItem("checkout_slot", selectedSlot);
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your Cart" showBack />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center safe-bottom">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-muted-foreground mb-6">Your cart is empty</p>
          <Button onClick={() => navigate("/")} className="rounded-full">
            Browse Menu
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your Cart" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 safe-bottom space-y-5">
        {/* Cart Items */}
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 divide-y divide-border">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 p-3.5">
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0">
                <img
                  src={
                    i.image_url ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                  }
                  alt={i.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{i.name}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{i.price} × {i.qty} = ₹{i.price * i.qty}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-accent rounded-full p-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setQty(i.id, i.qty - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="font-semibold w-5 text-center text-sm">
                  {i.qty}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                  onClick={() => setQty(i.id, i.qty + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive h-8 w-8"
                onClick={() => remove(i.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Time Slot Dropdown */}
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            ⏰ Select Pickup Time
          </h2>
          {loadingSlots ? (
            <p className="text-sm text-muted-foreground">Loading time slots...</p>
          ) : (
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger className="w-full h-11" id="time-slot-select">
                <SelectValue placeholder="Choose a pickup time..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableSlots.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No available slots
                  </SelectItem>
                ) : (
                  availableSlots.map((s) => (
                    <SelectItem key={s.id} value={s.slot_time}>
                      <div className="flex items-center justify-between w-full gap-4">
                        <span>{s.slot_time}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.max_orders - s.current_orders} slots left
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Price Summary */}
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

        <Button
          onClick={proceed}
          className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold"
          id="proceed-checkout-btn"
        >
          Proceed to Checkout →
        </Button>
      </div>
    </>
  );
}
