import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FoodCard } from "@/components/FoodCard";
import { categories, foods } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [cat, setCat] = useState("all");
  const filtered = useMemo(
    () => (cat === "all" ? foods : foods.filter((f) => f.category === cat)),
    [cat],
  );

  return (
    <AppShell>
      <div className="space-y-10 sm:space-y-16">
        {/* MINIMAL HERO - 1 or 2 lines as requested */}
        <header className="py-8 sm:py-16 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Smart Campus Dining</h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Pre-order your favorite meals and skip the lunch queue with QuickBite.
          </p>
        </header>

        {/* CATEGORY FILTER - CLEAN & ALIGNED */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            <Filter className="h-3 w-3" /> Filter by Category
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 h-10 px-6 rounded-xl border text-sm font-bold transition-all",
                    active
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-card border-border hover:border-primary/40 text-muted-foreground",
                  )}
                >
                  <span className="text-base">{c.emoji}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* CLEAN GRID */}
        <section className="grid-food">
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <FoodCard food={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {filtered.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="text-6xl">🍳</div>
            <p className="text-xl font-bold">No items found</p>
            <button 
              onClick={() => setCat("all")}
              className="text-primary font-bold hover:underline"
            >
              Show all items
            </button>
          </div>
        )}

        <footer className="pt-20 pb-8 text-center border-t">
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
             QuickBite · Smart Campus OS
           </p>
        </footer>
      </div>
    </AppShell>
  );
}
