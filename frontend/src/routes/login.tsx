import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User as LoginUserIcon,
  Phone,
  Mail,
  GraduationCap,
  IdCard,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useStore, type QuickBiteUser } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({ next: (s.next as string) || "/" }),
});

type FormErrors = Partial<Record<keyof QuickBiteUser, string>>;

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { setUser } = useStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    classDept: "",
    category: "Student" as "Student" | "Lecturer",
    auroraId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLecturer = form.category === "Lecturer";

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) newErrors.phone = "Invalid number";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!isLecturer && !form.classDept.trim()) newErrors.classDept = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const finalUser: QuickBiteUser = {
        ...form,
        classDept: isLecturer ? "Faculty" : form.classDept,
        auroraId: isLecturer ? undefined : form.auroraId,
      };
      setUser(finalUser);
      toast.success("Welcome!");
      navigate({ to: next });
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        <header className="mb-8 text-center space-y-2">
           <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg mb-4">
              <Sparkles className="h-6 w-6" />
           </div>
           <h1 className="text-2xl font-bold tracking-tight">Welcome to QuickBite</h1>
           <p className="text-sm text-muted-foreground">Sign in to start ordering smarter.</p>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="p-1 rounded-xl bg-muted flex gap-1">
            {(["Student", "Lecturer"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setForm((prev) => ({ ...prev, category: cat }));
                  setErrors({});
                }}
                className={cn(
                  "flex-1 h-9 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  form.category === cat
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/50",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <InputGroup
              icon={<LoginUserIcon className="h-4 w-4" />}
              placeholder="Full Name"
              value={form.name}
              error={errors.name}
              onChange={(v) => setForm({...form, name: v})}
            />
            <InputGroup
              icon={<Phone className="h-4 w-4" />}
              placeholder="Phone Number"
              value={form.phone}
              error={errors.phone}
              onChange={(v) => setForm({...form, phone: v.replace(/\D/g, "")})}
              type="tel"
            />
            <InputGroup
              icon={<Mail className="h-4 w-4" />}
              placeholder="Email ID"
              value={form.email}
              error={errors.email}
              onChange={(v) => setForm({...form, email: v})}
              type="email"
            />

            <AnimatePresence mode="popLayout">
              {!isLecturer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <InputGroup
                    icon={<GraduationCap className="h-4 w-4" />}
                    placeholder="Class / Dept"
                    value={form.classDept}
                    error={errors.classDept}
                    onChange={(v) => setForm({...form, classDept: v})}
                  />
                  <InputGroup
                    icon={<IdCard className="h-4 w-4" />}
                    placeholder="Campus ID (Optional)"
                    value={form.auroraId}
                    onChange={(v) => setForm({...form, auroraId: v})}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <Link
            to="/admin/login"
            className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <ShieldCheck className="h-3 w-3" /> Staff Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function InputGroup({ icon, placeholder, value, onChange, error, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <div className={cn(
        "flex items-center gap-3 h-11 px-4 rounded-xl bg-muted/50 border transition-all focus-within:bg-background focus-within:border-primary/30",
        error ? "border-destructive/30" : "border-transparent"
      )}>
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder:text-muted-foreground/30"
        />
      </div>
      {error && <p className="text-[10px] font-bold text-destructive px-2 uppercase tracking-widest">{error}</p>}
    </div>
  );
}
