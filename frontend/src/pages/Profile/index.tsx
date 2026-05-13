import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { User, ShoppingBag, CreditCard, Heart, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: () => profileApi.getProfile(),
    enabled: !!user,
  });

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 md:pb-12">
      <PageHeader title="Profile" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-black mb-4 border-4 border-white shadow-sm">
            {user.name?.[0]}
          </div>
          <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
          <p className="text-sm font-bold text-gray-400">{user.contact} • {user.category}</p>
          {user.student_class && (
            <span className="mt-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-500 tracking-wider">
              {user.student_class}
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <ShoppingBag className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-black text-gray-900">{stats?.total_orders || 0}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <CreditCard className="h-5 w-5 text-green-600 mb-2" />
            <p className="text-2xl font-black text-gray-900">₹{stats?.total_spent || 0}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Spent</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-[14px] font-bold text-gray-700">Favorites</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 transition-colors text-red-500"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <span className="text-[14px] font-bold">Logout</span>
            </div>
          </button>
        </div>

        {stats?.favorite_items && stats.favorite_items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-4">Most Ordered</h3>
            <div className="flex flex-wrap gap-2">
              {stats.favorite_items.map((item: string) => (
                <span key={item} className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-bold border border-primary/10">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


