import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LogOut,
  Phone,
  GraduationCap,
  ShieldCheck,
  Mail,
  IdCard,
  Wallet,
  ShoppingBag,
  Calendar,
  User as UserIcon,
  Settings,
  Edit2,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore, type QuickBiteUser } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, setUser, orders, clear } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<QuickBiteUser | null>(null);

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground">
            <UserIcon className="h-10 w-10" />
          </div>
          <div className="space-y-2">
             <h2 className="text-2xl font-bold tracking-tight">Guest Account</h2>
             <p className="text-sm text-muted-foreground font-medium">
               Sign in to track orders and manage your profile.
             </p>
          </div>
          <Link
            to="/login"
            search={{ next: "/profile" }}
            className="h-11 px-8 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            Sign In Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AppShell>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const initials = (user.name || "Guest")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleEditOpen = () => {
    setEditForm({ ...user });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm) {
      if (!editForm.name.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
        return toast.error("Essential fields cannot be empty");
      }
      setUser(editForm);
      setIsEditing(false);
      toast.success("Profile updated");
    }
  };

  const logout = () => {
    setUser(null);
    clear();
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* LOUD & BEAUTIFUL HEADER */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 sm:gap-10 bg-gradient-to-br from-primary via-orange-500 to-primary/80 rounded-[2rem] p-8 sm:p-12 shadow-xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full -mr-40 -mt-40 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 relative z-10 w-full">
            <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-lg ring-4 ring-white/30 relative">
              {initials}
              <button
                 onClick={handleEditOpen}
                 className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white text-primary flex items-center justify-center shadow-xl border-4 border-orange-500 hover:scale-110 active:scale-95 transition-all"
              >
                 <Edit2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
                 <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none drop-shadow-sm">{user.name}</h1>
                 <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border border-white/30 shadow-sm mb-1 sm:mb-1.5">
                   {user.category} Member
                 </span>
              </div>
              <p className="text-sm sm:text-base text-white/90 font-medium flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-4 w-4 opacity-70" /> {user.email}
              </p>
            </div>
          </div>

          <button 
            onClick={handleEditOpen}
            className="h-12 px-6 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 flex items-center gap-2 text-sm font-bold transition-all shrink-0 z-10 w-full sm:w-auto justify-center text-white shadow-lg"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b bg-muted/20 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identity Data</h3>
                <button onClick={handleEditOpen} className="text-xs font-bold text-primary hover:underline">Edit</button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem icon={<Phone className="h-5 w-5" />} label="Mobile" value={user.phone} />
                <DetailItem icon={<Mail className="h-5 w-5" />} label="Email" value={user.email} />
                {user.category === "Student" && (
                   <>
                    <DetailItem icon={<GraduationCap className="h-5 w-5" />} label="Class / Dept" value={user.classDept || "Not Set"} />
                    <DetailItem icon={<IdCard className="h-5 w-5" />} label="Campus ID" value={user.auroraId || "Not Set"} />
                   </>
                )}
                {user.category === "Lecturer" && (
                   <DetailItem icon={<ShieldCheck className="h-5 w-5" />} label="Role" value="Faculty Access" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <BigStat icon={<ShoppingBag className="h-5 w-5" />} label="Total Orders" value={String(orders.length)} />
               <BigStat icon={<Wallet className="h-5 w-5" />} label="Total Spent" value={`₹${totalSpent}`} />
            </div>
          </div>

          {/* Timeline & Logout */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col max-h-[400px]">
                <div className="px-5 py-4 border-b bg-muted/20">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">History</h3>
                </div>
                <div className="p-2 flex-1 overflow-y-auto no-scrollbar space-y-1">
                   {orders.length > 0 ? (
                      orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all">
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                 <Calendar className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-bold truncate">Order #{o.id}</p>
                                 <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</p>
                              </div>
                           </div>
                           <span className="text-sm font-bold text-foreground">₹{o.total}</span>
                        </div>
                      ))
                   ) : (
                      <div className="py-12 text-center text-sm text-muted-foreground font-medium">No order history</div>
                   )}
                </div>
             </div>

             <button
               onClick={logout}
               className="w-full h-12 rounded-2xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 hover:bg-destructive/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
             >
               <LogOut className="h-4 w-4" /> Sign Out
             </button>
          </div>
        </div>
      </div>

      {/* COMPACT EDIT MODAL */}
      <AnimatePresence>
        {isEditing && editForm && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4"
           >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
              
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg bg-card border rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 overflow-y-auto max-h-[90vh] no-scrollbar"
              >
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-xl font-bold">Edit Profile</h2>
                       <p className="text-sm text-muted-foreground">Update your personal details.</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-all">
                       <X className="h-5 w-5" />
                    </button>
                 </div>

                 <div className="space-y-4">
                    <EditField label="Full Name" value={editForm.name} icon={<UserIcon />} onChange={(v) => setEditForm({...editForm, name: v})} />
                    <EditField label="Mobile" value={editForm.phone} icon={<Phone />} onChange={(v) => setEditForm({...editForm, phone: v})} />
                    <EditField label="Email" value={editForm.email} icon={<Mail />} onChange={(v) => setEditForm({...editForm, email: v})} />
                    
                    {editForm.category === "Student" && (
                       <div className="grid grid-cols-2 gap-4">
                         <EditField label="Class/Dept" value={editForm.classDept} icon={<GraduationCap />} onChange={(v) => setEditForm({...editForm, classDept: v})} />
                         <EditField label="Campus ID" value={editForm.auroraId || ""} icon={<IdCard />} onChange={(v) => setEditForm({...editForm, auroraId: v})} />
                       </div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 border flex items-center justify-between mt-6">
                       <div className="flex items-center gap-3">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <div>
                             <p className="text-xs text-muted-foreground font-medium">Account Type</p>
                             <p className="text-sm font-bold">{editForm.category}</p>
                          </div>
                       </div>
                       <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest bg-background px-2 py-1 rounded border">Fixed</span>
                    </div>
                 </div>

                 <button
                   onClick={handleSave}
                   className="w-full h-12 rounded-xl bg-primary text-white text-sm font-bold shadow-md mt-8 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
                 >
                   Save Changes <CheckCircle2 className="h-4 w-4" />
                 </button>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">
          {label}
        </p>
        <p className="text-base font-bold truncate text-foreground">{value}</p>
      </div>
    </div>
  );
}

function BigStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card border p-6 rounded-2xl flex items-center gap-5 shadow-sm">
       <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {icon}
       </div>
       <div>
         <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
         <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
       </div>
    </div>
  );
}

function EditField({ label, value, icon, onChange }: { label: string; value: string; icon: React.ReactNode; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
       <label className="text-xs font-bold uppercase tracking-widest text-foreground/70 px-1">{label}</label>
       <div className="h-12 px-4 rounded-xl bg-background border flex items-center gap-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <span className="text-muted-foreground/50">{icon}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-semibold"
          />
       </div>
    </div>
  );
}
