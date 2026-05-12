import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { Smartphone, CheckCircle2, Copy, ReceiptText, ChevronRight, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    const instructions = sessionStorage.getItem("checkout_instructions");
    try {
      const order = await ordersApi.createOrder({
        time_slot: slotTime,
        special_instructions: instructions || undefined,
        items: items.map((i) => ({ item_id: i.id, quantity: i.qty })),
      });
      clear();
      sessionStorage.removeItem("checkout_slot");
      sessionStorage.removeItem("checkout_instructions");
      setPlacedOrder(order);
      setPlaced(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  const openUPI = (app?: string) => {
    const amount = placedOrder?.total_price || total;
    let upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Order_${placedOrder?.id || ""}`;
    
    // Add specific app package intents if possible, though upi://pay usually prompts the chooser on mobile.
    if (app === "phonepe") upiLink = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Order_${placedOrder?.id}`;
    if (app === "gpay") upiLink = `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Order_${placedOrder?.id}`;
    if (app === "paytm") upiLink = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Order_${placedOrder?.id}`;

    window.location.href = upiLink;
  };

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && placedOrder) {
      setUploading(true);
      try {
        await ordersApi.uploadScreenshot(placedOrder.id, file);
        setScreenshot(file);
        toast.success("Screenshot uploaded!");
      } catch {
        toast.error("Failed to upload screenshot");
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePaid = async () => {
    if (placedOrder) {
      try {
        await ordersApi.markSelfPaid(placedOrder.id);
        setPaidClicked(true);
        toast.success("Payment submitted for verification!");
      } catch {
        toast.error("Failed to submit payment verification");
      }
    }
  };

  if (!slotTime && !placed) return null;

  // ─── Order Placed & Payment Screen ───
  if (placed && placedOrder) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-6 px-4 max-w-md mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle2 className="h-8 w-8 text-green-600" />
           </div>
           <h2 className="text-[20px] font-black text-gray-900 leading-tight">Order Created!</h2>
           <p className="text-xs font-bold text-gray-500 mt-1">Order #{placedOrder.id}</p>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-bold text-[14px] text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" /> Complete Payment
          </h3>
          
          {!paidClicked ? (
             <div className="space-y-4">
               <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => openUPI("gpay")} className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                  </button>
                  <button onClick={() => openUPI("phonepe")} className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-purple-200 transition-all">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/PhonePe_Logo.svg" alt="PhonePe" className="h-5" />
                  </button>
                  <button onClick={() => openUPI("paytm")} className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                     <span className="text-[10px] font-black text-sky-500">PayTM</span>
                  </button>
                  <button onClick={() => openUPI()} className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/20 transition-all">
                     <span className="text-[10px] font-black text-gray-500">Other</span>
                  </button>
               </div>

               <div className="relative mt-2">
                  <input 
                    type="file" id="screenshot" className="hidden" accept="image/*"
                    onChange={handleScreenshotUpload} disabled={uploading}
                  />
                  <label 
                    htmlFor="screenshot" 
                    className={cn(
                      "w-full h-12 rounded-xl border border-dashed border-gray-300 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-all",
                      screenshot && "border-green-300 bg-green-50"
                    )}
                  >
                    {uploading ? (
                      <span className="text-[12px] font-bold text-gray-400">Uploading...</span>
                    ) : screenshot ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-[12px] font-bold text-green-800">Screenshot Attached</span>
                      </>
                    ) : (
                      <span className="text-[12px] font-bold text-gray-500">Attach Screenshot (Optional)</span>
                    )}
                  </label>
               </div>

               <Button onClick={handlePaid} className="w-full h-12 rounded-xl font-bold text-[14px] bg-[#60b246] hover:bg-[#529b3b] shadow-sm transition-transform active:scale-95">
                 I Have Paid ₹{placedOrder.total_price}
               </Button>
             </div>
          ) : (
             <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-xl border border-orange-100">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center animate-spin-slow">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-orange-800">Verifying Payment</p>
                  <p className="text-[11px] font-medium text-orange-600 mt-0.5">Please wait while admin confirms.</p>
                </div>
             </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate("/")} variant="outline" className="flex-1 h-12 rounded-xl font-bold border-gray-200 text-[13px]">
            Menu
          </Button>
          <Button onClick={() => navigate("/orders")} className="flex-1 h-12 rounded-xl font-bold shadow-sm text-[13px]">
            Track Order
          </Button>
        </div>
      </div>
    );
  }

  // ─── Pre-Place Screen ───
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 pt-4 px-4 md:pt-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[18px] font-black text-gray-900">Checkout</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
           <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50">
             <div className="flex items-center gap-2">
               <Clock className="w-4 h-4 text-gray-400" />
               <span className="text-[13px] font-bold text-gray-600">Pickup Time</span>
             </div>
             <span className="font-black text-[14px] text-gray-900">{slotTime}</span>
           </div>

           <div className="space-y-2 mb-4">
             {items.map((i) => (
               <div key={i.id} className="flex justify-between text-[13px]">
                 <span className="font-medium text-gray-700">
                   <span className="text-gray-400 mr-2">{i.qty}x</span> 
                   {i.name}
                 </span>
                 <span className="font-bold text-gray-900">₹{i.price * i.qty}</span>
               </div>
             ))}
           </div>
           
           <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-center">
             <span className="font-bold text-[13px] text-gray-900">Total</span>
             <span className="font-black text-[16px] text-gray-900">₹{total}</span>
           </div>
        </div>
      </div>

      {/* Sticky Bottom Place Order */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-40 max-w-lg mx-auto">
         <button
           onClick={placeOrder}
           disabled={placing}
           className={cn(
             "w-full bg-[#60b246] hover:bg-[#529b3b] text-white font-bold py-3.5 rounded-xl shadow-md shadow-green-600/20 transition-transform active:scale-95 flex items-center justify-center gap-2 text-[15px]",
             placing && "opacity-70 pointer-events-none"
           )}
         >
           {placing ? "Placing..." : `Place Order • ₹${total}`}
         </button>
      </div>
    </div>
  );
}
