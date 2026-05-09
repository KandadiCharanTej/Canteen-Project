import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authApi, ordersApi } from "@/lib/api";
import { Profile as ProfileType, Order } from "@/lib/types";
import {
  User as UserIcon,
  Phone,
  GraduationCap,
  ShoppingBag,
  IndianRupee,
  Heart,
  Clock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="bg-gray-50 min-h-screen">
        <PageHeader title="Profile" />
        <div className="flex justify-center py-20"><Spinner label="Loading your profile..." /></div>
      </div>
    );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      {/* Profile Header - Responsive */}
      <div className="bg-white px-4 pt-10 pb-8 shadow-sm mb-8 rounded-b-[3rem] md:rounded-b-none md:border-b md:border-gray-100">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
           <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center text-4xl md:text-6xl font-black shadow-xl border-8 border-white">
             {user?.name?.charAt(0) || "U"}
           </div>
           <div className="text-center md:text-left flex-1">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">{user?.name}</h2>
             <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                 <UserIcon className="h-3.5 w-3.5" /> {user?.role}
               </span>
               <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Phone className="h-3.5 w-3.5" /> {user?.contact}
               </span>
             </div>
           </div>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Account Info & Stats */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <div className="h-2 w-8 bg-primary rounded-full" /> Account Details
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-[2rem] p-6 flex items-center gap-5 shadow-sm border border-gray-100">
                   <div className="bg-blue-50 p-4 rounded-2xl">
                     <GraduationCap className="h-7 w-7 text-blue-500" />
                   </div>
                   <div>
                     <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Student Classification</p>
                     <p className="text-lg font-black text-gray-900">
                       {user?.category || "Student"} {user?.student_class && `· ${user?.student_class}`}
                     </p>
                   </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
                <div className="h-2 w-8 bg-orange-400 rounded-full" /> Fast Stats
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-xl transition-all duration-300">
                  <div className="bg-orange-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-7 w-7 text-orange-500" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 leading-none mb-2">{profile?.total_orders}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Orders</p>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center group hover:shadow-xl transition-all duration-300">
                  <div className="bg-green-50 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                    <IndianRupee className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 leading-none mb-2">₹{profile?.total_spent.toFixed(0)}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Spent</p>
                </div>
              </div>
            </section>

            {profile && profile.favorite_items.length > 0 && (
              <section>
                <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
                  <div className="h-2 w-8 bg-red-400 rounded-full" /> Your Favorites
                </h3>
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                  <div className="flex flex-wrap gap-3">
                    {profile.favorite_items.map((item) => (
                      <span
                        key={item}
                        className="bg-gray-50 border-2 border-gray-100 text-gray-700 text-sm px-6 py-3 rounded-2xl font-black shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}
            
            <div className="hidden lg:block pt-8">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full h-16 rounded-[1.5rem] font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <LogOut className="h-6 w-6 stroke-[3]" /> LOG OUT
              </Button>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-5">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                   <div className="h-2 w-8 bg-blue-400 rounded-full" /> Recent Orders
                 </h3>
                 <Button variant="link" onClick={() => navigate("/orders")} className="text-primary text-sm font-black p-0 h-auto uppercase tracking-widest">View All</Button>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-[1.5rem] border-2 border-dashed border-gray-200">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No recent orders found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="group relative flex gap-6 pb-6 last:pb-0 border-b last:border-0 border-gray-50">
                        <div className="flex flex-col items-center gap-2">
                           <div className={cn(
                             "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                             o.status === "Completed" ? "bg-green-500" : "bg-orange-500 shadow-orange-200"
                           )}>
                             <ShoppingBag className="h-6 w-6" />
                           </div>
                           <div className="flex-1 w-0.5 bg-gray-50" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="font-black text-lg text-gray-900 underline decoration-primary/20 underline-offset-4">Order #{o.id}</span>
                             <span className="font-black text-xl text-gray-900">₹{o.total_price}</span>
                          </div>
                          <div className="text-xs text-gray-400 font-black mb-3 uppercase tracking-widest">
                             {new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-500 font-bold bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
                            {o.items.map((i) => i.item?.name).join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            
            <div className="lg:hidden pt-4">
              <Button
                onClick={handleLogout}
                className="w-full h-16 rounded-2xl font-black bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm transition-all text-lg"
              >
                <LogOut className="h-6 w-6 mr-3 stroke-[3]" /> LOG OUT
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
