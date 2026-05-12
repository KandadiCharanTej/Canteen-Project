"use client";

import { Order, OrderStatus } from "@/types";
import { KeyRound, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DISPLAY_STAGES = ["Verifying", "Preparing", "Ready", "Done"];

interface Props {
  order: Order;
  isPast?: boolean;
}

export function OrderCard({ order: o, isPast = false }: Props) {
  const currentStageIdx = o.status === "Completed" ? 3 : 
                         o.status === "Ready" ? 2 : 
                         o.status === "Preparing" ? 1 : 
                         o.status === "Pending Payment" && o.payment_status === "verification_pending" ? 0 : 0;

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-100 shadow-sm transition-all overflow-hidden",
      isPast && "opacity-80"
    )}>
      {/* Header Info */}
      <div className="p-3.5 flex justify-between items-start border-b border-gray-50 bg-gray-50/30">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
             <span className="font-black text-gray-900 text-[14px]">#{o.id}</span>
             <span className={cn(
               "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
               o.payment_status === "paid" ? "bg-green-50 text-green-700 border-green-100" : 
               o.payment_status === "verification_pending" ? "bg-blue-50 text-blue-700 border-blue-100 animate-pulse" : 
               "bg-red-50 text-red-700 border-red-100"
             )}>
               {o.payment_status === "verification_pending" ? "Verifying Pay" : o.payment_status}
             </span>
          </div>
          <p className="text-[10px] text-gray-500 font-bold">
            {new Date(o.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {o.time_slot}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-[14px] text-gray-900 leading-tight">₹{o.total_price}</p>
          <p className={cn(
            "text-[9px] font-black uppercase mt-1",
            o.status === "Ready" ? "text-green-600" : o.status === "Preparing" ? "text-orange-600" : "text-gray-400"
          )}>
            {o.status}
          </p>
        </div>
      </div>
 
      {/* Items Section */}
      <div className="px-3.5 py-3 space-y-1 border-b border-gray-50">
        {o.items.map((i) => (
          <div key={i.id} className="flex justify-between items-center text-[12px]">
            <span className="font-medium text-gray-700 truncate max-w-[200px]">
              <span className="text-gray-400 mr-1.5">{i.quantity}x</span>
              {i.item?.name || `Item #${i.item_id}`}
            </span>
          </div>
        ))}
      </div>
 
      {/* Tracking / OTP UI */}
      {!isPast ? (
        <div className="p-3 bg-white">
          {/* OTP Box - Highlighted when Ready */}
          {o.otp && o.status === "Ready" && (
            <div className="bg-primary/5 rounded-lg p-2.5 mb-3 flex items-center justify-between border border-primary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
                   <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[8px] text-primary/70 font-black uppercase tracking-wider mb-0.5">Your OTP for Pickup</p>
                  <p className="text-[18px] font-black tracking-widest text-primary leading-none">{o.otp}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(o.otp || "");
                  toast.success("OTP copied!");
                }}
                className="bg-primary/10 hover:bg-primary/20 p-2 rounded-md transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-primary" />
              </button>
            </div>
          )}
 
          {/* Progress Timeline */}
          <div className="relative px-2 pt-1 pb-2">
            <div className="flex items-center justify-between mb-2 relative z-10">
              {DISPLAY_STAGES.map((stage, idx) => (
                <div key={stage} className={cn(
                  "w-2 h-2 rounded-full transition-all duration-500",
                  idx <= currentStageIdx ? "bg-primary shadow-[0_0_8px_rgba(234,88,12,0.4)]" : "bg-gray-100 border border-gray-200"
                )} />
              ))}
            </div>
            
            <div className="absolute top-[9px] left-4 right-4 h-[2px] bg-gray-100 -z-0 rounded-full">
               <div 
                 className="h-full bg-primary transition-all duration-700 rounded-full" 
                 style={{ width: `${(Math.min(currentStageIdx, 3) / 3) * 100}%` }}
               />
            </div>
            
            <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
              {DISPLAY_STAGES.map((s, idx) => (
                <span key={s} className={cn(
                  idx <= currentStageIdx ? "text-primary" : "text-gray-300",
                  idx === 0 ? "text-left" : idx === 3 ? "text-right" : "text-center"
                )}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black text-green-700 bg-green-50/50 uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" /> Delivered on {new Date(o.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
