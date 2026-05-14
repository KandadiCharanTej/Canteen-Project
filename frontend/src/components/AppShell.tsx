import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  History,
  User as UserIcon,
  Search,
  X,
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
    { to: "/", icon: Home, label: "Home" },
    { to: "/cart", icon: ShoppingBag, label: "Tray", badge: count },
    { to: "/orders", icon: History, label: "Orders" },
    { to: "/profile", icon: UserIcon, label: "Profile" },
  ];

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
      {/* DESKTOP SIDEBAR - CLEAN & MINIMAL */}
      <aside className="hidden xl:flex w-72 flex-col sticky top-0 h-screen border-r bg-card p-6">
        <Link to="/" className="flex items-center gap-3 mb-10 px-2">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuickBite</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {navItems.map((it) => {
            const active = location.pathname === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-semibold transition-all group",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <it.icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                <span className="flex-1">{it.label}</span>
                {it.badge && it.badge > 0 && (
                  <span className="h-5 px-1.5 min-w-[1.25rem] rounded-md bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                    {it.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t">
           {user ? (
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-all group">
                 <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {(user.name?.[0] || '?').toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Account</p>
                 </div>
                 <ChevronRight className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-all" />
              </Link>
           ) : (
              <Link to="/login" className="h-12 rounded-xl bg-foreground text-background flex items-center justify-center gap-2 text-sm font-bold hover:opacity-90 transition-all">
                 Get Started
              </Link>
           )}
        </div>
      </aside>

      {/* MOBILE HEADER - MINIMAL */}
      <header className="xl:hidden h-16 bg-card sticky top-0 z-40 border-b px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">QuickBite</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <Search className="h-5 w-5" />
          </button>
          {user && (
             <Link to="/profile" className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
               {(user.name?.[0] || '?').toUpperCase()}
             </Link>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-screen relative pb-20 xl:pb-0">
        {showSearch && (
          <div className="hidden xl:flex sticky top-0 z-30 px-8 py-4 bg-background/80 backdrop-blur-md border-b">
            <div className="w-full max-w-3xl mx-auto">
               <button
                 onClick={() => setSearchOpen(true)}
                 className="w-full h-11 px-4 rounded-xl bg-muted/50 border hover:border-primary/30 text-muted-foreground text-sm font-medium flex items-center justify-between transition-all"
               >
                 <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-primary" />
                    <span>Search for campus favorites...</span>
                 </div>
                 <div className="text-[10px] font-bold opacity-30">⌘ K</div>
               </button>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-8 xl:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-40">
        {navItems.map((it) => {
          const active = location.pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "relative h-12 w-12 rounded-xl flex flex-col items-center justify-center transition-all",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <it.icon className={cn("h-6 w-6", active && "scale-110")} />
              {it.badge && it.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center border-2 border-card">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl p-4 sm:p-12"
          >
            <div className="absolute inset-0" onClick={() => setSearchOpen(false)} />
            
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl mx-auto relative z-10"
            >
               <div className="flex items-center gap-4 bg-card border rounded-2xl p-4 shadow-xl">
                  <Search className="h-6 w-6 text-primary" />
                  <input
                    autoFocus
                    placeholder="Search menu..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-lg font-semibold"
                  />
                  <button onClick={() => setSearchOpen(false)} className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <X className="h-5 w-5" />
                  </button>
               </div>

               <div className="mt-4 bg-card border rounded-2xl overflow-hidden shadow-xl max-h-[60vh] overflow-y-auto no-scrollbar">
                  {results.length > 0 ? (
                    results.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setQ("");
                          navigate({ to: "/" });
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-all border-b last:border-0"
                      >
                         <img src={f.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                         <div className="text-left">
                            <p className="font-bold">{f.name}</p>
                            <p className="text-xs text-muted-foreground">₹{f.price} · {f.category}</p>
                         </div>
                      </button>
                    ))
                  ) : q.trim() ? (
                    <div className="p-12 text-center text-muted-foreground text-sm italic">No matches found...</div>
                  ) : null}
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
    <div className={cn("h-4 w-4 border rounded-sm flex items-center justify-center shrink-0", veg ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50")}>
      <div className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-green-600" : "bg-red-600")} />
    </div>
  );
}
