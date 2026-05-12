import { Home, ShoppingBag, ClipboardList, User, Settings, Search } from "lucide-react";
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
    { to: "/", label: "Home", icon: Home },
    { to: "/cart", label: "Cart", icon: ShoppingBag, badge: count },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-12 transition-all relative group",
                isActive
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative transition-transform duration-300 group-active:scale-90">
                  <it.icon className={cn("h-6 w-6 transition-all", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                  {!!it.badge && it.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center shadow-sm border border-white">
                      {it.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] transition-all",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {it.label}
                </span>
                
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-md" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
