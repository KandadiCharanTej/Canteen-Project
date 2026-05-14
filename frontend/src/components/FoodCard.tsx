import { Plus, Minus, Flame } from "lucide-react";
import type { Food } from "@/lib/data";
import { useStore } from "@/lib/store";
import { VegBadge } from "./AppShell";
import { cn } from "@/lib/utils";

export function FoodCard({ food }: { food: Food }) {
  const { cart, add, setQty } = useStore();
  const item = cart.find((i) => i.food.id === food.id);
  const qty = item?.qty ?? 0;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-3 flex gap-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
      {/* Compact Thumbnail */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-muted">
        <img
          src={food.image}
          alt={food.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-110",
            !food.inStock && "grayscale opacity-50",
          )}
        />
        {!food.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
            <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Structured Content */}
      <div className="flex flex-col flex-1 min-w-0 py-0.5">
        <div className="flex items-start gap-2 mb-1">
          <div className="mt-1 shrink-0">
            <VegBadge veg={food.veg} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold leading-tight text-foreground truncate">{food.name}</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              {food.category}
            </p>
          </div>
        </div>

        {food.inStock && food.stockCount <= 10 && (
          <div className="flex items-center gap-1.5 mt-1">
            <Flame className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-bold text-warning">Only {food.stockCount} left</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between">
          <p className="text-lg font-bold text-foreground">₹{food.price}</p>

          <div className="shrink-0">
            {qty === 0 ? (
              <button
                disabled={!food.inStock}
                onClick={() => add(food)}
                className="h-8 px-6 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center justify-between bg-primary text-white rounded-lg h-8 px-1 shadow-sm w-[90px]">
                <button
                  onClick={() => setQty(food.id, qty - 1)}
                  className="h-6 w-6 flex items-center justify-center hover:bg-white/20 rounded-md transition-colors active:scale-90"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-bold tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(food.id, qty + 1)}
                  className="h-6 w-6 flex items-center justify-center hover:bg-white/20 rounded-md transition-colors active:scale-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
