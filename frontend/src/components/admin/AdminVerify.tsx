import { useState } from "react";
import { ordersApi } from "@/services/api";
import { ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminVerify() {
  const [orderId, setOrderId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!orderId || !otp) return;
    setLoading(true);
    try {
      await ordersApi.verifyOtp(parseInt(orderId), otp);
      toast.success("Order Completed!");
      setOrderId("");
      setOtp("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
           <ShieldCheck className="h-8 w-8" />
        </div>
        
        <h2 className="text-[20px] font-black text-gray-900 mb-2">Verify Pickup</h2>
        <p className="text-[12px] font-bold text-gray-400 text-center mb-8 uppercase tracking-widest">
           Enter order details to complete delivery
        </p>

        <div className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Order ID</label>
            <Input 
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. 1042"
              className="h-12 rounded-2xl bg-gray-50 border-none font-black text-center text-[16px] focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">4-Digit OTP</label>
            <Input 
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="0 0 0 0"
              maxLength={4}
              className="h-12 rounded-2xl bg-gray-50 border-none font-black text-center text-[18px] tracking-[0.5em] focus-visible:ring-primary/20"
            />
          </div>

          <Button 
            onClick={handleVerify}
            disabled={loading || !orderId || otp.length < 4}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[14px] shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all"
          >
            {loading ? "Verifying..." : "Confirm Delivery"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-[10px] font-bold text-gray-400">
           <CheckCircle2 className="h-3 w-3" /> Securing campus food operations
        </div>
      </div>
    </div>
  );
}


