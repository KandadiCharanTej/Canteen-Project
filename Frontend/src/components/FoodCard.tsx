import { MenuItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
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
        "bg-card rounded-2xl shadow-soft p-3 flex gap-3 border border-border/50 hover:shadow-card transition-all duration-200",
        isOut && "opacity-60"
      )}
    >
      {/* Food Image */}
      <div className="h-24 w-24 rounded-xl overflow-hidden shrink-0 relative">
        <img
          src={
            item.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
          }
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {item.veg_flag !== undefined && (
          <div className="absolute top-1.5 left-1.5">
            <div
              className={cn(
                "h-4 w-4 border-2 rounded-sm flex items-center justify-center",
                item.veg_flag
                  ? "border-green-600 bg-white"
                  : "border-red-600 bg-white"
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  item.veg_flag ? "bg-green-600" : "bg-red-600"
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight truncate text-sm">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {item.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.category}
            </p>
          </div>
          {isOut ? (
            <Badge
              variant="secondary"
              className="bg-muted text-muted-foreground shrink-0 text-[10px]"
            >
              Sold out
            </Badge>
          ) : isLow ? (
            <Badge className="bg-warning text-warning-foreground hover:bg-warning shrink-0 text-[10px]">
              {item.available_quantity} left
            </Badge>
          ) : (
            <Badge className="bg-success/15 text-success hover:bg-success/15 shrink-0 text-[10px]">
              In stock
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-1.5">
          <span className="font-bold text-base">₹{item.price}</span>
          {inCart ? (
            <div className="flex items-center gap-1.5 bg-accent rounded-full p-0.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                onClick={() => setQty(item.id, inCart.qty - 1)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-semibold w-5 text-center text-sm">
                {inCart.qty}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                disabled={inCart.qty >= item.available_quantity}
                onClick={() => setQty(item.id, inCart.qty + 1)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              disabled={isOut}
              onClick={handleAdd}
              className={cn(
                "rounded-full font-semibold text-xs h-8",
                !isOut && "shadow-soft"
              )}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> ADD
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
