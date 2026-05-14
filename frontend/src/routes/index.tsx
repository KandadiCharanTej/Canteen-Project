import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { FoodCard } from "@/components/FoodCard";
import { categories, foods } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight } from "lucide-react";

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
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* PREMIUM COMPACT HERO */}
        <header className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-orange-500 to-primary/80 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between text-white text-center sm:text-left gap-6 group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=2000&q=20')] opacity-10 bg-cover bg-center mix-blend-overlay transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="space-y-3 relative z-10 w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm mx-auto sm:mx-0">
               <Sparkles className="h-3 w-3" /> Smart Campus Dining
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">
              Skip the queue.<br className="hidden sm:block" /> Savor the flavor.
            </h1>
            <p className="text-sm text-white/90 font-medium max-w-sm mx-auto sm:mx-0">
              Order your favorite campus meals ahead of time and pick them up instantly.
            </p>
          </div>

          <div className="shrink-0 relative z-10 w-full sm:w-auto">
             <button onClick={() => {
                document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
             }} className="h-11 px-6 rounded-xl bg-white text-primary text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto">
               Explore Menu <ArrowRight className="h-4 w-4" />
             </button>
          </div>
        </header>

        {/* CATEGORY FILTER */}
        <section id="menu" className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
             <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Our Menu</h2>
             <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{filtered.length} Items</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-semibold transition-all select-none active:scale-95",
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-card border-border hover:border-primary/40 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <span className="text-lg leading-none">{c.emoji}</span>
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
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/30 rounded-2xl border border-dashed shadow-sm">
            <div className="text-5xl opacity-50 mb-2">🍳</div>
            <h3 className="text-lg font-bold text-foreground">No items available</h3>
            <p className="text-sm text-muted-foreground max-w-xs">We're currently sold out of these items. Try checking another category.</p>
            <button 
              onClick={() => setCat("all")}
              className="mt-2 h-9 px-4 rounded-lg bg-primary/10 text-primary text-sm font-bold shadow-sm hover:bg-primary/20 transition-all"
            >
              View All Items
            </button>
          </div>
        )}

        <footer className="pt-8 pb-4 text-center border-t mt-8">
           <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
             QuickBite · Smart Campus OS
           </p>
        </footer>
      </div>
    </AppShell>
  );
}
