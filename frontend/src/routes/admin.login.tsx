import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User as AdminUserIcon, Phone, ShieldCheck, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card border rounded-3xl p-6 shadow-sm relative overflow-hidden"
      >
        <header className="mb-6 text-center space-y-2">
           <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center mx-auto shadow-sm mb-4">
              <ShieldCheck className="h-6 w-6" />
           </div>
           <h1 className="text-xl font-bold tracking-tight">Staff Portal</h1>
           <p className="text-xs text-muted-foreground font-medium">Access QuickBite operations.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <AdminInput
              icon={<AdminUserIcon className="h-4 w-4" />}
              placeholder="Staff Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <AdminInput
              icon={<Phone className="h-4 w-4" />}
              placeholder="Mobile Number"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v.replace(/\D/g, "") }))}
              type="tel"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-foreground text-background font-bold text-sm shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? "Verifying..." : <>Enter Dashboard <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t text-center flex items-center justify-between">
          <Link
            to="/login"
            className="text-[11px] text-muted-foreground font-bold hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Consumer
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
    <div className="flex items-center gap-3 h-11 px-3 rounded-xl bg-muted/50 border transition-all focus-within:bg-background focus-within:border-foreground/30">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder:text-muted-foreground/40"
      />
    </div>
  );
}
