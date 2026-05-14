import { motion } from "framer-motion";
import { Plus, Minus, PackageCheck, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { Food } from "@/lib/data";
import { useStore } from "@/lib/store";
import { VegBadge } from "./AppShell";
import { cn } from "@/lib/utils";

export function FoodCard({ food }: { food: Food }) {
  const { cart, add, setQty } = useStore();
  const item = cart.find((i) => i.food.id === food.id);
  const qty = item?.qty ?? 0;

  const isLowStock = food.inStock && food.stockCount > 0 && food.stockCount <= 5;

  return (
    <motion.div
      layout
      className="bg-card rounded-[3.5rem] border border-border/40 flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Premium Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0">
        <motion.img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110",
            !food.inStock && "grayscale opacity-40",
          )}
        />
        
        {/* Floating Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
           <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-xl">
              <VegBadge veg={food.veg} />
           </div>
           {food.tag && food.inStock && (
              <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl">
                {food.tag}
              </span>
           )}
        </div>

        <div className="absolute bottom-6 right-6">
           <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500">
              <ArrowUpRight className="h-6 w-6" />
           </div>
        </div>

        {!food.inStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
            <span className="bg-destructive text-white text-[12px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-2xl">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 sm:p-10 flex flex-col flex-1 gap-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-black leading-tight tracking-tighter text-foreground group-hover:text-primary transition-colors">
              {food.name}
            </h3>
            <div className="text-right shrink-0">
               <p className="text-3xl sm:text-4xl font-black text-primary leading-none">₹{food.price}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
            <div className={cn(
              "flex items-center gap-1.5",
              !food.inStock ? "text-destructive" : isLowStock ? "text-amber-500" : "text-green-600"
            )}>
              {food.inStock ? (
                <>
                  {isLowStock ? <AlertTriangle className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                  {food.stockCount} Available
                </>
              ) : (
                "Not available"
              )}
            </div>
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            <span>{food.category}</span>
          </div>
        </div>

        {/* Action Section */}
        <div className="mt-auto">
          {qty === 0 ? (
            <button
              disabled={!food.inStock}
              onClick={() => add(food)}
              className="w-full h-16 sm:h-20 rounded-[2rem] bg-primary text-white text-[16px] font-black hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              <Plus className="h-5 w-5" /> Add to Tray
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary text-white rounded-[2rem] h-16 sm:h-20 p-2 shadow-xl shadow-primary/20">
              <button
                onClick={() => setQty(food.id, qty - 1)}
                className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center hover:bg-white/10 rounded-[1.5rem] transition-all active:scale-90"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-2xl font-black tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(food.id, qty + 1)}
                className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center hover:bg-white/10 rounded-[1.5rem] transition-all active:scale-90"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Hover Background Accent */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}
