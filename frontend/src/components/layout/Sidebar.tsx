import { Home, ShoppingBag, ClipboardList, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = usePathname();

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/cart", label: "Cart", icon: ShoppingBag, badge: count },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/profile", label: "Profile", icon: User },
    ...(user?.role === "admin"
      ? [{ to: "/admin", label: "Admin Panel", icon: Settings }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-100 p-4 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">Q</div>
        <span className="text-xl font-black tracking-tight">Quick<span className="text-primary">Bite</span></span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map((it) => {
          const isActive = pathname === it.to;
          return (
            <Link
              key={it.to}
              href={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <div className="relative">
                <it.icon className="h-5 w-5" />
                {!!it.badge && it.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center border-2 border-white">
                    {it.badge}
                  </span>
                )}
              </div>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-50">
        {user ? (
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-bold shrink-0">
                {user.name?.[0] || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.contact}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-red-500 shrink-0">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate("/login")} className="w-full rounded-xl font-bold">
            Login
          </Button>
        )}
      </div>
    </aside>
  );
}


