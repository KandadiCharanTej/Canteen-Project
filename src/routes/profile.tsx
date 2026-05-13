import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, Phone, GraduationCap, ShieldCheck, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser, orders, clear } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 pt-10 text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-primary grid place-items-center text-white text-xl font-bold">Q</div>
          <h2 className="mt-3 text-base font-semibold">Sign in to QuickBite</h2>
          <p className="text-[12px] text-muted-foreground mt-1">Track your orders, save favourites, and pay faster.</p>
          <Link to="/login" search={{ next: "/profile" }} className="mt-4 inline-flex h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Sign in</Link>
        </div>
      </AppShell>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const counts: Record<string, number> = {};
  orders.forEach((o) => o.items.forEach((i) => (counts[i.food.name] = (counts[i.food.name] || 0) + i.qty)));
  const favs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const logout = () => { setUser(null); clear(); navigate({ to: "/" }); };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 pt-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-5 text-center shadow-[var(--shadow-soft)]">
          <div className="h-16 w-16 mx-auto rounded-full gradient-primary grid place-items-center text-white text-lg font-bold">{initials}</div>
          <h1 className="mt-2 text-base font-semibold">{user.name}</h1>
          <p className="text-[12px] text-muted-foreground inline-flex items-center gap-1"><Phone className="h-3 w-3" /> +91 {user.phone}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <GraduationCap className="h-3 w-3" /> {user.role} · {user.department}
          </div>
        </motion.div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="Total orders" value={String(orders.length)} />
          <Stat label="Total spent" value={`₹${totalSpent}`} />
        </div>

        <div className="mt-3 bg-card border border-border rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold mb-2">
            <Heart className="h-4 w-4 text-primary" /> Favourite foods
          </div>
          {favs.length ? (
            <div className="space-y-1.5">
              {favs.map(([n, c]) => (
                <div key={n} className="flex justify-between text-[12px]">
                  <span>{n}</span><span className="text-muted-foreground">×{c}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[12px] text-muted-foreground">Order something to see your favourites.</p>}
        </div>

        <Link to="/admin/login" className="mt-3 flex items-center gap-2 px-3 h-11 bg-card border border-border rounded-xl text-sm">
          <ShieldCheck className="h-4 w-4 text-primary" /> Admin / Staff Panel
        </Link>

        <button onClick={logout} className="mt-2 w-full h-11 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm inline-flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 text-center">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
