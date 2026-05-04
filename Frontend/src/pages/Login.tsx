import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { UtensilsCrossed } from "lucide-react";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await login(name.trim(), contact.trim());
      toast.success(`Welcome${mode === "signup" ? "" : " back"}, ${name}!`);
      navigate("/");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Campus Canteen</h1>
          <p className="text-sm text-muted-foreground mt-1">Order food in seconds</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 border border-border/50">
          <div className="flex bg-muted rounded-full p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors ${
                  mode === m ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={60} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact">Phone or Email</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="9876543210 or you@college.edu"
                maxLength={120}
              />
            </div>
            <Button type="submit" className="w-full rounded-full font-semibold h-11 shadow-soft" disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Tip: use <code className="bg-muted px-1 rounded">admin@canteen</code> to access admin panel.
          </p>
        </div>
      </div>
    </main>
  );
}
