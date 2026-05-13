import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ShoppingBag, ClipboardList, User, Search, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useState } from "react";
import { useStore } from "@/lib/store";
import { foods } from "@/lib/data";
import { cn } from "@/lib/utils";

export function AppShell({ children, showSearch = true }: { children: ReactNode; showSearch?: boolean }) {
  const { count } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const results = q.trim()
    ? foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-background/85 glass-blur border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-xl gradient-primary grid place-items-center text-white text-sm font-bold shadow-[var(--shadow-pop)]">Q</div>
            <span className="font-semibold tracking-tight text-[15px]">QuickBite</span>
          </Link>
          {showSearch && (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex-1 h-9 rounded-full bg-muted/70 hover:bg-muted text-left px-3 flex items-center gap-2 text-muted-foreground text-[13px] transition"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Search for biryani, dosa, coffee…</span>
            </button>
          )}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-muted transition" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">{count}</span>
            )}
          </Link>
          <Link to="/profile" className="hidden sm:grid p-2 rounded-full hover:bg-muted transition place-items-center" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 sm:pb-6">{children}</main>

      {/* Bottom Mobile Nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 glass-blur border-t border-border/60">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/cart", icon: ShoppingBag, label: "Cart", badge: count },
            { to: "/orders", icon: ClipboardList, label: "Orders" },
            { to: "/profile", icon: User, label: "Profile" },
          ].map((it) => {
            const active = location.pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn("flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium relative transition",
                  active ? "text-primary" : "text-muted-foreground")}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {it.badge ? (
                    <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold grid place-items-center">{it.badge}</span>
                  ) : null}
                </div>
                {it.label}
                {active && <motion.span layoutId="navdot" className="absolute -top-px h-0.5 w-8 bg-primary rounded-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="mx-auto max-w-xl mt-16 bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search foods…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <button onClick={() => setSearchOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Esc</button>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {!q && (
                  <div className="p-4 text-xs text-muted-foreground">
                    <div className="mb-2 font-medium uppercase tracking-wider">Trending</div>
                    <div className="flex flex-wrap gap-1.5">
                      {["Biryani", "Dosa", "Coffee", "Burger", "Samosa"].map((t) => (
                        <button key={t} onClick={() => setQ(t)} className="px-2.5 py-1 rounded-full bg-muted hover:bg-accent text-foreground text-[11px]">{t}</button>
                      ))}
                    </div>
                  </div>
                )}
                {results.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => { setSearchOpen(false); setQ(""); navigate({ to: "/" }); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left"
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-[11px] text-muted-foreground">₹{f.price} · {f.category}</div>
                    </div>
                    <span className={cn("h-3 w-3 border", f.veg ? "border-success" : "border-destructive")}>
                      <span className={cn("block h-1.5 w-1.5 m-0.5 rounded-full", f.veg ? "bg-success" : "bg-destructive")} />
                    </span>
                  </button>
                ))}
                {q && results.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No matches for "{q}"</div>
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
    <span className={cn("inline-grid place-items-center h-3.5 w-3.5 border rounded-[3px]", veg ? "border-success" : "border-destructive")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-success" : "bg-destructive")} />
    </span>
  );
}
