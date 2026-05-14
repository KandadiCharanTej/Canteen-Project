import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, User as UserIcon, GraduationCap, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({ next: (s.next as string) || "/" }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { setUser } = useStore();
  const [step, setStep] = useState<"info" | "otp">("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"Student" | "Lecturer">("Student");
  const [department, setDepartment] = useState("");
  const [otp, setOtp] = useState("");

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length !== 10 || !department) return toast.error("Fill all fields");
    setStep("otp");
    toast.success("OTP sent — try 1234");
  };

  const verify = () => {
    if (otp !== "1234") return toast.error("Invalid OTP (use 1234)");
    setUser({ name, phone, role, department });
    toast.success(`Welcome, ${name.split(" ")[0]}!`);
    navigate({ to: next });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 h-14 flex items-center gap-2 border-b border-border/60">
        <button
          onClick={() => navigate({ to: "/" })}
          className="p-2 -ml-2 rounded-full hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold">Sign in</span>
      </header>

      <div className="flex-1 grid place-items-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col items-center mb-4">
            <div className="h-12 w-12 rounded-2xl gradient-primary grid place-items-center text-white text-lg font-bold shadow-[var(--shadow-pop)]">
              Q
            </div>
            <h1 className="mt-2 text-[17px] font-semibold">Welcome to QuickBite</h1>
            <p className="text-[12px] text-muted-foreground">Order before you reach the canteen.</p>
          </div>

          {step === "info" ? (
            <form onSubmit={sendOtp} className="space-y-2.5">
              <Field
                icon={<UserIcon className="h-4 w-4" />}
                placeholder="Full name"
                value={name}
                onChange={setName}
              />
              <Field
                icon={<Phone className="h-4 w-4" />}
                placeholder="10-digit phone"
                value={phone}
                onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                type="tel"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["Student", "Lecturer"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`h-10 rounded-xl text-[12px] font-medium border transition ${role === r ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Field
                icon={<GraduationCap className="h-4 w-4" />}
                placeholder="Department / Class"
                value={department}
                onChange={setDepartment}
              />
              <button className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.99] transition">
                Send OTP
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-muted-foreground text-center">
                Enter the OTP sent to +91 {phone}
              </p>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="w-full h-14 text-center text-2xl tracking-[0.5em] font-semibold rounded-xl bg-muted border border-border outline-none focus:border-primary"
              />
              <button
                onClick={verify}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                Verify & Continue
              </button>
              <button
                onClick={() => setStep("info")}
                className="w-full text-[12px] text-muted-foreground hover:text-foreground"
              >
                Edit details
              </button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-border text-center">
            <Link
              to="/admin/login"
              className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ShieldCheck className="h-3 w-3" /> Admin / Canteen Staff Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
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
    <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-muted border border-transparent focus-within:border-primary focus-within:bg-background transition">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
    </label>
  );
}
