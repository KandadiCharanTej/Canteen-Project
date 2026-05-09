import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Minus, Plus, Trash2, Clock, ChevronRight, ReceiptText } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      <div className="bg-gray-50 min-h-screen">
        <PageHeader title="Your Cart" showBack />
        <div className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center justify-center h-[70vh]">
          <div className="w-40 h-40 mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <div className="text-6xl opacity-50 grayscale">🛒</div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-[250px]">Looks like you haven't added anything to your cart yet.</p>
          <Button onClick={() => navigate("/")} className="rounded-xl px-8 h-12 font-bold bg-primary hover:bg-primary/90 w-full sm:w-auto shadow-sm">
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <PageHeader title="Your Cart" showBack />
      
      <div className="px-4 pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                 <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                   <ReceiptText className="h-6 w-6 text-primary" /> Order Summary
                 </h2>
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{items.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((i) => (
                  <div key={i.id} className="p-6 flex gap-6 hover:bg-gray-50/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      {i.veg_flag !== undefined && (
                         <div className="mb-2 w-fit">
                           <div className={cn("h-3.5 w-3.5 border-2 rounded-sm flex items-center justify-center", i.veg_flag ? "border-green-600" : "border-red-600")}>
                             <div className={cn("h-1.5 w-1.5 rounded-full", i.veg_flag ? "bg-green-600" : "bg-red-600")} />
                           </div>
                         </div>
                      )}
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{i.name}</h3>
                      <p className="text-base font-black text-gray-400">₹{i.price}</p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between gap-4">
                      <div className="flex items-center gap-3 bg-white border-2 border-gray-100 shadow-sm rounded-2xl px-2 py-1.5">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-xl transition-colors"
                          onClick={() => setQty(i.id, i.qty - 1)}
                        >
                          <Minus className="h-4 w-4 stroke-[3]" />
                        </button>
                        <span className="font-black text-lg w-6 text-center">{i.qty}</span>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/5 rounded-xl transition-colors"
                          onClick={() => setQty(i.id, i.qty + 1)}
                        >
                          <Plus className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                      <p className="text-lg font-black text-gray-900">₹{i.price * i.qty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Slot & Bill */}
          <div className="space-y-6">
            {/* Time Slot Selection */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                 <div className="bg-blue-50 p-3 rounded-2xl">
                   <Clock className="h-6 w-6 text-blue-500" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black text-gray-900 leading-tight">Pickup Time</h2>
                   <p className="text-sm font-medium text-gray-500">Select pickup slot</p>
                 </div>
              </div>
              
              {loadingSlots ? (
                 <div className="h-14 bg-gray-50 animate-pulse rounded-2xl"></div>
              ) : (
                <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                  <SelectTrigger className="w-full h-16 rounded-2xl border-gray-100 bg-gray-50 focus:ring-primary/20 transition-all font-bold text-lg shadow-sm px-6" id="time-slot-select">
                    <SelectValue placeholder="Choose a pickup time..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl shadow-xl border-gray-100 max-h-72 p-2">
                    {availableSlots.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No available slots currently
                      </SelectItem>
                    ) : (
                      availableSlots.map((s) => (
                        <SelectItem key={s.id} value={s.slot_time} className="py-4 cursor-pointer rounded-xl">
                          <div className="flex items-center justify-between w-full min-w-[240px]">
                            <span className="font-bold text-gray-900 text-lg">{s.slot_time}</span>
                            <span className="text-xs font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                              {s.max_orders - s.current_orders} left
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Bill Details */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Bill Details</h2>
              <div className="space-y-4 text-base">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Item Total</span>
                  <span className="text-gray-900">₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t-2 border-dashed border-gray-50 pt-5 mt-5 flex justify-between items-center">
                  <span className="font-black text-gray-900 text-xl">To Pay</span>
                  <span className="font-black text-gray-900 text-2xl">₹{total}</span>
                </div>
              </div>
              
              <Button 
                onClick={proceed}
                className="w-full h-16 rounded-2xl bg-[#60b246] hover:bg-[#529b3b] shadow-lg text-white font-black text-xl mt-8 transition-all active:scale-95 hidden md:flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Checkout (Mobile Only) */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] p-5 z-40 md:hidden">
         <div className="flex items-center gap-4">
           <div className="flex-1 flex flex-col">
             <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">To Pay</span>
             <span className="font-black text-2xl text-gray-900">₹{total}</span>
           </div>
           <button
             onClick={proceed}
             className="flex-none bg-[#60b246] hover:bg-[#529b3b] text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 text-lg"
             id="proceed-checkout-btn"
           >
             Next <ChevronRight className="h-6 w-6" />
           </button>
         </div>
      </div>
    </div>
  );
}
