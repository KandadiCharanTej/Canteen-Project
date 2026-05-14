import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User as AdminUserIcon, Phone, ShieldCheck, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Please enter credentials");

    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.setItem("qb_admin", "true");
      navigate({ to: "/admin" });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-8 sm:p-24">
      <header className="fixed top-0 left-0 w-full px-12 h-32 flex items-center gap-6 z-50">
        <button
          onClick={() => navigate({ to: "/login" })}
          className="p-6 rounded-[2rem] bg-background/80 hover:bg-background transition-all shadow-xl backdrop-blur-3xl active:scale-90"
        >
          <ArrowLeft className="h-10 w-10" />
        </button>
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border-4 border-border/60 rounded-[4rem] p-16 sm:p-24 shadow-3xl shadow-primary/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none"><ShieldCheck className="h-64 w-64 text-primary" /></div>
        
        <div className="text-center mb-16 space-y-6 relative z-10">
          <div className="h-32 w-32 mx-auto rounded-[3rem] bg-primary/10 text-primary flex items-center justify-center mb-8 shadow-inner">
            <ShieldCheck className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Staff Portal</h1>
          <p className="text-xl text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-60">
            Access Control Center
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-10 relative z-10">
          <AdminInput
            icon={<AdminUserIcon className="h-8 w-8" />}
            placeholder="Staff Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <AdminInput
            icon={<Phone className="h-8 w-8" />}
            placeholder="Mobile Number"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v.replace(/\D/g, "") }))}
            type="tel"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-24 sm:h-28 rounded-[2.5rem] bg-foreground text-background font-black text-2xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-6 shadow-3xl shadow-black/20"
          >
            {isSubmitting ? (
              "Verifying Access..."
            ) : (
              <>
                Enter Admin Panel <LogIn className="h-8 w-8" />
              </>
            )}
          </button>
        </form>

        <div className="mt-16 text-center">
          <Link
            to="/"
            className="text-[14px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 hover:text-primary transition-all"
          >
            Exit to Consumer App
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function AdminInput({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-8 h-24 px-10 rounded-[2.5rem] bg-muted/50 border-4 border-transparent focus-within:border-primary/30 focus-within:bg-background transition-all">
      <span className="text-muted-foreground/40">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-2xl font-black placeholder:text-muted-foreground/20"
      />
    </div>
  );
}
