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
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight,
  Loader2,
  Home,
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
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit number";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    
    if (!isLecturer && !form.classDept.trim()) {
      newErrors.classDept = "Class/Department is required";
    }

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
      toast.success("Welcome to QuickBite!");
      navigate({ to: next });
      setIsSubmitting(false);
    }, 800);
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof QuickBiteUser]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <header className="w-full max-w-[2500px] px-8 sm:px-24 h-28 sm:h-32 flex items-center gap-10 border-b-2 border-border/40 bg-background/60 backdrop-blur-3xl sticky top-0 z-50">
        <button
          onClick={() => navigate({ to: "/" })}
          className="p-6 rounded-[2rem] bg-muted/50 hover:bg-muted active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft className="h-10 w-10" />
        </button>
        <div>
           <h1 className="font-black text-4xl sm:text-5xl tracking-tighter leading-none">Authentication</h1>
           <p className="text-[14px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-3">Campus OS Identity · Single Sign-On</p>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[2500px] flex flex-col xl:flex-row items-center justify-center p-8 sm:p-24 gap-20 sm:gap-48">
        
        {/* Branding Section */}
        <div className="hidden xl:flex flex-col max-w-3xl space-y-16 text-left">
          <div className="h-48 w-48 rounded-[4rem] bg-primary text-white flex items-center justify-center shadow-3xl shadow-primary/40 group">
            <Zap className="h-24 w-24 group-hover:scale-125 transition-transform duration-1000" />
          </div>
          <div className="space-y-10">
            <h1 className="text-[clamp(4rem,10vw,12rem)] font-black leading-[0.85] tracking-tighter">
              The <span className="text-primary italic underline decoration-primary/20 underline-offset-[20px]">Smart</span> <br /> Way to Eat.
            </h1>
            <p className="text-3xl sm:text-5xl text-muted-foreground font-bold leading-relaxed opacity-60">
              Skip the queue, track your tokens, and enjoy freshly prepared campus meals with QuickBite OS.
            </p>
          </div>
          <div className="flex gap-16">
             <div className="flex flex-col">
                <span className="text-6xl sm:text-8xl font-black text-primary">10k+</span>
                <span className="text-[16px] font-black uppercase tracking-[0.4em] opacity-40">Active Students</span>
             </div>
             <div className="w-[2px] bg-border/40" />
             <div className="flex flex-col">
                <span className="text-6xl sm:text-8xl font-black text-green-600">50+</span>
                <span className="text-[16px] font-black uppercase tracking-[0.4em] opacity-40">Campus Vendors</span>
             </div>
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-3xl bg-card border-2 border-border/60 rounded-[5rem] p-12 sm:p-24 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none"><Zap className="h-[400px] w-[400px] text-primary" /></div>
          
          <div className="mb-20 space-y-4">
            <h2 className="text-6xl sm:text-8xl font-black tracking-tighter">Create Profile</h2>
            <p className="text-2xl text-muted-foreground font-bold opacity-60 italic">
              Tell us who you are to begin your journey.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-12">
            {/* Category Switcher */}
            <div className="p-3 rounded-[3rem] bg-muted/50 flex gap-3 shadow-inner">
              {(["Student", "Lecturer"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, category: cat }));
                    setErrors({});
                  }}
                  className={cn(
                    "flex-1 h-20 sm:h-24 rounded-[2.5rem] text-[18px] sm:text-[22px] font-black uppercase tracking-[0.3em] transition-all duration-700",
                    form.category === cat
                      ? "bg-background text-primary shadow-3xl scale-[1.03]"
                      : "text-muted-foreground hover:bg-background/40",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-12">
              <BigInput
                label="Your Name"
                icon={<LoginUserIcon className="h-10 w-10" />}
                placeholder="Full display name"
                value={form.name}
                error={errors.name}
                onChange={(v: string) => updateField("name", v)}
              />

              <BigInput
                label="Phone Number"
                icon={<Phone className="h-10 w-10" />}
                placeholder="10 digit mobile"
                value={form.phone}
                error={errors.phone}
                onChange={(v: string) => updateField("phone", v.replace(/\D/g, "").slice(0, 10))}
                type="tel"
              />

              <BigInput
                label="Email ID"
                icon={<Mail className="h-10 w-10" />}
                placeholder="campus@domain.edu"
                value={form.email}
                error={errors.email}
                onChange={(v: string) => updateField("email", v)}
                type="email"
              />

              <AnimatePresence mode="popLayout">
                {!isLecturer && (
                  <motion.div
                    key="student-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-12 overflow-hidden"
                  >
                    <BigInput
                      label="Department / Class"
                      icon={<GraduationCap className="h-10 w-10" />}
                      placeholder="e.g. CS - 3rd Year"
                      value={form.classDept}
                      error={errors.classDept}
                      onChange={(v: string) => updateField("classDept", v)}
                    />

                    <BigInput
                      label="Aurora Campus ID"
                      icon={<IdCard className="h-10 w-10" />}
                      placeholder="AUR-XXXX (Optional)"
                      value={form.auroraId}
                      onChange={(v: string) => updateField("auroraId", v)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-28 sm:h-32 rounded-[3rem] bg-primary text-white font-black text-3xl shadow-3xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-8 group"
            >
              {isSubmitting ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : (
                <>
                  Join the Network <ChevronRight className="h-12 w-12 group-hover:translate-x-6 transition-transform duration-700" />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-16 border-t-2 border-border/40 text-center">
            <Link
              to="/admin/login"
              className="text-[16px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-6 font-black uppercase tracking-[0.5em] opacity-40 hover:opacity-100"
            >
              <ShieldCheck className="h-8 w-8" /> Staff Control Access
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BigInput({ label, icon, placeholder, value, onChange, error, type = "text" }: any) {
  return (
    <div className="space-y-6">
      <label className="text-[14px] font-black uppercase tracking-[0.5em] text-muted-foreground/60 px-10 leading-none">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-8 h-24 sm:h-28 px-12 rounded-[2.5rem] bg-muted/30 border-4 transition-all duration-700 focus-within:bg-background focus-within:shadow-3xl focus-within:shadow-primary/5",
          error ? "border-destructive/30" : "border-transparent focus-within:border-primary/40",
        )}
      >
        <span className={cn("transition-colors", error ? "text-destructive" : "text-muted-foreground/20")}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-2xl sm:text-3xl font-black placeholder:text-muted-foreground/10"
        />
      </div>
      {error && <p className="text-[14px] font-black text-destructive px-10 uppercase tracking-widest">{error}</p>}
    </div>
  );
}
