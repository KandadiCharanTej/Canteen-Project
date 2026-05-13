import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, ShoppingBag } from "lucide-react";
import { menuApi } from "@/services/api";
import { FoodCard } from "@/components/food/FoodCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: menu = [], isLoading: loading } = useQuery({
    queryKey: ["menu"],
    queryFn: () => menuApi.getMenu(),
    refetchInterval: 10000,
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { count, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );

  const filtered = useMemo(
    () =>
      menu.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          (m.name.toLowerCase().includes(query.toLowerCase()) || 
           m.category.toLowerCase().includes(query.toLowerCase()))
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
    <div className="bg-[#f8f9fa] min-h-screen pb-24 md:pb-8">
      {/* Top Header - Mobile only */}
      <header className="bg-white sticky top-0 z-40 px-4 py-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] md:hidden flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-sm font-bold flex items-center gap-1">
              Campus Canteen <ChevronRight className="h-4 w-4" />
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">
              {user ? `Hello, ${user.name.split(" ")[0]}` : "Welcome to QuickBite"}
            </p>
          </div>
        </div>
        {user ? (
          <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
            {user.name.charAt(0)}
          </button>
        ) : (
          <button onClick={() => navigate("/login")} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
            Login
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-3 md:pt-6">
        
        {/* Minimal Hero */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-[20px] font-black text-gray-900 leading-tight">Skip the Queue 🍱</h2>
            <p className="text-[12px] font-bold text-gray-400">Order fast. Save break time.</p>
          </div>
          
          {/* Instant Search - Integrated directly */}
          <div className="relative mt-2 md:mt-0 md:w-80">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-100 shadow-sm text-[14px] font-medium placeholder:text-gray-400 focus:outline-none focus:border-primary/30 transition-all"
            />
          </div>
        </div>
        
        {/* Compact Categories */}
        {!query && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "snap-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all border",
                  category === c 
                    ? "bg-primary border-primary text-white shadow-sm" 
                    : "bg-white border-gray-100 text-gray-600"
                )}
              >
                <span className="text-[14px]">{c === "All" ? "🍽️" : categoryEmojis[c] || "🍲"}</span>
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900 mb-4">
               {query ? "Search Results" : category !== "All" ? category : "Today's Menu"}
               <span className="ml-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{filtered.length} items</span>
            </h2>
            
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No matches found</h3>
                <p className="text-xs text-gray-500">Try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filtered.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Sticky Cart */}
      {count > 0 && (
        <div className="fixed bottom-[80px] md:bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none animate-in slide-in-from-bottom-10">
          <div className="w-full max-w-sm pointer-events-auto">
            <button
              onClick={() => navigate("/cart")}
              className="w-full bg-[#60b246] hover:bg-[#529b3b] shadow-xl text-white rounded-[1rem] p-3 flex items-center justify-between transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                   <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="text-left flex flex-col">
                  <span className="text-[13px] font-black uppercase tracking-wider">{count} ITEM{count > 1 ? "S" : ""}</span>
                  <span className="text-[11px] font-bold text-white/90">₹{total} plus taxes</span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-sm bg-black/10 px-3 py-1.5 rounded-lg">
                View Cart <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


