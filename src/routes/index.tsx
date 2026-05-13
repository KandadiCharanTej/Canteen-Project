import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FoodCard } from "@/components/FoodCard";
import { categories, foods } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [cat, setCat] = useState("all");
  const filtered = useMemo(() => (cat === "all" ? foods : foods.filter((f) => f.category === cat)), [cat]);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 pt-3">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl gradient-warm border border-border/60 px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <Zap className="h-3 w-3" /> Lunch break? Skip it.
              </div>
              <h1 className="mt-1.5 text-[19px] sm:text-2xl font-bold leading-tight text-balance">
                Skip the Queue <span className="inline-block">🍱</span><br className="sm:hidden" />
                <span className="text-primary"> Order Fast.</span> Save Break Time.
              </h1>
              <p className="mt-1 text-[12px] sm:text-sm text-muted-foreground max-w-md">
                Pre-order from your campus canteen. Pay with UPI, pick up with OTP.
              </p>
            </div>
            <div className="hidden xs:block text-5xl sm:text-6xl select-none">🥪</div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> Ready in 10 min</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-success" /> OTP pickup</span>
            <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3 text-warning" /> UPI ready</span>
          </div>
          <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
        </motion.section>

        {/* Categories */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-tight">Categories</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {categories.map((c) => {
              const active = cat === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12px] font-medium transition active:scale-95",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-pop)]"
                      : "bg-card border-border hover:border-primary/40 hover:bg-accent/40 text-foreground"
                  )}
                >
                  <span>{c.emoji}</span>
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Foods */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-tight">
              {cat === "all" ? "Popular today" : categories.find((c) => c.id === cat)?.name}
              <span className="ml-1.5 text-muted-foreground font-normal">({filtered.length})</span>
            </h2>
            <Link to="/orders" className="text-[11px] text-primary font-medium">My orders →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {filtered.map((f) => <FoodCard key={f.id} food={f} />)}
          </div>
        </section>

        <p className="text-center text-[10px] text-muted-foreground mt-8">
          QuickBite · Smart Campus Food OS · v1.0
        </p>
      </div>
    </AppShell>
  );
}
