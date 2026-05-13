import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Clock, ChevronRight, ArrowLeft, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { slotsApi } from "@/services/api";
import { TimeSlot } from "@/types";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

export default function Cart() {
  const { items, setQty, total } = useCart();
  const { isLoggedIn, user } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?from=/cart");
      return;
    }
  }, [isLoggedIn, router]);

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
    if (instructions) {
      sessionStorage.setItem("checkout_instructions", instructions);
    } else {
      sessionStorage.removeItem("checkout_instructions");
    }
    navigate("/checkout");
  };

  if (!isLoggedIn) return null;

  if (items.length === 0) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex flex-col items-center justify-center p-4">
        <button onClick={() => navigate("/")} className="absolute top-6 left-4 flex items-center gap-2 text-sm font-bold text-gray-500">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <div className="text-6xl mb-4 opacity-50 grayscale">🛒</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cart is empty</h2>
        <p className="text-sm text-gray-500 mb-6">Add some items from the menu.</p>
        <button onClick={() => navigate("/")} className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl active:scale-95 transition-transform">
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 md:pb-12 pt-4 px-4 md:pt-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[18px] font-black text-gray-900">Your Order</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex gap-3 justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className={cn("h-3 w-3 border-2 rounded-sm flex items-center justify-center", i.veg_flag ? "border-green-600" : "border-red-600")}>
                    <div className={cn("h-1.5 w-1.5 rounded-full", i.veg_flag ? "bg-green-600" : "bg-red-600")} />
                  </div>
                  <h3 className="font-bold text-[14px] text-gray-900 leading-tight">{i.name}</h3>
                </div>
                <p className="text-[13px] font-bold text-gray-600 mb-2">₹{i.price}</p>
              </div>
              
              <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-lg p-0.5 w-[75px] justify-between">
                <button
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 rounded-md text-primary"
                  onClick={() => setQty(i.id, i.qty - 1)}
                >
                  <Minus className="h-3 w-3 stroke-[3]" />
                </button>
                <span className="font-bold text-xs">{i.qty}</span>
                <button
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-50 rounded-md text-primary"
                  onClick={() => setQty(i.id, i.qty + 1)}
                >
                  <Plus className="h-3 w-3 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Slot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 mb-3">
        <div className="flex items-center gap-2 mb-2.5">
           <Clock className="h-3.5 w-3.5 text-primary" />
           <h2 className="text-[13px] font-bold text-gray-900">Pickup Time</h2>
        </div>
        
        {loadingSlots ? (
           <div className="h-10 bg-gray-50 animate-pulse rounded-lg"></div>
        ) : availableSlots.length === 0 ? (
          <p className="text-[11px] text-red-500 font-bold">No slots available right now</p>
        ) : (
          <div className="relative">
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full h-10 pl-3.5 pr-10 rounded-lg bg-gray-50 border border-gray-100 text-[13px] font-bold text-gray-900 appearance-none focus:outline-none focus:border-primary/30"
            >
              <option value="" disabled>Select time</option>
              {availableSlots.map((s) => {
                const hour = parseInt(s.slot_time.split(":")[0]);
                const isLunch = (hour === 12 && s.slot_time.includes("PM")) || (hour === 1 && s.slot_time.includes("PM"));
                return (
                  <option key={s.id} value={s.slot_time} className={isLunch ? "font-bold text-primary" : ""}>
                    {s.slot_time} {isLunch ? "🍱 Lunch Peak" : ""}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
            </div>
          </div>
        )}
      </div>

      {/* Special Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 mb-3">
        <div className="flex items-center gap-2 mb-2.5">
           <MessageSquare className="h-3.5 w-3.5 text-primary" />
           <h2 className="text-[13px] font-bold text-gray-900">Add Notes</h2>
        </div>
        <input
          type="text"
          placeholder="e.g. Less spicy, Extra chutney (Optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full h-10 px-3.5 rounded-lg bg-gray-50 border border-gray-100 text-[12px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-primary/30"
        />
      </div>

      {/* Bill Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 mb-4">
        <h2 className="text-[13px] font-bold text-gray-900 mb-2.5">Bill Details</h2>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between font-medium text-gray-600">
            <span>Item Total</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between font-medium text-gray-600 border-b border-dashed border-gray-100 pb-3">
            <span>Platform Fee</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-black text-gray-900 pt-1 text-[15px]">
            <span>To Pay</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 z-40 max-w-lg mx-auto">
         <div className="flex items-center justify-between gap-4">
           <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-500">Total</span>
             <span className="font-black text-[18px] text-gray-900">₹{total}</span>
           </div>
           <button
             onClick={proceed}
             className="flex-1 bg-[#60b246] hover:bg-[#529b3b] text-white font-bold py-3.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-1 shadow-md shadow-green-600/20"
           >
             Proceed to Pay <ChevronRight className="h-4 w-4" />
           </button>
         </div>
      </div>
    </div>
  );
}


