import { Home, ShoppingBag, ClipboardList, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { count } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  const items = [
    { to: "/", label: "Menu", icon: Home },
    { to: "/cart", label: "Cart", icon: ShoppingBag, badge: count },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border shadow-card">
      <div className="max-w-2xl mx-auto grid grid-cols-4 gap-1 px-2 py-2 safe-area-inset-bottom">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors relative",
                isActive ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <div className="relative">
              <it.icon className="h-5 w-5" />
              {!!it.badge && it.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {it.badge}
                </span>
              )}
            </div>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
