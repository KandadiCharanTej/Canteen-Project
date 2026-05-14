import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="space-y-8 sm:space-y-12">
        {/* COMPACT STARTUP HERO */}
        <header className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-6 sm:p-8 text-center sm:text-left flex items-center justify-between shadow-md">
          <div className="space-y-1.5 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Campus dining, simplified.
            </h1>
            <p className="text-sm text-primary-foreground/90 font-medium max-w-md mx-auto sm:mx-0">
              Order your favorite meals ahead of time and skip the queue.
            </p>
          </div>
          <div className="hidden sm:block text-6xl opacity-20 absolute right-10 top-1/2 -translate-y-1/2 select-none">
            ✨
          </div>
        </header>

        {/* CATEGORY FILTER - CLEAN & COMPACT */}
        <section className="space-y-4">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-semibold transition-all select-none active:scale-95",
                    active
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-card border-border hover:border-primary/30 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <span className="text-base leading-none">{c.emoji}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* COMPACT HORIZONTAL GRID */}
        <section className="grid-food">
          <AnimatePresence mode="popLayout">
            {filtered.map((f) => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <FoodCard food={f} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {filtered.length === 0 && (
          <div className="py-20 text-center space-y-3 bg-muted/30 rounded-3xl border border-dashed">
            <div className="text-4xl">🍳</div>
            <p className="text-sm font-semibold">No items available right now</p>
            <button 
              onClick={() => setCat("all")}
              className="text-xs text-primary font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        <footer className="pt-12 pb-6 text-center">
           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
             QuickBite · Smart Campus OS
           </p>
        </footer>
      </div>
    </AppShell>
  );
}
