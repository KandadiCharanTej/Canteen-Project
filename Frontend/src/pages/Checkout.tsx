import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi, slotsApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { Smartphone, CheckCircle2, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";

// UPI payment config (change these for your canteen)
const UPI_ID = "canteen@upi";
const UPI_NAME = "CanteenFood";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [slotTime, setSlotTime] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [paidClicked, setPaidClicked] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    const slot = sessionStorage.getItem("checkout_slot");
    if (!slot || items.length === 0) {
      navigate("/cart");
      return;
    }
    setSlotTime(slot);
  }, [items.length, navigate, isLoggedIn]);

  const placeOrder = async () => {
    if (!user || !slotTime) return;
    setPlacing(true);
    try {
      const order = await ordersApi.createOrder({
        time_slot: slotTime,
        items: items.map((i) => ({ item_id: i.id, quantity: i.qty })),
      });
      clear();
      sessionStorage.removeItem("checkout_slot");
      setPlacedOrder(order);
      setPlaced(true);
      toast.success(`Order #${order.id} placed!`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Could not place order. Try again.";
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const openUPI = () => {
    const amount = placedOrder?.total_price || total;
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
      UPI_NAME
    )}&am=${amount}&cu=INR&tn=Order%20${placedOrder?.id || ""}`;
    window.location.href = upiLink;
  };

  const handlePaid = async () => {
    if (placedOrder) {
      try {
        await ordersApi.markSelfPaid(placedOrder.id);
        setPaidClicked(true);
        toast.success("Payment acknowledgment sent! Admin will verify.");
      } catch {
        toast.error("Failed to send payment acknowledgment");
      }
    }
  };

  if (!slotTime && !placed) return null;

  // ─── Order Placed Screen ───
  if (placed && placedOrder) {
    return (
      <>
        <PageHeader title="Order Placed!" />
        <div className="max-w-2xl mx-auto px-4 py-6 safe-bottom space-y-5">
          {/* Success Banner */}
          <div className="bg-success/10 border border-success/30 rounded-2xl p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
            <h2 className="text-xl font-bold">Order #{placedOrder.id}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pickup at <strong>{placedOrder.time_slot}</strong>
            </p>
          </div>

          {/* OTP Card */}
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Your Pickup OTP</h3>
            </div>
            <div className="text-4xl font-bold tracking-[0.3em] text-primary my-3">
              {placedOrder.otp}
            </div>
            <p className="text-xs text-muted-foreground">
              Show this OTP at the counter to collect your order
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-full"
              onClick={() => {
                navigator.clipboard.writeText(placedOrder.otp || "");
                toast.success("OTP copied!");
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy OTP
            </Button>
          </div>

          {/* Payment Section */}
          <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Pay ₹{placedOrder.total_price} via UPI
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pay using PhonePe, Google Pay, or any UPI app
            </p>

            <Button
              onClick={openUPI}
              className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold mb-3"
              id="pay-upi-btn"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Pay ₹{placedOrder.total_price} via UPI
            </Button>

            {!paidClicked ? (
              <Button
                onClick={handlePaid}
                variant="outline"
                className="w-full h-11 rounded-full font-semibold border-success text-success hover:bg-success/10"
                id="i-have-paid-btn"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I have paid
              </Button>
            ) : (
              <div className="bg-success/10 border border-success/30 rounded-xl p-3 text-center">
                <p className="text-sm font-medium text-success">
                  ✓ Payment acknowledgment sent
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Admin will verify and mark as paid
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="space-y-1.5">
              {placedOrder.items.map((oi) => (
                <div
                  key={oi.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {oi.item?.name || `Item #${oi.item_id}`} × {oi.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{oi.price_at_time * oi.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">
                ₹{placedOrder.total_price}
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            className="w-full rounded-full font-semibold"
          >
            View My Orders
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="w-full rounded-full font-semibold"
          >
            Order More
          </Button>
        </div>
      </>
    );
  }

  // ─── Pre-Place Screen ───
  return (
    <>
      <PageHeader title="Checkout" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 safe-bottom">
        <section className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {i.name} × {i.qty}
                </span>
                <span className="font-medium">₹{i.price * i.qty}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">₹{total}</span>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Pickup at{" "}
            <span className="font-semibold text-foreground">{slotTime}</span>
          </div>
        </section>

        <section className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Payment: UPI
          </h2>
          <p className="text-sm text-muted-foreground">
            After placing the order, you'll be able to pay via UPI (PhonePe /
            Google Pay)
          </p>
        </section>

        <Button
          onClick={placeOrder}
          disabled={placing}
          className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold"
          id="place-order-btn"
        >
          {placing ? "Placing order..." : `Place Order · ₹${total}`}
        </Button>
      </div>
    </>
  );
}
