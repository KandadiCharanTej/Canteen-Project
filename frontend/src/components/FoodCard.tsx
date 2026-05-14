import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import type { Food } from "@/lib/data";
import { useStore } from "@/lib/store";
import { VegBadge } from "./AppShell";
import { cn } from "@/lib/utils";

export function FoodCard({ food }: { food: Food }) {
  const { cart, add, setQty } = useStore();
  const item = cart.find((i) => i.food.id === food.id);
  const qty = item?.qty ?? 0;

  return (
    <div className="bg-card rounded-2xl border border-border/60 flex flex-col overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={food.image}
          alt={food.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            !food.inStock && "grayscale opacity-50",
          )}
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
           <div className="bg-white/90 p-1.5 rounded-lg shadow-sm">
              <VegBadge veg={food.veg} />
           </div>
        </div>
        {!food.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
            <span className="bg-destructive text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate leading-tight">{food.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{food.category}</p>
          </div>
          <p className="text-xl font-bold text-primary shrink-0">₹{food.price}</p>
        </div>

        <div className="mt-auto pt-2">
          {qty === 0 ? (
            <button
              disabled={!food.inStock}
              onClick={() => add(food)}
              className="w-full h-10 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          ) : (
            <div className="flex items-center justify-between bg-muted rounded-xl h-10 p-1 border">
              <button
                onClick={() => setQty(food.id, qty - 1)}
                className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-lg transition-all active:scale-90"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(food.id, qty + 1)}
                className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-lg transition-all active:scale-90"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
