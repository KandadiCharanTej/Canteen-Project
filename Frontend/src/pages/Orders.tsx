import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ordersApi } from "@/lib/api";
import { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderCard } from "@/components/features/OrderCard";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Orders() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const prevOrdersRef = useRef<Order[]>([]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getOrders(),
    enabled: isLoggedIn,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (orders.length > 0 && prevOrdersRef.current.length > 0) {
      const prevMap = new Map(prevOrdersRef.current.map(o => [o.id, o]));
      
      orders.forEach(order => {
        const prev = prevMap.get(order.id);
        if (prev && prev.status !== order.status) {
          toast.success(`Order #${order.id} is now ${order.status}!`);
        }
      });
    }
    prevOrdersRef.current = orders;
  }, [orders]);

  if (!isLoggedIn) return null;
  
  if (isLoading)
    return (
      <div className="bg-[#f8f9fa] min-h-screen">
        <PageHeader title="My Orders" />
        <div className="px-4 py-8 max-w-lg mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );

  const activeOrders = orders.filter(o => o.status !== "Completed");
  const pastOrders = orders.filter(o => o.status === "Completed");

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 md:pb-12">
      <PageHeader title="My Orders" />
      
      <div className="px-4 py-6 md:py-8 max-w-lg mx-auto space-y-8">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <ShoppingBag className="h-8 w-8 text-gray-300" />
            </div>
            <h2 className="text-[18px] font-black text-gray-900 mb-1">No orders yet</h2>
            <p className="text-[13px] text-gray-500 font-medium mb-6">Ready to taste something delicious?</p>
            <Button onClick={() => navigate("/")} className="rounded-xl px-8 h-12 font-bold shadow-sm">
              Start Ordering
            </Button>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <section>
                <h2 className="font-black text-gray-900 text-[18px] mb-4">Active Orders</h2>
                <div className="space-y-4">
                  {activeOrders.map((o) => <OrderCard key={o.id} order={o} />)}
                </div>
              </section>
            )}
            
            {pastOrders.length > 0 && (
              <section>
                <h2 className="font-bold text-gray-500 text-[14px] uppercase tracking-wider mb-4 mt-6">Past Orders</h2>
                <div className="space-y-4">
                  {pastOrders.map((o) => <OrderCard key={o.id} order={o} isPast />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
