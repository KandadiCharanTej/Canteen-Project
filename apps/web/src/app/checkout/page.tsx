"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi } from "@/services/api";
import { Order } from "@/types";
import { CheckCircle2, Copy, ChevronRight, Clock, ArrowLeft, QrCode, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

// ─────────── CONFIG ───────────
const UPI_ID = "kandadicharantej21@ybl";
const UPI_NAME = "QuickBite";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [slotTime, setSlotTime] = useState<string>("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [paidClicked, setPaidClicked] = useState(false);
  const [paymentView, setPaymentView] = useState<"options" | "qr" | "screenshot">("options");

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login?from=/checkout");
      return;
    }
    const slot = sessionStorage.getItem("checkout_slot");
    if (!placed && (!slot || items.length === 0)) {
      router.replace("/cart");
      return;
    }
    setSlotTime(slot || "");
  }, [items.length, router, isLoggedIn, placed]);

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
      window.scrollTo(0, 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  const getUPILink = () => {
    const amount = placedOrder?.total_price || total;
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=Order_${placedOrder?.id || ""}`;
  };

  const openApp = (app: string) => {
    const link = getUPILink();
    window.location.assign(link);
    setTimeout(() => {
      window.location.href = link;
    }, 250);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success("UPI ID Copied!");
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
        setPaymentView("options");
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

  if (placed && placedOrder) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen pb-24 pt-6 px-4 max-w-md mx-auto">
        <div className="text-center mb-6">
           <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
             <CheckCircle2 className="h-7 w-7 text-green-600" />
           </div>
           <h2 className="text-[20px] font-black text-gray-900">Order Placed!</h2>
           <p className="text-xs font-bold text-gray-500 mt-1">₹{placedOrder.total_price} • Order #{placedOrder.id}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
             <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Payment Portal</span>
             <div className="flex items-center gap-1.5 bg-green-100 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-green-700 uppercase">Live Secure</span>
             </div>
          </div>

          <div className="p-5">
            {!paidClicked ? (
              <>
                {paymentView === "options" && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase text-center mb-1">Pay Using UPI App</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => openApp("phonepe")} className="flex items-center gap-3 p-3 rounded-xl bg-[#fdfaff] border border-purple-100 hover:bg-purple-50 transition-all group active:scale-95">
                        <span className="text-[13px] font-black text-purple-700">PhonePe</span>
                      </button>
                      <button onClick={() => openApp("gpay")} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8faff] border border-blue-100 hover:bg-blue-50 transition-all active:scale-95">
                        <span className="text-[13px] font-black text-blue-700">Google Pay</span>
                      </button>
                      <button onClick={() => openApp("paytm")} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fbff] border border-sky-100 hover:bg-sky-50 transition-all active:scale-95">
                        <span className="text-[13px] font-black text-sky-700">Paytm</span>
                      </button>
                      <button onClick={() => setPaymentView("qr")} className="flex items-center gap-3 p-3 rounded-xl bg-[#fafafa] border border-gray-100 hover:bg-gray-50 transition-all active:scale-95">
                        <QrCode className="h-5 w-5 text-gray-600" />
                        <span className="text-[13px] font-black text-gray-700">Scan QR</span>
                      </button>
                    </div>

                    <div className="pt-2">
                       <button onClick={copyUPI} className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 hover:bg-gray-50 transition-all">
                          <div className="flex flex-col items-start">
                             <span className="text-[9px] font-bold text-gray-400 uppercase">UPI ID</span>
                             <span className="text-[12px] font-black text-gray-700">{UPI_ID}</span>
                          </div>
                          <Copy className="h-4 w-4 text-gray-400" />
                       </button>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                       <Button onClick={handlePaid} className="w-full h-12 rounded-xl font-black text-[14px] bg-[#60b246] hover:bg-[#529b3b] shadow-lg shadow-green-600/20">
                         I Have Completed Payment
                       </Button>
                       <button onClick={() => setPaymentView("screenshot")} className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors flex items-center justify-center gap-1 py-1">
                          <ImageIcon className="h-3 w-3" /> Upload Screenshot (Optional)
                       </button>
                    </div>
                  </div>
                )}

                {paymentView === "qr" && (
                  <div className="flex flex-col items-center py-4">
                    <h3 className="text-[14px] font-black text-gray-900 mb-4">Scan & Pay</h3>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                       <QRCodeSVG value={getUPILink()} size={180} level="H" includeMargin={true} />
                    </div>
                    <p className="text-[16px] font-black text-gray-900 mb-1">₹{placedOrder.total_price}</p>
                    <p className="text-[11px] font-bold text-gray-400 mb-6">Payable to {UPI_NAME}</p>
                    <Button onClick={() => setPaymentView("options")} variant="outline" className="h-10 px-8 rounded-full font-black text-[11px] uppercase tracking-wider">
                       Back to Apps
                    </Button>
                  </div>
                )}

                {paymentView === "screenshot" && (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                       <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-[15px] font-black text-gray-900 mb-1">Attach Proof</h3>
                    <p className="text-[11px] font-bold text-gray-400 mb-6 text-center">Upload a screenshot of your payment confirmation</p>
                    
                    <div className="w-full max-w-[240px] mb-6">
                       <input 
                         type="file" id="p-screenshot" className="hidden" accept="image/*"
                         onChange={handleScreenshotUpload} disabled={uploading}
                       />
                       <label 
                         htmlFor="p-screenshot" 
                         className={cn(
                           "w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-all",
                           screenshot && "border-green-300 bg-green-50"
                         )}
                       >
                         {uploading ? (
                           <div className="flex flex-col items-center gap-2">
                             <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                             <span className="text-[11px] font-bold text-gray-400">Uploading...</span>
                           </div>
                         ) : screenshot ? (
                           <div className="flex flex-col items-center gap-2 text-green-700">
                             <CheckCircle2 className="h-8 w-8" />
                             <span className="text-[11px] font-bold">Screenshot Attached</span>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center gap-2 text-gray-400">
                             <ExternalLink className="h-6 w-6" />
                             <span className="text-[11px] font-bold">Choose Image</span>
                           </div>
                         )}
                       </label>
                    </div>
                    <Button onClick={() => setPaymentView("options")} variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                       Cancel
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 relative">
                   <Clock className="w-8 h-8 text-orange-600 animate-spin-slow" />
                   <div className="absolute inset-0 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                 </div>
                 <h3 className="text-[18px] font-black text-gray-900 mb-2">Verifying Payment</h3>
                 <p className="text-[12px] font-bold text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                    Admin is checking your transaction. You will get an OTP once confirmed.
                 </p>
                 <div className="mt-8 flex flex-col gap-2 w-full">
                    <Button onClick={() => router.push("/orders")} className="w-full h-11 rounded-xl font-black text-[12px] uppercase tracking-wider">
                       Track in Orders
                    </Button>
                    <Button onClick={() => router.push("/")} variant="ghost" className="text-[11px] font-black text-gray-400">
                       Back to Menu
                    </Button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 pt-4 px-4 md:pt-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[18px] font-black text-gray-900">Final Step</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
           <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-4">Order Summary</h3>
           <div className="space-y-3">
             {items.map((i) => (
               <div key={i.id} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-gray-900">{i.name}</span>
                    <span className="text-[11px] font-bold text-gray-400">Qty: {i.qty}</span>
                  </div>
                  <span className="text-[14px] font-black text-gray-900">₹{i.price * i.qty}</span>
               </div>
             ))}
           </div>
        </div>
        
        <div className="p-5 space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4 text-primary" />
                 <span className="text-[13px] font-black text-gray-600">Pickup Slot</span>
              </div>
              <span className="text-[14px] font-black text-gray-900">{slotTime}</span>
           </div>

           <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
              <span className="text-[14px] font-black text-gray-900">Total Payable</span>
              <span className="text-[20px] font-black text-gray-900">₹{total}</span>
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-40 max-w-lg mx-auto">
         <button
           onClick={placeOrder}
           disabled={placing}
           className={cn(
             "w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-[16px]",
             placing && "opacity-70 pointer-events-none"
           )}
         >
           {placing ? (
             <div className="flex items-center gap-2">
               <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
               <span>Creating Order...</span>
             </div>
           ) : (
             <>
               <span>Proceed to Pay • ₹{total}</span>
               <ChevronRight className="h-5 w-5" />
             </>
           )}
         </button>
      </div>
    </div>
  );
}
