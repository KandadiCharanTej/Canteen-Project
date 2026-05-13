import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/services/api";
import { Order } from "@/types";
import { Check, Clock, Package, AlertCircle, CheckCircle2, ChevronRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

export function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersApi.getOrders(),
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Status updated");
    },
  });

  const updatePayment = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updatePayment(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Payment status updated");
    },
  });

  if (isLoading) return <div className="space-y-4">
    {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
  </div>;

  const activeOrders = orders.filter(o => o.status !== "Completed" && o.status !== "Cancelled");

  return (
    <div className="space-y-4">
      {activeOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
           <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
           <p className="text-sm font-bold text-gray-400">No active orders</p>
        </div>
      ) : (
        activeOrders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                  #{o.id}
                </div>
                <div>
                   <p className="text-[14px] font-black text-gray-900">{o.user?.name || "Guest"}</p>
                   <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                     <Phone className="h-2.5 w-2.5" /> {o.user?.contact}
                   </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-black text-gray-900">₹{o.total_price}</p>
                <p className="text-[10px] font-bold text-gray-400">{o.time_slot}</p>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50/50">
               {o.items.map(i => (
                 <div key={i.id} className="text-[12px] font-bold text-gray-600 flex justify-between">
                   <span>{i.quantity}x {i.item?.name}</span>
                   <span>₹{i.price_at_time * i.quantity}</span>
                 </div>
               ))}
               {o.special_instructions && (
                 <div className="mt-2 p-2 bg-orange-50 rounded-lg text-[11px] font-bold text-orange-700 border border-orange-100">
                   Note: {o.special_instructions}
                 </div>
               )}
            </div>

            <div className="p-4 flex flex-wrap gap-2">
              {o.payment_status !== "paid" && (
                <Button 
                  size="sm" 
                  onClick={() => updatePayment.mutate({ id: o.id, status: "paid" })}
                  className="bg-green-600 hover:bg-green-700 text-white font-black text-[11px] rounded-lg h-9 px-4"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" /> Mark Paid
                </Button>
              )}

              {o.status === "Pending Payment" && o.payment_status === "paid" && (
                <Button 
                  size="sm" 
                  onClick={() => updateStatus.mutate({ id: o.id, status: "Preparing" })}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black text-[11px] rounded-lg h-9 px-4"
                >
                  <Clock className="h-3.5 w-3.5 mr-1.5" /> Start Prep
                </Button>
              )}

              {o.status === "Preparing" && (
                <Button 
                  size="sm" 
                  onClick={() => updateStatus.mutate({ id: o.id, status: "Ready" })}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-black text-[11px] rounded-lg h-9 px-4"
                >
                  <Package className="h-3.5 w-3.5 mr-1.5" /> Mark Ready
                </Button>
              )}
              
              <div className={cn(
                "ml-auto self-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                o.status === "Ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              )}>
                {o.status}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}


