import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Star, Flame, ChevronRight, Clock, MapPin } from "lucide-react";
import { menuApi } from "@/lib/api";
import { MenuItem } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodCard } from "@/components/FoodCard";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: menu = [], isLoading: loading } = useQuery({
    queryKey: ["menu"],
    queryFn: () => menuApi.getMenu(),
    refetchInterval: 10000, // Sync every 10 seconds for live inventory
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

  const bestItems = useMemo(
    () => menu.filter((m) => m.is_best && m.available_quantity > 0),
    [menu]
  );

  const trendingItems = useMemo(
    () => menu.filter((m) => m.is_trending && m.available_quantity > 0),
    [menu]
  );

  const newItems = useMemo(
    () => [...menu].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6),
    [menu]
  );

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recent_searches");
    return saved ? JSON.parse(saved) : [];
  });

  const suggestions = useMemo(() => {
    if (!query) return [];
    return menu
      .filter(m => m.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(m => m.name);
  }, [query, menu]);

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

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim() && !recentSearches.includes(q)) {
      const newRecent = [q, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem("recent_searches", JSON.stringify(newRecent));
    }
  };

  const categoryEmojis: Record<string, string> = {
    "Main Course": "🍛",
    Snacks: "🍟",
    "South Indian": "🥞",
    Beverages: "☕",
    Desserts: "🍫",
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Bar - Hidden on desktop since Sidebar handles it */}
      <header className="bg-white sticky top-0 z-40 shadow-sm pt-4 pb-3 px-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold flex items-center gap-1">
                Campus Canteen <ChevronRight className="h-3 w-3" />
              </h1>
              <p className="text-xs text-muted-foreground truncate w-48">
                {user ? `Welcome back, ${user.name.split(" ")[0]}!` : "Login to order food"}
              </p>
            </div>
          </div>
          {user ? (
            <button
              onClick={() => navigate("/profile")}
              className="h-10 w-10 rounded-full bg-gradient-primary text-white flex items-center justify-center text-lg font-bold shadow-soft"
            >
              {user.name.charAt(0)}
            </button>
          ) : (
            <Button onClick={() => navigate("/login")} variant="outline" size="sm" className="rounded-full font-semibold">
              Login
            </Button>
          )}
        </div>
      </header>

      <main className="px-4 pt-4 md:pt-8 pb-12">
        {/* Search Bar - Responsive */}
        <div className="relative mb-8 max-w-2xl mx-auto z-30">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder="Search for biryani, dosa, coffee..."
            className="pl-12 py-7 rounded-2xl bg-white border border-gray-200 shadow-sm text-lg focus-visible:ring-primary/20 transition-all"
            id="search-food"
          />
          
          {(query || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {query && suggestions.length > 0 && (
                <div className="p-4 border-b border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Suggestions</p>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => handleSearch(s)} className="w-full text-left p-2 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors">
                        <Search className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-sm font-bold text-gray-700">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!query && recentSearches.length > 0 && (
                <div className="p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button key={s} onClick={() => setQuery(s)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-black transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hero Banner - Desktop optimized */}
        {!query && category === "All" && (
          <div className="mb-10 relative rounded-[2rem] overflow-hidden bg-gradient-to-r from-orange-500 to-primary shadow-xl md:h-56 max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
            <div className="relative p-8 text-white z-10 flex flex-col justify-center h-full md:max-w-md">
              <span className="bg-white/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full text-xs font-bold mb-3 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-yellow-300" /> Hot Deal
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-2 leading-tight">Skip the line.<br/>Order ahead.</h2>
              <p className="text-base text-white/90 font-medium">Get your food fresh & hot 🚀</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop" 
              alt="Food Banner" 
              className="absolute right-0 top-0 h-full w-full md:w-3/5 object-cover object-center md:object-left mask-image-gradient hidden sm:block"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
            />
          </div>
        )}

        {/* Categories */}
        <div className="mb-10 max-w-5xl mx-auto">
          <h2 className="text-xl font-black tracking-tight text-gray-900 mb-5">What's on your mind?</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "flex flex-col items-center gap-3 snap-center transition-all hover:scale-105 active:scale-95",
                  category === c ? "opacity-100" : "opacity-80"
                )}
              >
                <div className={cn(
                  "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-md border-4 transition-all duration-300",
                  category === c ? "bg-primary border-primary/20 text-white" : "bg-white border-transparent text-gray-700 hover:border-gray-100"
                )}>
                   {c === "All" ? "🍽️" : categoryEmojis[c] || "🍲"}
                </div>
                <span className={cn(
                  "text-sm font-bold whitespace-nowrap uppercase tracking-widest text-[10px]",
                  category === c ? "text-primary" : "text-gray-400"
                )}>
                  {c}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="max-w-5xl mx-auto py-8">
            <div className="flex gap-6 overflow-x-auto pb-4 mb-10">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="min-w-[80px] flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-44 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Best Sellers */}
            {category === "All" && query === "" && bestItems.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Bestsellers <Star className="h-5 w-5 fill-primary text-primary" />
                  </h2>
                  <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest">See All</Button>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x -mx-4 px-4">
                  {bestItems.map((item) => (
                    <BestFoodCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Trending Section */}
            {category === "All" && query === "" && trendingItems.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Trending Now <Flame className="h-5 w-5 fill-orange-500 text-orange-500" />
                  </h2>
                </div>
                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x -mx-4 px-4">
                  {trendingItems.map((item) => (
                    <BestFoodCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Newly Added */}
            {category === "All" && query === "" && newItems.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-black tracking-tight mb-6">Recently Added 🆕</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {newItems.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Menu List - Responsive Grid */}
            <div className="mb-12">
              <h2 className="text-xl font-black tracking-tight mb-6 flex items-center gap-3">
                 {query ? "Search Results" : category !== "All" ? category : "All Menu"}
                 <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">
                   {filtered.length} items
                 </span>
              </h2>
              
              {filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">No matches found</h3>
                  <p className="text-gray-500 font-medium">Try searching for something else</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {filtered.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button - Optimized */}
      {count > 0 && (
        <div className="fixed bottom-[88px] md:bottom-8 md:right-8 inset-x-0 md:inset-auto z-40 px-4 md:px-0 pointer-events-none transition-all animate-in slide-in-from-bottom-10">
          <div className="max-w-md md:w-80 pointer-events-auto">
            <button
              onClick={() => navigate("/cart")}
              className="w-full h-16 rounded-[1.25rem] bg-[#60b246] hover:bg-[#529b3b] shadow-2xl text-white font-bold flex items-center justify-between px-6 transition-all active:scale-95 group"
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                   <ShoppingBag className="h-5 w-5" /> {count} ITEM{count > 1 ? "S" : ""}
                </span>
                <span className="text-xs text-white/80 font-medium">₹{total} plus taxes</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                View Cart <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BestFoodCard({ item }: { item: MenuItem }) {
  const { items, add, setQty } = useCart();
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
    <div className="min-w-[240px] max-w-[240px] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 snap-center group transition-all hover:shadow-md">
      <div className="h-36 relative overflow-hidden">
        <img
          src={
            item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
           {item.veg_flag !== undefined && (
             <div className="bg-white p-1 rounded shadow-sm w-fit">
               <div className={cn("h-3 w-3 border-2 rounded-sm flex items-center justify-center", item.veg_flag ? "border-green-600" : "border-red-600")}>
                 <div className={cn("h-1.5 w-1.5 rounded-full", item.veg_flag ? "bg-green-600" : "bg-red-600")} />
               </div>
             </div>
           )}
        </div>
        <div className="absolute bottom-3 left-3 text-white">
           <span className="text-sm font-bold shadow-sm">₹{item.price}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold leading-tight text-gray-900 line-clamp-1 mb-1">
              {item.name}
            </h3>
            <p className="text-[11px] text-gray-500">{item.category}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
            <Clock className="h-3 w-3 text-primary" /> 5-10 min
          </div>
          
          {!inCart ? (
            <button
              onClick={handleAdd}
              className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-xl hover:bg-primary/20 transition-colors active:scale-95"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-1 py-1 text-primary">
              <button onClick={() => setQty(item.id, inCart.qty - 1)} className="w-6 h-6 flex items-center justify-center text-lg font-medium hover:bg-white rounded-lg transition-colors">-</button>
              <span className="text-xs font-bold w-3 text-center">{inCart.qty}</span>
              <button disabled={inCart.qty >= item.available_quantity} onClick={() => setQty(item.id, inCart.qty + 1)} className="w-6 h-6 flex items-center justify-center text-lg font-medium hover:bg-white rounded-lg transition-colors">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
