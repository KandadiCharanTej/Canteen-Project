import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
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
    refetchInterval: 5000, // Smart polling every 5 seconds
    staleTime: 2000,
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
  }, [isLoggedIn, navigate]);

  // Handle live notifications
  useEffect(() => {
    if (orders.length > 0 && prevOrdersRef.current.length > 0) {
      const prevMap = new Map(prevOrdersRef.current.map(o => [o.id, o]));
      
      orders.forEach(order => {
        const prev = prevMap.get(order.id);
        if (prev && prev.status !== order.status) {
          // Play sound
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
          audio.play().catch(() => {});
          
          toast.success(`Order #${order.id} is now ${order.status}!`, {
            description: "Check your order details for more info."
          });
        }
      });
    }
    prevOrdersRef.current = orders;
  }, [orders]);

  if (!isLoggedIn) return null;
  
  if (isLoading)
    return (
      <div className="bg-gray-50 min-h-screen">
        <PageHeader title="My Orders" />
        <div className="px-4 py-8 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-white rounded-[2rem] border border-gray-100 animate-pulse shadow-sm" />
          ))}
        </div>
      </div>
    );

  const activeOrders = orders.filter(o => o.status !== "Completed");
  const pastOrders = orders.filter(o => o.status === "Completed");

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <PageHeader title="My Orders" />
      
      <div className="px-4 py-6 md:py-10 space-y-12">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] shadow-sm border border-gray-100">
            <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShoppingBag className="h-12 w-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 font-medium mb-8">Ready to taste something delicious?</p>
            <Button onClick={() => navigate("/")} className="rounded-2xl px-10 h-14 font-black shadow-lg text-lg transition-all active:scale-95">
              Start Ordering
            </Button>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-black text-gray-900 text-2xl">Active Orders</h2>
                  <div className="flex-1 h-px bg-gray-100 md:hidden" />
                  <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full">{activeOrders.length}</span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {activeOrders.map((o) => <OrderCard key={o.id} order={o} />)}
                </div>
              </section>
            )}
            
            {pastOrders.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8 pt-4">
                  <h2 className="font-black text-gray-400 text-2xl uppercase tracking-widest">Past Orders</h2>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
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
