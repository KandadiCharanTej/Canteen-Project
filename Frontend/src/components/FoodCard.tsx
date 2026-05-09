import { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Star, Clock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FoodCard({ item }: { item: MenuItem }) {
  const { items, add, setQty } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const inCart = items.find((i) => i.id === item.id);
  const isOut = item.available_quantity === 0;
  const isLow = item.available_quantity > 0 && item.available_quantity <= 5;

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
        "bg-white rounded-[2rem] p-4 flex gap-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden",
        isOut && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
           {item.veg_flag !== undefined && (
             <div className="mb-1.5 w-fit">
               <div className={cn("h-3.5 w-3.5 border-2 rounded-sm flex items-center justify-center", item.veg_flag ? "border-green-600" : "border-red-600")}>
                 <div className={cn("h-1.5 w-1.5 rounded-full", item.veg_flag ? "bg-green-600" : "bg-red-600")} />
               </div>
             </div>
           )}
           <h3 className="font-bold text-base text-gray-900 leading-tight">
             {item.name}
           </h3>
           <div className="flex items-center gap-2 mt-1 mb-1">
             <span className="font-bold text-sm">₹{item.price}</span>
             {item.is_best && (
               <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                 <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Bestseller
               </span>
             )}
           </div>
           
           {item.description && (
             <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
               {item.description}
             </p>
           )}
        </div>

        <div className="flex items-center gap-3 mt-3">
          {isOut ? (
             <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">Sold out</span>
          ) : isLow ? (
             <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">Few Left</span>
          ) : (
             <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">In Stock</span>
          )}

          {item.prep_time && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Clock className="h-3 w-3 text-gray-300" /> {item.prep_time} mins
            </div>
          )}
        </div>
      </div>

      {/* Image & Action Section */}
      <div className="w-[130px] shrink-0 flex flex-col items-center">
        <div className="w-full h-[110px] rounded-2xl overflow-hidden relative shadow-sm">
          <img
            src={
              item.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
            }
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>
        
        <div className="-mt-4 z-10">
          {inCart ? (
            <div className="flex items-center justify-between gap-1 bg-white border border-primary text-primary shadow-sm rounded-xl px-1.5 py-1 w-[90px]">
              <button
                className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors"
                onClick={() => setQty(item.id, inCart.qty - 1)}
              >
                <Minus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <span className="font-bold text-sm">{inCart.qty}</span>
              <button
                className="w-6 h-6 flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                disabled={inCart.qty >= item.available_quantity}
                onClick={() => setQty(item.id, inCart.qty + 1)}
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              disabled={isOut}
              onClick={handleAdd}
              className={cn(
                "bg-white border border-gray-200 text-primary font-bold text-sm px-6 py-1.5 rounded-xl shadow-sm transition-all hover:bg-gray-50 active:scale-95 w-[90px]",
                isOut && "opacity-50 cursor-not-allowed border-gray-100 text-gray-400"
              )}
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
