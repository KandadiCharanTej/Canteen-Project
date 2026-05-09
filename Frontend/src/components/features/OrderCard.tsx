import { Order, OrderStatus } from "@/lib/types";
import { KeyRound, Copy, CheckCircle2, Clock, ChefHat, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STAGES: OrderStatus[] = ["Placed", "Preparing", "Ready", "Completed"];

interface Props {
  order: Order;
  isPast?: boolean;
}

export function OrderCard({ order: o, isPast = false }: Props) {
  const stageIdx = STAGES.indexOf(o.status);
  
  const getStageIcon = () => {
    if (o.status === "Placed") return <Clock className="h-5 w-5 text-blue-500" />;
    if (o.status === "Preparing") return <ChefHat className="h-5 w-5 text-orange-500" />;
    if (o.status === "Ready") return <ShoppingBag className="h-5 w-5 text-green-500" />;
    return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className={cn(
      "bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm transition-all hover:shadow-xl",
      isPast && "opacity-80 hover:opacity-100"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5 border-b border-gray-50 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
             <span className="font-black text-gray-900 text-lg">Order #{o.id}</span>
             <span className={cn(
               "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
               o.payment_status === "paid" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"
             )}>
               {o.payment_status === "paid" ? "Paid" : "Pending"}
             </span>
          </div>
          <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
            {new Date(o.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} 
            <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span> 
            Pickup: <span className="text-gray-900">{o.time_slot}</span>
          </p>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black shadow-sm border",
          o.status === "Placed" ? "bg-blue-50 text-blue-700 border-blue-100" :
          o.status === "Preparing" ? "bg-orange-50 text-orange-700 border-orange-100" :
          o.status === "Ready" ? "bg-green-50 text-green-700 border-green-100" :
          "bg-gray-50 text-gray-600 border-gray-200"
        )}>
          {getStageIcon()}
          {o.status.toUpperCase()}
        </div>
      </div>

      {/* Items */}
      <div className="text-base text-gray-600 space-y-2 mb-6">
        {o.items.map((i) => (
          <div key={i.id} className="flex justify-between items-center">
            <span className="font-bold text-gray-800">
              <span className="text-gray-400 mr-2">{i.quantity} x</span>
              {i.item?.name || `Item #${i.item_id}`}
            </span>
            <span className="font-black text-gray-900">₹{i.price_at_time * i.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center border-t-2 border-dashed border-gray-50 pt-4 mb-6">
        <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total Paid</span>
        <span className="font-black text-gray-900 text-2xl">₹{o.total_price}</span>
      </div>

      {/* Tracking / OTP UI */}
      {!isPast ? (
        <div className="bg-gray-50 rounded-[1.5rem] p-5 border border-gray-100">
          {/* OTP Box */}
          {o.otp && o.status !== "Completed" && (
            <div className="bg-white rounded-[1.25rem] p-4 mb-5 flex items-center justify-between border-2 border-primary/20 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Pickup OTP</p>
                  <p className="text-2xl font-black tracking-[0.3em] text-gray-900 leading-none">{o.otp}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(o.otp || "");
                  toast.success("OTP copied to clipboard!");
                }}
                className="bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all active:scale-95 border border-gray-100"
              >
                <Copy className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          )}

          {/* Timeline UI */}
          <div className="px-2">
            <div className="flex items-center justify-between mb-3">
              {STAGES.slice(0, 3).map((stage, idx) => {
                const isActive = idx <= stageIdx;
                const isCurrent = idx === stageIdx;
                return (
                  <div key={stage} className="flex flex-col items-center relative z-10">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-4 bg-white transition-all duration-500",
                      isActive ? "border-primary" : "border-gray-200",
                      isCurrent && "scale-125 shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]"
                    )} />
                  </div>
                );
              })}
            </div>
            
            <div className="relative h-2 bg-gray-200 rounded-full mb-4">
               <div 
                 className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${(stageIdx / 2) * 100}%` }}
               />
            </div>
            
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-gray-400">
              <span className={cn(stageIdx >= 0 && "text-primary")}>Placed</span>
              <span className={cn(stageIdx >= 1 && "text-primary")}>Preparing</span>
              <span className={cn(stageIdx >= 2 && "text-primary")}>Ready</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 text-sm font-black text-green-700 bg-green-50 py-4 rounded-2xl border border-green-100">
          <CheckCircle2 className="h-5 w-5" /> ORDER COMPLETED
        </div>
      )}
    </div>
  );
}
