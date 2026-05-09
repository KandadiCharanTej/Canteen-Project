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
import { UtensilsCrossed, ArrowLeft, Phone, KeyRound, User as UserIcon, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthStep = "phone" | "otp" | "signup";

export default function Login() {
  const { sendOTP, verifyOTP, signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  const [step, setStep] = useState<AuthStep>("phone");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Student");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contact.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOTP(contact.trim());
      if (res?.otp) {
        toast.success(`OTP sent! For demo: ${res.otp}`, { duration: 10000 });
      } else {
        toast.success("OTP sent to your phone");
      }
      setStep("otp");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      toast.error("Enter 4-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOTP(contact.trim(), otp.trim());
      if (res.is_registered) {
        toast.success("Logged in successfully!");
        navigate(from, { replace: true });
      } else {
        setStep("signup");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        contact: contact.trim(),
        category,
        student_class: studentClass.trim() || undefined,
      });
      toast.success(`Welcome to CanteenFood, ${name}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 md:bg-white/50">
      <div className="w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={() => step === "phone" ? navigate(-1) : setStep("phone")}
          className="flex items-center gap-2 text-sm font-black text-gray-400 mb-10 hover:text-primary transition-all group uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> 
          {step === "phone" ? "Back to menu" : "Change Number"}
        </button>

        <div className="flex flex-col items-center mb-12">
          <div className="h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 border-4 border-white">
            <UtensilsCrossed className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">CanteenFood</h1>
          <p className="text-sm font-black text-gray-400 mt-2 uppercase tracking-widest">
            {step === "phone" ? "Enter your phone" : step === "otp" ? "Verify OTP" : "Complete Profile"}
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden transition-all duration-500">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50">
             <div 
               className="h-full bg-primary transition-all duration-500 ease-out"
               style={{ width: step === "phone" ? "33%" : step === "otp" ? "66%" : "100%" }}
             />
          </div>

          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="contact" className="font-black text-gray-400 uppercase tracking-widest text-[10px] ml-1">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <Input
                    id="contact"
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="h-14 pl-12 rounded-2xl bg-gray-50 border-none text-lg font-black focus-visible:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading || contact.length < 10}
                className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? "SENDING..." : "CONTINUE"} <ChevronRight className="h-5 w-5" />
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp" className="font-black text-gray-400 uppercase tracking-widest text-[10px]">4-Digit Code</Label>
                <div className="relative pt-2">
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    autoFocus
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="0000"
                    maxLength={4}
                    className="h-20 text-center text-4xl font-black tracking-[0.5em] rounded-2xl bg-gray-50 border-none focus-visible:ring-primary/20"
                  />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">
                  Sent to <span className="text-gray-900">+{contact}</span>
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length !== 4}
                className="w-full rounded-2xl font-black h-14 shadow-lg shadow-primary/20 text-lg transition-all active:scale-95"
              >
                {loading ? "VERIFYING..." : "VERIFY & LOGIN"}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep("phone")}
                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors py-2"
              >
                Resend OTP in 30s
              </button>
            </form>
          )}

          {step === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-black text-gray-400 uppercase tracking-widest text-[10px] ml-1">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-14 pl-12 rounded-2xl bg-gray-50 border-none text-lg font-black focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-black text-gray-400 uppercase tracking-widest text-[10px] ml-1">Category</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 z-10" />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-14 pl-12 rounded-2xl bg-gray-50 border-none text-lg font-black focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100">
                      <SelectItem value="Student" className="font-black">Student</SelectItem>
                      <SelectItem value="Lecturer" className="font-black">Lecturer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="font-black text-gray-400 uppercase tracking-widest text-[10px] ml-1">Class/Year (Optional)</Label>
                <Input
                  id="class"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="e.g. 2nd Year CSE-A"
                  className="h-14 rounded-2xl bg-gray-50 border-none text-lg font-black focus-visible:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full rounded-2xl font-black h-16 shadow-lg shadow-primary/20 text-lg transition-all active:scale-95 mt-4"
              >
                {loading ? "CREATING..." : "JOIN CANTEENFOOD"}
              </Button>
            </form>
          )}

        </div>

        {step === "phone" && (
          <p className="text-[10px] font-black text-gray-400 text-center mt-10 uppercase tracking-[0.2em] leading-relaxed">
            SECURE ACCESS SYSTEM <br />
            <span className="text-gray-300">AUTHORIZED PERSONNEL ONLY</span>
          </p>
        )}
      </div>
    </main>
  );
}
