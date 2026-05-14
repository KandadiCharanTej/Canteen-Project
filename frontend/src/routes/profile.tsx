import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Receipt, Wallet, Star, Mail, Edit2, Settings, User } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, orders, logout, updateProfile } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    navigate({ to: "/login" });
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const completed = orders.filter((o) => o.status === "Completed");
  const totalSpent = completed.reduce((acc, curr) => acc + curr.total, 0);

  const favItem = completed
    .flatMap((o) => o.items)
    .reduce(
      (acc, curr) => {
        acc[curr.food.name] = (acc[curr.food.name] || 0) + curr.qty;
        return acc;
      },
      {} as Record<string, number>,
    );
  const topItem = Object.entries(favItem).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";
  const initials = user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* PROFILE HEADER - PREMIUM COMPACT */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 bg-gradient-to-br from-primary via-orange-500 to-primary/80 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6 relative z-10 w-full text-center sm:text-left">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl font-black shadow-md ring-2 ring-white/30 relative">
              {initials}
              <button
                 onClick={() => setIsEditing(true)}
                 className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white text-primary flex items-center justify-center shadow-md border-2 border-primary hover:scale-105 active:scale-95 transition-all"
              >
                 <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
               <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-sm">{user.name}</h1>
                 <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/30 shadow-sm mt-1 sm:mt-0">
                   {user.category} PRO
                 </span>
               </div>
               <p className="text-sm text-white/90 font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                 <Mail className="h-3.5 w-3.5 opacity-70" /> {user.email}
               </p>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(true)}
            className="h-10 px-5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center gap-2 text-xs font-bold transition-all shrink-0 z-10 w-full sm:w-auto justify-center text-white shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
        </div>

        {isEditing && (
          <div className="bg-card border rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold mb-4">Edit Profile</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                updateProfile({
                  name: fd.get("name") as string,
                  email: fd.get("email") as string,
                  phone: fd.get("phone") as string,
                });
                setIsEditing(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                  <input name="name" defaultValue={user.name} className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                  <input name="email" type="email" defaultValue={user.email} className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
                  <input name="phone" defaultValue={user.phone} className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="h-10 px-6 rounded-lg bg-primary text-white text-sm font-bold shadow-sm hover:shadow-md active:scale-95 transition-all">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="h-10 px-6 rounded-lg bg-muted text-foreground text-sm font-bold hover:bg-muted/80 active:scale-95 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Dining Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard icon={<Receipt className="h-5 w-5" />} label="Total Orders" value={completed.length.toString()} />
              <StatCard icon={<Wallet className="h-5 w-5" />} label="Total Spent" value={`₹${totalSpent}`} />
              <StatCard icon={<Star className="h-5 w-5" />} label="Favorite Item" value={topItem} colSpan />
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Account</h2>
            <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4">
               <DetailRow label="Role" value={user.category} />
               {user.department && <DetailRow label="Department" value={user.department} />}
               <DetailRow label="Phone" value={user.phone} />
               <div className="pt-4 border-t mt-4">
                 <button
                   onClick={handleLogout}
                   className="w-full h-10 rounded-lg bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive hover:text-white transition-all flex items-center justify-center gap-2"
                 >
                   <LogOut className="h-4 w-4" /> Log Out
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, colSpan }: { icon: React.ReactNode; label: string; value: string; colSpan?: boolean }) {
  return (
    <div className={cn("bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow", colSpan && "sm:col-span-2")}>
       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
          {icon}
       </div>
       <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
       <div className="text-2xl font-bold tracking-tight text-foreground truncate">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
