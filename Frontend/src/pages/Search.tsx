import { useState, useMemo, useEffect } from "react";
import { Search as SearchIcon, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { menuApi } from "@/lib/api";
import { MenuItem } from "@/lib/types";
import { FoodCard } from "@/components/FoodCard";
import { PageHeader } from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    menuApi.getMenu().then(setMenu).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return menu.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [menu, query]);

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <div className="bg-white sticky top-0 z-40 shadow-sm px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-black">Search</h1>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for dishes or categories..."
            className="pl-12 py-7 rounded-2xl bg-gray-50 border-none text-lg focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <main className="px-4 py-6">
        {query.trim() === "" ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4 opacity-20 grayscale">🍕</div>
            <h2 className="text-xl font-black text-gray-300 uppercase tracking-widest">Search for something yummy</h2>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4 opacity-20 grayscale">🧐</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No results for "{query}"</h2>
            <p className="text-gray-500 font-medium">Try searching for coffee, dosa, or snacks</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
