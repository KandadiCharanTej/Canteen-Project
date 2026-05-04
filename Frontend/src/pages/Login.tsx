import { useState } from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UtensilsCrossed, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [category, setCategory] = useState("Student");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || !password.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(contact.trim(), password.trim());
        toast.success("Welcome back!");
      } else {
        await signup({
          name: name.trim(),
          contact: contact.trim(),
          password: password.trim(),
          category,
          student_class: studentClass.trim() || undefined,
        });
        toast.success(`Welcome, ${name}!`);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">CanteenFood</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Login to place your order"
              : "Create your account"}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
          {/* Mode Toggle */}
          <div className="flex bg-muted rounded-full p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors ${
                  mode === m
                    ? "bg-card shadow-soft text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="contact">Phone Number *</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="9876543210"
                maxLength={15}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  maxLength={60}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Lecturer">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="class">Class (optional)</Label>
                  <Input
                    id="class"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="e.g. CSE-A 2nd Year"
                    maxLength={30}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full rounded-full font-semibold h-11 shadow-soft"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Admin? Use{" "}
            <code className="bg-muted px-1 rounded">admin</code> /{" "}
            <code className="bg-muted px-1 rounded">admin123</code>
          </p>
        </div>
      </div>
    </main>
  );
}
