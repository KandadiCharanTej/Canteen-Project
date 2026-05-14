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
    <div className="bg-card rounded-2xl border p-3 flex gap-4 hover:shadow-md transition-all group relative">
      {/* Small Thumbnail */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden shrink-0 bg-muted">
        <img
          src={food.image}
          alt={food.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
            !food.inStock && "grayscale opacity-50",
          )}
        />
        {!food.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
            <span className="bg-destructive text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 py-0.5">
        <div className="flex items-start gap-2">
          <div className="mt-1 shrink-0">
            <VegBadge veg={food.veg} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold leading-tight text-foreground">{food.name}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
              {food.category}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-base sm:text-lg font-bold text-foreground">₹{food.price}</p>
        </div>

        {/* Action Button - Bottom Right Align */}
        <div className="mt-auto flex justify-end">
          {qty === 0 ? (
            <button
              disabled={!food.inStock}
              onClick={() => add(food)}
              className="h-8 px-6 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary/10 text-primary rounded-lg h-8 px-1 border border-primary/20 shadow-sm w-[90px]">
              <button
                onClick={() => setQty(food.id, qty - 1)}
                className="h-6 w-6 flex items-center justify-center hover:bg-white rounded-md transition-all active:scale-90"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-xs font-bold tabular-nums">{qty}</span>
              <button
                onClick={() => setQty(food.id, qty + 1)}
                className="h-6 w-6 flex items-center justify-center hover:bg-white rounded-md transition-all active:scale-90"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
