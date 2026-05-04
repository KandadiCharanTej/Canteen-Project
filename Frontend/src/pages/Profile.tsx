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
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
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
      <>
        <PageHeader title="Profile" showBack />
        <Spinner label="Loading profile..." />
      </>
    );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <PageHeader title="Profile" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 safe-bottom space-y-4">
        {/* User Card */}
        <div className="bg-gradient-primary rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-sm opacity-90 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {user?.contact}
              </p>
              <p className="text-xs opacity-80 flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="h-3.5 w-3.5" />{" "}
                {user?.category || "Student"}
                {user?.student_class && ` · ${user.student_class}`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={profile.total_orders.toString()}
            />
            <StatCard
              icon={IndianRupee}
              label="Total Spent"
              value={`₹${profile.total_spent.toFixed(0)}`}
            />
          </div>
        )}

        {/* Favorites */}
        {profile && profile.favorite_items.length > 0 && (
          <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-destructive" /> Favorite Items
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.favorite_items.map((item) => (
                <span
                  key={item}
                  className="bg-accent text-accent-foreground text-sm px-3 py-1.5 rounded-full font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Order History Timeline */}
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" /> Order Timeline
          </h3>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No orders yet
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.slice(0, 10).map((o) => (
                <div
                  key={o.id}
                  className="flex items-start gap-3 border-l-2 border-border pl-3 pb-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">Order #{o.id}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()} ·{" "}
                      {o.time_slot} · ₹{o.total_price}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {o.items
                        .map(
                          (i) =>
                            `${i.item?.name || "Item"} ×${i.quantity}`
                        )
                        .join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full rounded-full font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-4 text-center">
      <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
