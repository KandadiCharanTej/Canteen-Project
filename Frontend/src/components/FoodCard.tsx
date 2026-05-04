import { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

export function FoodCard({ item }: { item: MenuItem }) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === item.id);
  const isOut = item.stock === 0;
  const isLow = item.stock > 0 && item.stock <= 5;

  return (
    <div className="bg-card rounded-2xl shadow-soft p-4 flex gap-3 border border-border/50 hover:shadow-card transition-shadow">
      <div className="h-20 w-20 rounded-xl bg-gradient-warm flex items-center justify-center text-4xl shrink-0">
        {item.emoji ?? "🍽️"}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight truncate">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
          </div>
          {isOut ? (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">Sold out</Badge>
          ) : isLow ? (
            <Badge className="bg-warning text-warning-foreground hover:bg-warning">Only {item.stock} left</Badge>
          ) : (
            <Badge className="bg-success/15 text-success hover:bg-success/15">In stock</Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-bold text-lg">₹{item.price}</span>
          {inCart ? (
            <div className="flex items-center gap-2 bg-accent rounded-full p-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                onClick={() => setQty(item.id, inCart.qty - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-semibold w-5 text-center text-sm">{inCart.qty}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                disabled={inCart.qty >= item.stock}
                onClick={() => setQty(item.id, inCart.qty + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={isOut}
              onClick={() => add(item)}
              className={cn("rounded-full font-semibold", !isOut && "shadow-soft")}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
