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
import { UtensilsCrossed, ArrowLeft, Phone, User as UserIcon, GraduationCap, Mail, Fingerprint } from "lucide-react";

export default function Login() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
 
  const [contact, setContact] = useState("");
  const [auroraUid, setAuroraUid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Student");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
 
  if (user) return <Navigate to={from} replace />;
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || contact.length < 10) {
      toast.error("Please fill in Name and Phone Number");
      return;
    }
    
    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim() || undefined,
        contact: contact.trim(),
        category,
        student_class: studentClass.trim() || undefined,
        aurora_uid: auroraUid.trim() || undefined,
      });
      toast.success(`Welcome to CanteenFood!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Action failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-8 hover:text-primary transition-all group uppercase tracking-widest"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /> 
          Back to menu
        </button>
 
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-3">
            <UtensilsCrossed className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Get Started</h1>
          <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">
            Enter your details to continue
          </p>
        </div>
 
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-11 pl-10 rounded-xl bg-gray-50 border-none text-[13px] font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="contact" className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="h-11 pl-10 rounded-xl bg-gray-50 border-none text-[13px] font-bold focus-visible:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="aurora" className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Aurora UID</Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="aurora"
                    value={auroraUid}
                    onChange={(e) => setAuroraUid(e.target.value)}
                    placeholder="UID"
                    className="h-11 pl-10 rounded-xl bg-gray-50 border-none text-[13px] font-bold focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
 
            <div className="space-y-1">
              <Label htmlFor="email" className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Email ID (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-11 pl-10 rounded-xl bg-gray-50 border-none text-[13px] font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-none text-[13px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Student" className="font-bold text-[13px]">Student</SelectItem>
                    <SelectItem value="Lecturer" className="font-bold text-[13px]">Lecturer</SelectItem>
                    <SelectItem value="Staff" className="font-bold text-[13px]">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="class" className="font-black text-gray-400 uppercase tracking-widest text-[9px] ml-1">Class (Optional)</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="class"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="e.g. CSE"
                    className="h-11 pl-10 rounded-xl bg-gray-50 border-none text-[13px] font-bold focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
 
            <Button
              type="submit"
              disabled={loading || !name.trim() || contact.length < 10}
              className="w-full rounded-xl font-black h-12 shadow-md shadow-primary/20 text-[14px] uppercase tracking-wider transition-all active:scale-95 mt-4"
            >
              {loading ? "Processing..." : "Continue Ordering"}
            </Button>
          </form>
        </div>
 
        <p className="text-[9px] font-black text-gray-400 text-center mt-8 uppercase tracking-[0.2em] leading-relaxed">
          Quick entry • No OTP required • Direct access
        </p>
      </div>
    </main>
  );
}
