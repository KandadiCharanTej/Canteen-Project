import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd !== "admin123") return toast.error("Wrong password (try admin123)");
    localStorage.setItem("qb_admin", "1");
    toast.success("Signed in as staff");
    navigate({ to: "/admin" });
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
        <span className="font-semibold">Staff Sign-in</span>
      </header>

      <div className="flex-1 grid place-items-center px-4">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]"
        >
          <div className="flex flex-col items-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 grid place-items-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-2 text-base font-semibold">Canteen Staff Login</h1>
            <p className="text-[12px] text-muted-foreground">
              Hint: password is <code className="font-mono bg-muted px-1 rounded">admin123</code>
            </p>
          </div>
          <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-muted">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Staff password"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </label>
          <button className="mt-3 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            Sign in
          </button>
        </motion.form>
      </div>
    </div>
  );
}
