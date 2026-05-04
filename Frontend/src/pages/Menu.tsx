import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { MenuItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/FoodCard";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Menu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { count, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getMenu().then((m) => {
      setMenu(m);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map((m) => m.category)))], [menu]);

  const filtered = useMemo(
    () =>
      menu.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          m.name.toLowerCase().includes(query.toLowerCase())
      ),
    [menu, query, category]
  );

  return (
    <>
      <PageHeader title={`Hi, ${user?.name?.split(" ")[0] ?? "there"} 👋`} showLogout />
      <div className="max-w-2xl mx-auto px-4 pt-4 safe-bottom">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food..."
            className="pl-9 rounded-full bg-card h-11"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                category === c
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card text-foreground border-border hover:bg-accent"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="Loading menu..." />
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No items found</p>
        ) : (
          <div className="grid gap-3 mt-2">
            {filtered.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="fixed bottom-20 inset-x-0 z-30 px-4 pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <Button
              onClick={() => navigate("/cart")}
              className="w-full h-12 rounded-full bg-gradient-primary shadow-glow font-semibold flex justify-between px-5"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                {count} item{count > 1 ? "s" : ""} · ₹{total}
              </span>
              <span>View Cart →</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
