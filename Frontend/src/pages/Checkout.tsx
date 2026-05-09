import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { Smartphone, CheckCircle2, Copy, KeyRound, ReceiptText, ChevronRight, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      <div className="bg-gray-50 min-h-screen pb-24">
        <PageHeader title="Order Summary" />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          
          {/* Success Header */}
          <div className="text-center py-4">
             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 relative before:absolute before:inset-0 before:bg-green-500/20 before:rounded-full before:animate-ping">
               <CheckCircle2 className="h-10 w-10 text-green-600" />
             </div>
             <h2 className="text-2xl font-black text-gray-900 mb-1">Order Placed!</h2>
             <p className="text-sm font-medium text-gray-500">Order #{placedOrder.id} is confirmed</p>
          </div>

          {/* OTP Card */}
          <div className="bg-gradient-to-br from-primary to-orange-400 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
               <KeyRound className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
            </div>
            
            <p className="text-sm font-bold uppercase tracking-widest text-white/80 mb-1 relative z-10">Your Pickup OTP</p>
            <div className="text-5xl font-black tracking-[0.2em] mb-4 relative z-10">{placedOrder.otp}</div>
            
            <div className="flex items-center gap-3 relative z-10 bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
               <Clock className="w-5 h-5 text-white/90" />
               <div className="flex-1">
                 <p className="text-xs font-bold text-white/70 uppercase">Pickup Time</p>
                 <p className="text-base font-bold">{placedOrder.time_slot}</p>
               </div>
               <Button size="icon" variant="ghost" onClick={() => {
                  navigator.clipboard.writeText(placedOrder.otp || "");
                  toast.success("OTP copied!");
                }} className="bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
                  <Copy className="h-4 w-4" />
               </Button>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-500" /> Payment
            </h3>
            
            {!paidClicked ? (
               <div className="space-y-3">
                 <Button onClick={openUPI} className="w-full h-14 rounded-2xl font-black text-lg bg-blue-600 hover:bg-blue-700 shadow-sm transition-all" id="pay-upi-btn">
                   Pay ₹{placedOrder.total_price} via UPI
                 </Button>
                 <Button onClick={handlePaid} variant="outline" className="w-full h-14 rounded-2xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50 transition-all" id="i-have-paid-btn">
                   I have already paid
                 </Button>
               </div>
            ) : (
               <div className="flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Payment acknowledgment sent</p>
                    <p className="text-xs font-medium text-green-600 mt-0.5">Admin will verify your payment shortly</p>
                  </div>
               </div>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-gray-400" /> Bill Details
            </h3>
            <div className="space-y-3">
              {placedOrder.items.map((oi) => (
                <div key={oi.id} className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    <span className="text-gray-400 mr-2">{oi.quantity}x</span> 
                    {oi.item?.name || `Item #${oi.item_id}`}
                  </span>
                  <span className="font-bold text-gray-900">
                    ₹{oi.price_at_time * oi.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-black text-xl text-gray-900">
                ₹{placedOrder.total_price}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => navigate("/")} variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-gray-200">
              Menu
            </Button>
            <Button onClick={() => navigate("/orders")} className="flex-1 h-14 rounded-2xl font-bold shadow-sm">
              Track Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pre-Place Screen ───
  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <PageHeader title="Checkout" showBack />
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-5">
           <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
             <div className="bg-blue-50 p-2.5 rounded-xl">
               <Clock className="w-5 h-5 text-blue-600" />
             </div>
             <div>
               <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Pickup Time</p>
               <p className="text-lg font-black text-gray-900 leading-none">{slotTime}</p>
             </div>
           </div>

           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
             <ReceiptText className="h-5 w-5 text-gray-400" /> Order Details
           </h3>
           
           <div className="space-y-3 mb-5">
             {items.map((i) => (
               <div key={i.id} className="flex justify-between text-sm">
                 <span className="font-medium text-gray-700">
                   <span className="text-gray-400 mr-2">{i.qty}x</span> 
                   {i.name}
                 </span>
                 <span className="font-bold text-gray-900">₹{i.price * i.qty}</span>
               </div>
             ))}
           </div>
           
           <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
             <span className="font-bold text-gray-900">Total Amount</span>
             <span className="font-black text-2xl text-gray-900">₹{total}</span>
           </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <div>
               <h2 className="font-bold text-gray-900 leading-tight">Payment Method</h2>
               <p className="text-xs font-medium text-gray-500">Pay via UPI after placing the order</p>
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Checkout */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 z-40">
         <div className="max-w-2xl mx-auto flex items-center gap-4">
           <div className="flex-1 flex flex-col">
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</span>
             <span className="font-black text-xl text-gray-900">₹{total}</span>
           </div>
           <button
             onClick={placeOrder}
             disabled={placing}
             className={cn(
               "flex-none bg-[#60b246] hover:bg-[#529b3b] text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2",
               placing && "opacity-70 pointer-events-none"
             )}
             id="place-order-btn"
           >
             {placing ? "Placing..." : "Place Order"} <ChevronRight className="h-5 w-5" />
           </button>
         </div>
      </div>
    </div>
  );
}
