import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  History,
  User as UserIcon,
  Search,
  X,
  Menu,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { foods } from "@/lib/data";

export function AppShell({
  children,
  showSearch = true,
}: {
  children: ReactNode;
  showSearch?: boolean;
}) {
  const { count, user } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = q.trim()
    ? foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()))
    : [];

  const navItems = [
    { to: "/", icon: Home, label: "Explore" },
    { to: "/cart", icon: ShoppingBag, label: "Tray", badge: count },
    { to: "/orders", icon: History, label: "Orders" },
    { to: "/profile", icon: UserIcon, label: "Profile" },
  ];

  // Close search on escape
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col xl:flex-row">
      {/* DESKTOP SIDEBAR - High Density & Premium */}
      <aside className="hidden xl:flex w-[400px] flex-col sticky top-0 h-screen border-r-4 border-border/40 bg-card/60 backdrop-blur-3xl p-12 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles className="h-40 w-40 text-primary" /></div>
        
        <Link to="/" className="flex items-center gap-6 group mb-24 px-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12" />
          </div>
          <span className="text-4xl sm:text-5xl font-black tracking-tighter group-hover:text-primary transition-colors">QUICKBITE</span>
        </Link>

        <nav className="flex-1 space-y-6">
          {navItems.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-8 h-24 sm:h-28 px-10 rounded-[2.5rem] text-2xl sm:text-3xl font-black transition-all group relative",
                  active
                    ? "bg-primary text-white shadow-3xl shadow-primary/30 scale-[1.03]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <it.icon className={cn("h-10 w-10 sm:h-12 sm:w-12 transition-all duration-700", active ? "scale-110" : "group-hover:scale-110")} />
                <span className="flex-1">{it.label}</span>
                {it.badge && it.badge > 0 && (
                  <span className={cn(
                    "h-10 px-4 min-w-[2.5rem] rounded-2xl flex items-center justify-center text-[18px] font-black shadow-lg",
                    active ? "bg-white text-primary" : "bg-primary text-white"
                  )}>
                    {it.badge}
                  </span>
                )}
                {active && (
                   <motion.div layoutId="sidebar-active" className="absolute -left-12 top-0 bottom-0 w-3 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-8">
           {user ? (
              <Link to="/profile" className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-muted/30 border-2 border-transparent hover:border-primary/20 transition-all group">
                 <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl group-hover:scale-110 transition-transform">
                    {(user.name?.[0] || '?').toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xl font-black truncate">{user.name}</p>
                    <p className="text-[14px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Active Session</p>
                 </div>
                 <ChevronRight className="h-6 w-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </Link>
           ) : (
              <Link to="/login" className="h-24 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center gap-4 text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all">
                 Join QuickBite <ChevronRight className="h-8 w-8" />
              </Link>
           )}
           <p className="text-[12px] font-black uppercase tracking-[0.5em] text-center opacity-20 py-4">Campus OS v2.5</p>
        </div>
      </aside>

      {/* MOBILE/TABLET HEADER */}
      <header className="xl:hidden h-24 sm:h-32 bg-card/60 backdrop-blur-3xl sticky top-0 z-[60] border-b-4 border-border/40 px-6 sm:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-2xl">
            <Sparkles className="h-8 w-8" />
          </div>
          <span className="text-2xl sm:text-4xl font-black tracking-tighter">QUICKBITE</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-muted/50 flex items-center justify-center active:scale-90 transition-all"
          >
            <Search className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          {user && (
             <Link to="/profile" className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-xl">
               {(user.name?.[0] || '?').toUpperCase()}
             </Link>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-screen relative overflow-x-hidden">
        {/* TOP FLOATING SEARCH (Desktop Only) */}
        {showSearch && (
          <div className="hidden xl:flex sticky top-0 z-50 px-12 py-8 bg-background/0 pointer-events-none">
            <div className="w-full max-w-4xl mx-auto pointer-events-auto">
               <button
                 onClick={() => setSearchOpen(true)}
                 className="w-full h-24 px-12 rounded-[2.5rem] bg-card border-2 border-border/40 hover:border-primary/40 text-muted-foreground text-2xl font-bold flex items-center justify-between shadow-2xl backdrop-blur-3xl transition-all hover:shadow-primary/5 group"
               >
                 <div className="flex items-center gap-6">
                    <Search className="h-8 w-8 text-primary group-hover:scale-125 transition-transform" />
                    <span>Search for campus favorites...</span>
                 </div>
                 <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-muted/50 text-[16px] font-black uppercase tracking-widest border border-border/40">
                    ⌘ K
                 </div>
               </button>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-12 xl:p-24 max-w-[2500px] mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="xl:hidden fixed bottom-6 left-6 right-6 h-24 sm:h-32 bg-card/80 backdrop-blur-3xl border-4 border-white/10 rounded-[3.5rem] flex items-center justify-around px-4 z-[60] shadow-3xl">
        {navItems.map((it) => {
          const active = location.pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative h-16 w-16 sm:h-20 sm:w-20 rounded-[1.75rem] flex flex-col items-center justify-center transition-all duration-700",
                active ? "bg-primary text-white shadow-2xl scale-110" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-700", active && "scale-110 -translate-y-0.5")} />
              {active && (
                 <motion.div layoutId="nav-ind-mob" className="absolute bottom-2 h-1.5 w-6 bg-white rounded-full" />
              )}
              {it.badge && it.badge > 0 && (
                <span className="absolute -top-3 -right-3 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-foreground text-background text-[14px] sm:text-[16px] font-black flex items-center justify-center border-4 border-card shadow-2xl">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* SEARCH OVERLAY - Immersive & High-Format */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-3xl p-6 sm:p-12 xl:p-32"
          >
            <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.9, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-6xl mx-auto relative z-10 space-y-16"
            >
               <div className="flex items-center gap-8 bg-card border-4 border-border rounded-[4rem] p-10 sm:p-16 shadow-3xl">
                  <Search className="h-16 w-16 text-primary" />
                  <input
                    autoFocus
                    placeholder="Type anything delicious..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-5xl sm:text-7xl font-black tracking-tighter placeholder:text-muted-foreground/10"
                  />
                  <button onClick={() => setSearchOpen(false)} className="h-20 w-20 rounded-[2rem] bg-muted hover:bg-muted/80 flex items-center justify-center transition-all active:scale-90">
                    <X className="h-10 w-10" />
                  </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-h-[50vh] overflow-y-auto no-scrollbar pb-20">
                  {results.length > 0 ? (
                    results.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setQ("");
                          navigate({ to: "/" });
                        }}
                        className="group flex flex-col gap-6 bg-card/40 border-2 border-border/40 p-8 rounded-[3rem] hover:border-primary/40 transition-all text-left shadow-lg hover:shadow-3xl"
                      >
                         <div className="h-48 w-full rounded-[2rem] overflow-hidden">
                            <img src={f.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                         </div>
                         <div className="space-y-2">
                            <p className="text-3xl font-black tracking-tighter">{f.name}</p>
                            <p className="text-xl font-black text-primary opacity-60 uppercase tracking-widest">₹{f.price} · {f.category}</p>
                         </div>
                      </button>
                    ))
                  ) : q.trim() ? (
                    <div className="col-span-full py-40 text-center opacity-20 italic text-5xl font-black">No matches found...</div>
                  ) : (
                    <div className="col-span-full py-40 text-center space-y-6">
                       <p className="text-4xl font-black uppercase tracking-[0.4em] text-muted-foreground/10">Try "Burger", "Dosa" or "Juice"</p>
                    </div>
                  )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function VegBadge({ veg }: { veg: boolean }) {
  return (
    <div className={cn("h-8 w-8 border-4 rounded-xl flex items-center justify-center shrink-0 shadow-xl", veg ? "border-green-600/40 bg-green-500/5" : "border-red-600/40 bg-red-500/5")}>
      <div className={cn("h-3 w-3 rounded-full", veg ? "bg-green-600 animate-pulse" : "bg-red-600")} />
    </div>
  );
}
