import { motion } from "framer-motion";
import { Plus, Minus, Star } from "lucide-react";
import type { Food } from "@/lib/data";
import { useStore } from "@/lib/store";
import { VegBadge } from "./AppShell";
import { cn } from "@/lib/utils";

export function FoodCard({ food }: { food: Food }) {
  const { cart, add, setQty } = useStore();
  const item = cart.find((i) => i.food.id === food.id);
  const qty = item?.qty ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border/70 shadow-[var(--shadow-soft)] hover:shadow-md transition"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={food.image}
          alt={food.name}
          loading="lazy"
          className={cn("h-full w-full object-cover transition duration-500 group-hover:scale-105", !food.inStock && "grayscale opacity-70")}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute top-1.5 left-1.5 bg-white/95 rounded-md p-1 shadow-sm">
          <VegBadge veg={food.veg} />
        </div>
        {food.tag && food.inStock && (
          <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">
            {food.tag}
          </span>
        )}
        {!food.inStock && (
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <span className="bg-card text-foreground text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider">Sold Out</span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold leading-tight truncate">{food.name}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">₹{food.price}</span>
              {food.rating && (
                <span className="inline-flex items-center gap-0.5 text-success">
                  <Star className="h-2.5 w-2.5 fill-current" /> {food.rating}
                </span>
              )}
            </div>
          </div>

          {qty === 0 ? (
            <button
              disabled={!food.inStock}
              onClick={() => add(food)}
              className="shrink-0 h-7 px-2.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-95 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          ) : (
            <div className="shrink-0 inline-flex items-center bg-primary text-primary-foreground rounded-lg h-7 text-[11px] font-semibold">
              <button onClick={() => setQty(food.id, qty - 1)} className="h-7 w-7 grid place-items-center active:scale-90 transition"><Minus className="h-3 w-3" /></button>
              <span className="w-5 text-center">{qty}</span>
              <button onClick={() => setQty(food.id, qty + 1)} className="h-7 w-7 grid place-items-center active:scale-90 transition"><Plus className="h-3 w-3" /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
