import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authApi, ordersApi } from "@/lib/api";
import { Profile as ProfileType, Order } from "@/lib/types";
import { User as UserIcon, Phone, GraduationCap, ShoppingBag, IndianRupee, LogOut } from "lucide-react";

export default function Profile() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }
    Promise.all([authApi.getProfile(), ordersApi.getOrders()])
      .then(([p, o]) => {
        setProfile(p);
        setOrders(o);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  if (loading)
    return (
      <div className="bg-[#f8f9fa] min-h-screen">
        <PageHeader title="Profile" />
        <div className="flex justify-center py-20"><Spinner label="Loading..." /></div>
      </div>
    );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 md:pb-12">
      <PageHeader title="Profile" />

      <div className="px-4 py-6 max-w-sm mx-auto space-y-4">
        {/* User Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-black mb-3">
            {user?.name?.charAt(0) || "U"}
          </div>
          <h2 className="text-[18px] font-black text-gray-900 leading-tight mb-1">{user?.name}</h2>
          <div className="flex flex-col items-center gap-1">
             <span className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider"><Phone className="h-3 w-3" /> {user?.contact}</span>
             <span className="text-[10px] font-black uppercase text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 mt-1">{user?.role}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
            <ShoppingBag className="h-4 w-4 text-orange-500" />
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Orders</p>
            <p className="text-[16px] font-black text-gray-900 leading-none">{profile?.total_orders}</p>
          </div>
          <div className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex flex-col items-center gap-1">
            <IndianRupee className="h-4 w-4 text-green-500" />
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Spent</p>
            <p className="text-[16px] font-black text-gray-900 leading-none">₹{profile?.total_spent.toFixed(0)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[12px] font-bold text-gray-600">Department/Class</span>
             </div>
             <span className="text-[12px] font-black text-gray-900">{user?.student_class || "N/A"}</span>
          </div>
          
          {profile && profile.favorite_items.length > 0 && (
            <div className="pt-3 border-t border-gray-50">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Favorite Foods</h3>
               <div className="flex flex-wrap gap-1.5">
                 {profile.favorite_items.slice(0, 5).map((item) => (
                   <span key={item} className="bg-gray-50 border border-gray-100 text-gray-700 text-[10px] px-2.5 py-1 rounded-md font-bold">
                     {item}
                   </span>
                 ))}
               </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full h-11 rounded-xl font-black text-[12px] uppercase tracking-wider text-red-600 border border-red-50 bg-white hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-3.5 w-3.5" /> Log Out
        </button>
      </div>
    </div>
  );
}
