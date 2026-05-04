import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Star, Flame, ChevronRight } from "lucide-react";
import { menuApi } from "@/lib/api";
import { MenuItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/FoodCard";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { count, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    menuApi
      .getMenu()
      .then((m) => {
        setMenu(m);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );

  const bestItems = useMemo(
    () => menu.filter((m) => m.is_best && m.available_quantity > 0),
    [menu]
  );

  const filtered = useMemo(
    () =>
      menu.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          m.name.toLowerCase().includes(query.toLowerCase())
      ),
    [menu, query, category]
  );

  const categoryEmojis: Record<string, string> = {
    "Main Course": "🍛",
    Snacks: "🍟",
    "South Indian": "🥞",
    Beverages: "☕",
    Desserts: "🍫",
  };

  return (
    <>
      {/* Hero Header */}
      <header className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                CanteenFood 🍔
              </h1>
              <p className="text-sm opacity-90 mt-0.5">
                {user
                  ? `Hey ${user.name.split(" ")[0]}! What's cooking?`
                  : "Order your favorite campus meals"}
              </p>
            </div>
            {user && (
              <button
                onClick={() => navigate("/profile")}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold"
              >
                {user.name.charAt(0)}
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for biryanis, dosas, coffee..."
              className="pl-10 rounded-full bg-white text-foreground h-11 border-0 shadow-card"
              id="search-food"
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 safe-bottom">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                category === c
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card text-foreground border-border hover:bg-accent"
              )}
            >
              {c !== "All" && (
                <span className="mr-1.5">
                  {categoryEmojis[c] || "🍽️"}
                </span>
              )}
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading menu..." />
        ) : (
          <>
            {/* Best Foods Section */}
            {category === "All" && query === "" && bestItems.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Flame className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-bold">Best Sellers</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                  {bestItems.map((item) => (
                    <BestFoodCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Menu Grid */}
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No items found
              </p>
            ) : (
              <div className="grid gap-3 mt-2">
                {category !== "All" && (
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {categoryEmojis[category] || "🍽️"} {category}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filtered.length} items)
                    </span>
                  </h2>
                )}
                {filtered.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart Bar */}
      {count > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-30 px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <Button
              onClick={() => navigate("/cart")}
              className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold flex justify-between px-5"
              id="view-cart-btn"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {count} item{count > 1 ? "s" : ""} · ₹{total}
              </span>
              <span className="flex items-center gap-1">
                View Cart <ChevronRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function BestFoodCard({ item }: { item: MenuItem }) {
  const { items, add } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const inCart = items.find((i) => i.id === item.id);

  const handleAdd = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    add(item);
  };

  return (
    <div className="min-w-[160px] max-w-[160px] bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden flex-shrink-0 group">
      <div className="h-28 relative overflow-hidden">
        <img
          src={
            item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-warning text-warning-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5" /> Best
          </span>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="text-sm font-semibold leading-tight truncate">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-bold text-sm">₹{item.price}</span>
          {!inCart ? (
            <button
              onClick={handleAdd}
              className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full hover:bg-primary/20 transition-colors"
            >
              ADD
            </button>
          ) : (
            <span className="text-[11px] font-bold text-success bg-success/10 px-2 py-1 rounded-full">
              ✓ Added
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
