import { MenuItem } from "@/lib/types";
import { Plus, Minus, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import React from "react";

export const FoodCard = React.memo(function FoodCard({ item }: { item: MenuItem }) {
  const { items, add, setQty } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const inCart = items.find((i) => i.id === item.id);
  const isOut = item.available_quantity === 0;

  const handleAdd = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    add(item);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl p-2.5 flex gap-2.5 border border-gray-100 shadow-sm transition-all duration-200 group relative",
        isOut && "opacity-50 grayscale-[0.5]"
      )}
    >
      {/* Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
           {item.veg_flag !== undefined && (
             <div className="mb-1">
               <div className={cn("h-2.5 w-2.5 border-2 rounded-sm flex items-center justify-center", item.veg_flag ? "border-green-600" : "border-red-600")}>
                 <div className={cn("h-1 w-1 rounded-full", item.veg_flag ? "bg-green-600" : "bg-red-600")} />
               </div>
             </div>
           )}
           <h3 className="font-bold text-[14px] text-gray-900 leading-tight mb-0.5 truncate">
             {item.name}
           </h3>
           <div className="flex items-center gap-2 mb-1">
             <span className="font-black text-[13px] text-gray-800">₹{item.price}</span>
             {item.is_best && (
               <span className="flex items-center gap-0.5 text-[9px] font-black text-yellow-600 bg-yellow-50 px-1 py-0.5 rounded uppercase">
                 <Star className="h-2 w-2 fill-yellow-500 text-yellow-500" /> Best
               </span>
             )}
           </div>
        </div>

        <div className="flex items-center mt-auto">
          {isOut ? (
             <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Sold Out</span>
          ) : (
             <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase">In Stock</span>
          )}
        </div>
      </div>

      {/* Image & Action Section */}
      <div className="w-[85px] shrink-0 flex flex-col items-center">
        <div className="w-full h-[75px] rounded-lg overflow-hidden relative bg-gray-50">
          <img
            src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop"}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        <div className="-mt-3.5 z-10 w-[80%]">
          {inCart ? (
            <div className="flex items-center justify-between gap-1 bg-white border border-primary text-primary shadow-sm rounded-lg p-0.5 w-full">
              <button
                className="w-5 h-5 flex items-center justify-center hover:bg-primary/10 rounded-md"
                onClick={() => setQty(item.id, inCart.qty - 1)}
              >
                <Minus className="h-2.5 w-2.5 stroke-[3]" />
              </button>
              <span className="font-black text-[11px]">{inCart.qty}</span>
              <button
                className="w-5 h-5 flex items-center justify-center hover:bg-primary/10 rounded-md disabled:opacity-50"
                disabled={inCart.qty >= item.available_quantity}
                onClick={() => setQty(item.id, inCart.qty + 1)}
              >
                <Plus className="h-2.5 w-2.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              disabled={isOut}
              onClick={handleAdd}
              className={cn(
                "w-full h-7 bg-white border border-gray-200 text-primary font-black text-[10px] rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all",
                isOut && "opacity-50 cursor-not-allowed"
              )}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

