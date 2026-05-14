import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, ShieldCheck, TrendingUp, ChevronRight, Sparkles, Filter, Store } from "lucide-react";
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
      <div className="space-y-20 sm:space-y-32">
        {/* HERO SECTION - Immersive & High-End */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-[40vh] sm:min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-[4rem] sm:rounded-[6rem] bg-foreground text-background shadow-3xl group"
        >
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-[40rem] h-[40rem] bg-orange-600/10 blur-[180px] rounded-full animate-float" />
          </div>

          <div className="relative z-10 space-y-8 sm:space-y-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 backdrop-blur-3xl text-[14px] font-black uppercase tracking-[0.3em] border border-white/10"
            >
              <Sparkles className="h-5 w-5 text-primary animate-pulse" /> 
              Campus Dining Redefined
            </motion.div>
            
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-white group-hover:scale-[1.02] transition-transform duration-700 text-5xl sm:text-[clamp(3.5rem,10vw,8rem)]"
            >
              Order Smarter. <br />
              <span className="bg-gradient-to-r from-primary via-orange-400 to-white bg-clip-text text-transparent italic">Eat Better.</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl sm:text-3xl text-white/60 max-w-2xl mx-auto font-bold leading-relaxed px-4"
            >
              The most advanced food operating system for the modern campus. No queues, no delays, just pure flavor.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-6 sm:pt-10"
            >
              <div className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <Clock className="h-7 w-7 text-primary" />
                <span className="text-[14px] font-black uppercase tracking-widest text-white">10 Min Ready</span>
              </div>
              <div className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck className="h-7 w-7 text-green-500" />
                <span className="text-[14px] font-black uppercase tracking-widest text-white">OTP Pickup</span>
              </div>
            </motion.div>
          </div>

          {/* Decorative Floaties */}
          <div className="absolute bottom-10 left-10 text-[10rem] opacity-10 animate-float hidden xl:block">🍔</div>
          <div className="absolute top-10 right-20 text-[8rem] opacity-5 animate-pulse hidden xl:block">🥤</div>
        </motion.section>

        {/* BROWSE & FILTER */}
        <section className="space-y-12 sm:space-y-20">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 sm:gap-20 px-2">
            <div className="space-y-6">
              <h2 className="flex flex-col">
                <span className="text-[16px] font-black uppercase tracking-[0.6em] text-primary mb-4 block">Our Menu</span>
                <span className="text-5xl sm:text-8xl">Deliciously <br />Curated.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-8">
               <div className="flex items-center gap-4 text-muted-foreground/40 font-black uppercase tracking-widest text-[13px]">
                  <Filter className="h-5 w-5" /> Filter by Taste
               </div>
               <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6">
                  {categories.map((c) => {
                    const active = cat === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCat(c.id)}
                        className={cn(
                          "shrink-0 inline-flex items-center gap-6 h-20 sm:h-24 px-10 sm:px-16 rounded-[2.5rem] border-2 font-black text-[20px] transition-all active:scale-95 shadow-sm group",
                          active
                            ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-110 z-10"
                            : "bg-card border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary",
                        )}
                      >
                        <span className="text-3xl group-hover:rotate-12 transition-transform">{c.emoji}</span>
                        {c.name}
                      </button>
                    );
                  })}
               </div>
            </div>
          </div>
          
          {/* Bento Grid */}
          <div className="bento-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((f, idx) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <FoodCard food={f} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="py-60 flex flex-col items-center justify-center space-y-12 bg-muted/10 rounded-[6rem] border-2 border-dashed border-border/60">
              <div className="text-[12rem] animate-bounce">🍳</div>
              <div className="text-center space-y-6">
                <p className="text-6xl font-black tracking-tighter">Kitchen is Resting.</p>
                <p className="text-2xl text-muted-foreground font-bold max-w-md mx-auto uppercase tracking-widest opacity-60">Nothing found in this section right now.</p>
              </div>
              <button 
                onClick={() => setCat("all")}
                className="h-20 px-16 rounded-[2.5rem] bg-primary text-white font-black text-xl active:scale-95 transition-all shadow-2xl shadow-primary/20"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Bottom Callout */}
        <section className="bg-muted/30 rounded-[6rem] p-20 sm:p-40 text-center space-y-12 border border-border/40">
           <div className="h-32 w-32 rounded-[3.5rem] bg-primary text-white flex items-center justify-center mx-auto shadow-3xl shadow-primary/30">
              <Store className="h-16 w-16" />
           </div>
           <h2 className="text-5xl sm:text-8xl">Ready to taste the future?</h2>
           <p className="text-2xl sm:text-4xl text-muted-foreground font-bold max-w-4xl mx-auto leading-relaxed">
             Join the smart campus revolution. QuickBite is more than just food; it's a lifestyle.
           </p>
           <div className="flex flex-wrap justify-center gap-8 pt-8">
              <Link to="/orders" className="h-24 px-16 rounded-[3rem] bg-foreground text-background font-black text-2xl flex items-center gap-6 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
                 View Recent Orders <ChevronRight className="h-8 w-8" />
              </Link>
           </div>
        </section>

        <footer className="pt-20 pb-10 border-t border-border/40 text-center">
           <p className="text-[13px] font-black uppercase tracking-[0.8em] text-muted-foreground/30">
             QuickBite · Distributed by Campus Food Systems · MMXXIV
           </p>
        </footer>
      </div>
    </AppShell>
  );
}
