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
  ChevronRight,
  User as UserIcon,
  Settings,
  Edit2,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  Store,
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-32 w-32 rounded-[3rem] bg-primary/10 flex items-center justify-center text-primary mb-10 shadow-inner"
          >
            <UserIcon className="h-16 w-16" />
          </motion.div>
          <h2 className="text-5xl font-black tracking-tighter mb-4">Hello Guest!</h2>
          <p className="text-xl text-muted-foreground font-bold mb-12">
            Join the QuickBite community to unlock personalized menus and instant order tracking.
          </p>
          <Link
            to="/login"
            search={{ next: "/profile" }}
            className="h-20 px-16 rounded-[2rem] bg-primary text-white text-xl font-black shadow-2xl shadow-primary/30 flex items-center gap-4 hover:scale-105 transition-all active:scale-95"
          >
            Sign In Now <ArrowRight className="h-6 w-6" />
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
      toast.success("Profile updated successfully!");
    }
  };

  const logout = () => {
    setUser(null);
    clear();
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="space-y-12 sm:space-y-20">
        {/* Header Section - Massive & Bold */}
        <div className="flex flex-col xl:flex-row items-center gap-12 sm:gap-20 bg-card/40 border border-border/40 p-10 sm:p-20 rounded-[4rem] relative overflow-hidden backdrop-blur-3xl shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-40 w-40 sm:h-56 sm:w-56 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white text-5xl sm:text-7xl font-black shadow-2xl shadow-primary/40 ring-[12px] ring-background relative z-10"
          >
            {initials}
            <button
               onClick={handleEditOpen}
               className="absolute bottom-4 right-4 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-background"
            >
               <Edit2 className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </motion.div>

          <div className="flex-1 text-center xl:text-left space-y-4 relative z-10">
            <div className="flex flex-col xl:flex-row items-center gap-4">
              <h1 className="text-4xl sm:text-7xl font-black tracking-tighter leading-none">{user.name}</h1>
              <span className="px-6 py-2 rounded-full bg-primary/10 text-primary text-[13px] font-black uppercase tracking-[0.2em] border border-primary/20">
                {user.category} Member
              </span>
            </div>
            <p className="text-xl sm:text-2xl text-muted-foreground font-bold opacity-60 flex items-center justify-center xl:justify-start gap-3">
              <Mail className="h-6 w-6" /> {user.email}
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleEditOpen}
              className="h-16 px-8 rounded-2xl bg-muted/50 flex items-center gap-3 text-[14px] font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95"
            >
              <Settings className="h-6 w-6" /> Account Settings
            </button>
          </div>
        </div>

        {/* Info Grid - Bento Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-card/40 border border-border/40 rounded-[3rem] overflow-hidden shadow-sm backdrop-blur-md">
              <div className="px-12 py-8 bg-muted/20 border-b border-border/40 flex items-center justify-between">
                <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Profile Identification</h3>
                <button onClick={handleEditOpen} className="text-[12px] font-black text-primary hover:underline uppercase tracking-widest">Update Data →</button>
              </div>
              <div className="p-12 grid grid-cols-1 sm:grid-cols-2 gap-12">
                <DetailItem icon={<Phone className="h-7 w-7" />} label="Mobile Number" value={user.phone} />
                <DetailItem icon={<Mail className="h-7 w-7" />} label="Email Address" value={user.email} />
                {user.category === "Student" && (
                   <>
                    <DetailItem icon={<GraduationCap className="h-7 w-7" />} label="Department / Class" value={user.classDept || "Not Set"} />
                    <DetailItem icon={<IdCard className="h-7 w-7" />} label="Aurora Campus ID" value={user.auroraId || "Not Set"} />
                   </>
                )}
                {user.category === "Lecturer" && (
                   <DetailItem icon={<ShieldCheck className="h-7 w-7" />} label="Access Role" value="Faculty / Admin" />
                )}
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
               <BigStat icon={<ShoppingBag className="h-10 w-10" />} label="Orders Placed" value={String(orders.length)} color="bg-blue-600" />
               <BigStat icon={<Wallet className="h-10 w-10" />} label="Total Investment" value={`₹${totalSpent}`} color="bg-green-600" />
            </div>
          </div>

          {/* Side Panel: Order Timeline */}
          <div className="lg:col-span-4">
             <div className="bg-card/40 border border-border/40 rounded-[3rem] overflow-hidden h-full shadow-sm flex flex-col">
                <div className="px-10 py-8 bg-muted/20 border-b border-border/40">
                  <h3 className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Order Timeline</h3>
                </div>
                <div className="p-8 flex-1 space-y-6 overflow-y-auto no-scrollbar max-h-[600px]">
                   {orders.length > 0 ? (
                      orders.map((o) => (
                        <div key={o.id} className="group flex items-start gap-6 p-6 rounded-[2rem] bg-muted/20 border border-transparent hover:border-primary/20 transition-all hover:bg-primary/[0.02]">
                           <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                              <Calendar className="h-6 w-6" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <p className="text-lg font-black tracking-tight">Order #{o.id}</p>
                              <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                 <span>{new Date(o.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                 <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                 <span className="text-primary">₹{o.total}</span>
                              </div>
                           </div>
                        </div>
                      ))
                   ) : (
                      <div className="py-20 text-center opacity-30 italic font-bold">No history available</div>
                   )}
                </div>
                <div className="p-10 mt-auto border-t border-border/40">
                   <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-4 h-20 rounded-[2rem] bg-destructive/5 text-destructive text-xl font-black border-2 border-destructive/10 hover:bg-destructive/10 active:scale-95 transition-all shadow-lg shadow-destructive/10"
                   >
                    <LogOut className="h-6 w-6" /> Sign Out
                   </button>
                </div>
             </div>
          </div>
        </div>

        <p className="text-center text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground/30 py-20">
          QuickBite Smart Campus Infrastructure v2.5.0
        </p>
      </div>

      {/* EDIT MODAL - Full Screen Immersive */}
      <AnimatePresence>
        {isEditing && editForm && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20"
           >
              <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" onClick={() => setIsEditing(false)} />
              
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-4xl bg-card border border-border rounded-[4rem] shadow-2xl p-10 sm:p-20 relative z-10 overflow-y-auto no-scrollbar max-h-[90vh]"
              >
                 <div className="flex items-center justify-between mb-16">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-black tracking-tighter">Edit Your Profile</h2>
                       <p className="text-lg text-muted-foreground font-bold">Customize your identity at QuickBite</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="h-16 w-16 rounded-[1.5rem] bg-muted hover:bg-muted/80 flex items-center justify-center transition-all">
                       <X className="h-8 w-8" />
                    </button>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-10">
                    <EditField label="Full Name" value={editForm.name} icon={<UserIcon />} onChange={(v) => setEditForm({...editForm, name: v})} />
                    <EditField label="Mobile Number" value={editForm.phone} icon={<Phone />} onChange={(v) => setEditForm({...editForm, phone: v})} />
                    <EditField label="Email Address" value={editForm.email} icon={<Mail />} onChange={(v) => setEditForm({...editForm, email: v})} />
                    {editForm.category === "Student" && (
                       <>
                        <EditField label="Department / Class" value={editForm.classDept} icon={<GraduationCap />} onChange={(v) => setEditForm({...editForm, classDept: v})} />
                        <EditField label="Aurora ID" value={editForm.auroraId || ""} icon={<IdCard />} onChange={(v) => setEditForm({...editForm, auroraId: v})} />
                       </>
                    )}
                    <div className="sm:col-span-2 p-8 rounded-3xl bg-muted/30 border border-border/40 flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-background flex items-center justify-center text-primary shadow-sm border border-border/40">
                          <Lock className="h-6 w-6" />
                       </div>
                       <div className="flex-1">
                          <p className="text-[12px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Account Category</p>
                          <p className="text-xl font-black">{editForm.category}</p>
                       </div>
                       <p className="text-[11px] font-black text-muted-foreground italic uppercase">Permanent Field</p>
                    </div>
                 </div>

                 <button
                   onClick={handleSave}
                   className="w-full h-20 rounded-[2rem] bg-primary text-white text-xl font-black shadow-2xl shadow-primary/30 mt-16 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Save Changes <CheckCircle2 className="h-6 w-6" />
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
    <div className="flex items-start gap-8 group">
      <div className="h-16 w-16 rounded-[1.5rem] bg-muted/40 flex items-center justify-center text-muted-foreground/50 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <p className="text-[12px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2 leading-none">
          {label}
        </p>
        <p className="text-[20px] font-black truncate text-foreground leading-tight tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function BigStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-card/40 border border-border/40 p-12 rounded-[3.5rem] relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
       <div className={cn("absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-[0.05] group-hover:scale-150 transition-transform duration-1000", color)} />
       <div className={cn("h-20 w-20 rounded-[1.75rem] flex items-center justify-center text-white mb-8 shadow-2xl", color)}>
          {icon}
       </div>
       <div className="text-5xl font-black tracking-tighter mb-2">{value}</div>
       <div className="text-[12px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">{label}</div>
    </div>
  );
}

function EditField({ label, value, icon, onChange }: { label: string; value: string; icon: React.ReactNode; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
       <label className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4 opacity-60">{label}</label>
       <div className="h-16 px-6 rounded-2xl bg-muted/50 border-2 border-transparent focus-within:border-primary/40 focus-within:bg-background transition-all flex items-center gap-4">
          <span className="text-muted-foreground/40">{icon}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[16px] font-bold"
          />
       </div>
    </div>
  );
}

