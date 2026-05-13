import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { LogOut, ListOrdered, Pizza } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("qb_admin")) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { to: "/admin", label: "Orders", icon: ListOrdered, exact: true },
    { to: "/admin/foods", label: "Foods", icon: Pizza, exact: false },
  ];

  const logout = () => { localStorage.removeItem("qb_admin"); navigate({ to: "/" }); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/90 glass-blur border-b border-border/60">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary grid place-items-center text-white text-xs font-bold">QB</div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">Canteen Console</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">Staff panel</div>
            </div>
          </Link>
          <nav className="ml-auto flex items-center gap-1">
            {tabs.map((t) => {
              const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </Link>
              );
            })}
            <button onClick={logout} className="ml-1 inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  );
}
