import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { menuApi, ordersApi, slotsApi } from "@/lib/api";
import { MenuItem, Order, OrderStatus, TimeSlot } from "@/lib/types";
import { Plus, Pencil, Trash2, CheckCircle, KeyRound, ChefHat, ShoppingBag, Search, Ban, Settings, Image as ImageIcon, CheckCircle2, XCircle, Bell, Volume2, VolumeX, Filter, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const blank: Partial<MenuItem> = {
  name: "",
  price: 0,
  category: "Snacks",
  available_quantity: 0,
  is_active: true,
  veg_flag: true,
  is_best: false,
  image_url: "",
  description: "",
};

export default function Admin() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [newSlot, setNewSlot] = useState({ slot_time: "", max_orders: 25 });
  const [open, setOpen] = useState(false);
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const queryClient = useQueryClient();
  const prevOrderCountRef = useRef(0);

  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.play().catch(() => {});
  }, [soundEnabled]);

  const { data: menu = [] } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: () => menuApi.getAllMenu(),
    refetchInterval: 5000,
  });

  const { data: slots = [] } = useQuery({
    queryKey: ["admin-slots"],
    queryFn: () => slotsApi.getSlots(),
    refetchInterval: 10000,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersApi.getOrders(),
    refetchInterval: 3000, // Very fast polling for admin
  });

  useEffect(() => {
    const activeNow = orders.filter(x => x.status !== "Completed").length;
    if (activeNow > prevOrderCountRef.current) {
      playNotification();
    }
    prevOrderCountRef.current = activeNow;
  }, [orders, playNotification]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
  };

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const activeOrders = orders.filter(o => {
    if (o.status === "Completed") return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toString().includes(q) ||
      o.user_name?.toLowerCase().includes(q) ||
      o.user_contact?.includes(q)
    );
  });
  
  // Group ACTIVE orders by time slot
  const groupedOrders = activeOrders.reduce(
    (acc, order) => {
      acc[order.time_slot] = acc[order.time_slot] || [];
      acc[order.time_slot].push(order);
      return acc;
    },
    {} as Record<string, Order[]>
  );

  const save = async () => {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("Name required");
    setSaving(true);
    try {
      if (editing.id) {
        await menuApi.updateItem(editing.id, editing);
      } else {
        await menuApi.createItem(editing as any);
      }
      toast.success("Item saved");
      setOpen(false);
      setEditing(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: MenuItem) => {
    await menuApi.updateItem(item.id, { is_active: !item.is_active });
    refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await menuApi.deleteItem(id);
    toast.success("Item deleted");
    refresh();
  };

  const updateStatus = async (id: number, status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(id, status);
      toast.success(`Order updated to ${status}`);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update");
    }
  };

  const markPaid = async (id: number) => {
    try {
      await ordersApi.updatePayment(id, "paid");
      toast.success("Marked as paid");
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update");
    }
  };

  const verifyOTP = async (orderId: number) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) {
      toast.error("Enter 4-digit OTP");
      return;
    }
    try {
      await ordersApi.verifyOTP(orderId, otp);
      toast.success("OTP verified! Order completed.");
      setOtpInputs((prev) => {
        const n = { ...prev };
        delete n[orderId];
        return n;
      });
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Invalid OTP");
    }
  };

  const isSlotUrgent = (slotTime: string) => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const [time, period] = slotTime.split(" ");
      let [h, m] = time.split(":").map(Number);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      
      const slotMinutes = h * 60 + m;
      const nowMinutes = currentHour * 60 + currentMinute;
      
      // Urgent if slot is within 30 mins from now or already passed but still has active orders
      return slotMinutes <= nowMinutes + 30;
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-24 md:pb-12">
      <header className="bg-white border-b border-gray-200 px-4 py-5 sticky top-0 z-50 flex items-center justify-between shadow-sm md:px-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Settings className="h-7 w-7 text-primary" /> Admin Console
        </h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn("h-10 w-10 rounded-xl transition-all", soundEnabled ? "text-primary bg-primary/10" : "text-gray-400 bg-gray-100")}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <span className="hidden md:block text-sm font-bold text-gray-400 uppercase tracking-widest">Admin: {user?.name}</span>
          <Button onClick={() => { logout(); }} variant="ghost" className="text-red-600 font-bold hover:bg-red-50">Logout</Button>
        </div>
      </header>

      <div className="px-4 py-8 md:px-8">
        <Tabs defaultValue="orders" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <TabsList className="grid grid-cols-3 w-full md:w-[600px] bg-white p-1.5 rounded-[1.5rem] shadow-sm h-16 border border-gray-100">
              <TabsTrigger value="orders" className="text-lg font-black rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                Live Orders
              </TabsTrigger>
              <TabsTrigger value="menu" className="text-lg font-black rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="slots" className="text-lg font-black rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">
                Slots
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="mt-0">
               <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditing({ ...blank })} className="h-16 px-10 text-lg font-black bg-gray-900 hover:bg-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3">
                    <Plus className="w-6 h-6" /> ADD NEW ITEM
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] p-8 sm:max-w-xl border-none shadow-2xl">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-black text-gray-900">{editing?.id ? "Edit Dish" : "Create Dish"}</DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-black text-gray-400 uppercase tracking-widest text-xs ml-1">Dish Name</Label>
                        <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-14 rounded-2xl text-lg font-bold bg-gray-50 border-2 border-transparent focus:border-primary/20 transition-all" placeholder="e.g. Special Chicken Biryani" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-black text-gray-400 uppercase tracking-widest text-xs ml-1">Price (₹)</Label>
                          <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} className="h-14 rounded-2xl text-lg font-bold bg-gray-50 border-2 border-transparent focus:border-primary/20 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-gray-400 uppercase tracking-widest text-xs ml-1">Stock Qty</Label>
                          <Input type="number" value={editing.available_quantity || 0} onChange={(e) => setEditing({ ...editing, available_quantity: +e.target.value })} className="h-14 rounded-2xl text-lg font-bold bg-gray-50 border-2 border-transparent focus:border-primary/20 transition-all" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-gray-400 uppercase tracking-widest text-xs ml-1">Category</Label>
                        <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="h-14 rounded-2xl text-lg font-bold bg-gray-50 border-2 border-transparent focus:border-primary/20 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <Label className="font-black text-sm cursor-pointer">Active</Label>
                          <Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <Label className="font-black text-sm cursor-pointer text-green-700">Veg</Label>
                          <Switch checked={editing.veg_flag ?? true} onCheckedChange={(v) => setEditing({ ...editing, veg_flag: v })} />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <Label className="font-black text-sm cursor-pointer text-orange-500">Trending</Label>
                          <Switch checked={editing.is_trending ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_trending: v })} />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <Label className="font-black text-sm cursor-pointer text-yellow-600">Best</Label>
                          <Switch checked={editing.is_best ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_best: v })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-black text-gray-400 uppercase tracking-widest text-xs ml-1">Prep Time (mins)</Label>
                        <Input type="number" value={editing.prep_time || 0} onChange={(e) => setEditing({ ...editing, prep_time: +e.target.value })} className="h-14 rounded-2xl text-lg font-bold bg-gray-50 border-2 border-transparent focus:border-primary/20 transition-all" />
                      </div>
                    </div>
                  )}
                  <DialogFooter className="mt-10">
                    <Button onClick={save} disabled={saving} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl">
                      {saving ? "SAVING..." : "SAVE CHANGES"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </div>

          {/* ─── ORDERS TAB ─── */}
          <TabsContent value="orders">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input 
                  placeholder="Order ID, Name or Phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 pl-14 pr-6 rounded-[1.5rem] border-none shadow-sm text-lg font-bold bg-white focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                 <Button 
                   variant={searchQuery === "Verification" ? "default" : "outline"}
                   onClick={() => setSearchQuery(searchQuery === "Verification" ? "" : "Verification")}
                   className="h-16 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                 >
                   <Filter className="w-4 h-4 mr-2" /> Pending Verification
                 </Button>
                 <Button 
                   variant={searchQuery === "Preparing" ? "default" : "outline"}
                   onClick={() => setSearchQuery(searchQuery === "Preparing" ? "" : "Preparing")}
                   className="h-16 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                 >
                   <ChefHat className="w-4 h-4 mr-2" /> To Cook
                 </Button>
                 <Button 
                   variant={searchQuery === "Ready" ? "default" : "outline"}
                   onClick={() => setSearchQuery(searchQuery === "Ready" ? "" : "Ready")}
                   className="h-16 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                 >
                   <KeyRound className="w-4 h-4 mr-2" /> To Deliver
                 </Button>
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center shadow-sm border border-gray-100 mt-4">
                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-16 h-16 text-gray-200" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">No live orders</h3>
                <p className="text-gray-400 font-medium text-lg">Your dashboard is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedOrders).map(([slot, slotOrders]) => (
                  <div key={slot} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h3 className={cn(
                        "font-black text-2xl p-4 rounded-3xl shadow-sm border flex items-center gap-4 transition-all duration-500",
                        isSlotUrgent(slot) ? "bg-primary text-white border-primary animate-pulse" : "bg-white text-gray-900 border-gray-100"
                      )}>
                        <Clock className={cn("h-6 w-6", isSlotUrgent(slot) ? "text-white" : "text-primary")} /> {slot}
                        <span className={cn("text-xs px-3 py-1 rounded-full uppercase tracking-widest", isSlotUrgent(slot) ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400")}>
                          {slotOrders.length} orders
                        </span>
                      </h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {slotOrders.map((o) => (
                        <div key={o.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-xl transition-all duration-300">
                          {/* Order Header */}
                          <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-50">
                            <div>
                              <span className="bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-widest mb-3 inline-block">
                                #{o.id}
                              </span>
                              <h4 className="font-black text-xl text-gray-900 mb-1">{o.user_name || "Guest"}</h4>
                              <p className="text-sm font-bold text-gray-400">{o.user_contact}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-black text-2xl text-gray-900">₹{o.total_price}</p>
                              {o.payment_status === "paid" ? (
                                <span className="text-[10px] font-black text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full uppercase tracking-widest inline-block mt-2">
                                  Paid
                                </span>
                              ) : o.payment_status === "verification_pending" ? (
                                <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-widest inline-block mt-2">
                                  Verifying
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full uppercase tracking-widest inline-block mt-2">
                                  Unpaid
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="flex-1 space-y-2 mb-6">
                            {o.items.map((i) => (
                              <div key={i.id} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-700">
                                  <span className="text-gray-300 mr-2">{i.quantity}x</span>
                                  {i.item?.name || `Item #${i.item_id}`}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Action Center */}
                          <div className="space-y-4">
                            {/* Payment Verification Flow */}
                            {o.payment_status === "verification_pending" && (
                              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Verify Payment
                                  </p>
                                  {o.payment_screenshot && (
                                    <a 
                                      href={o.payment_screenshot.startsWith("http") ? o.payment_screenshot : `${window.location.origin}${o.payment_screenshot}`} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-[10px] font-black text-primary underline flex items-center gap-1 hover:text-primary/80 transition-colors"
                                    >
                                      <ImageIcon className="w-3 h-3" /> View Screenshot
                                    </a>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => markPaid(o.id)}
                                    className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl text-sm"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => updateStatus(o.id, "Cancelled")}
                                    variant="outline"
                                    className="flex-1 h-12 border-red-200 text-red-500 hover:bg-red-50 font-black rounded-xl text-sm"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Standard Status Updates */}
                            {o.status === "Preparing" && (
                              <Button
                                onClick={() => updateStatus(o.id, "Ready")}
                                className="w-full h-14 text-base font-black bg-blue-500 hover:bg-blue-600 rounded-2xl shadow-lg transition-all active:scale-95"
                              >
                                <ShoppingBag className="w-5 h-5 mr-2" /> MARK AS READY
                              </Button>
                            )}

                            {o.status === "Ready" && (
                              <div className="bg-blue-50 border-2 border-blue-100 rounded-[1.5rem] p-5">
                                <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <KeyRound className="w-4 h-4" /> Enter Delivery OTP
                                </p>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="0000"
                                    maxLength={4}
                                    value={otpInputs[o.id] || ""}
                                    onChange={(e) =>
                                      setOtpInputs((prev) => ({
                                        ...prev,
                                        [o.id]: e.target.value.replace(/[^0-9]/g, ""),
                                      }))
                                    }
                                    className="flex-1 h-14 text-center text-2xl font-black bg-white border-2 border-blue-200 rounded-xl"
                                  />
                                  <Button
                                    onClick={() => verifyOTP(o.id)}
                                    className="h-14 px-6 text-base font-black bg-primary rounded-xl shadow-lg"
                                  >
                                    GO
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => { if(confirm("Bypass OTP?")) updateStatus(o.id, "Completed"); }}
                                  className="w-full mt-4 text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest"
                                >
                                  Bypass Verification
                                </Button>
                              </div>
                            )}

                            {/* Initial Status Action */}
                            {o.status === "Pending Payment" && (
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => markPaid(o.id)}
                                  className="flex-1 h-14 text-sm font-black bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all shadow-lg"
                                >
                                  MARK PAID
                                </Button>
                                <Button
                                  onClick={() => updateStatus(o.id, "Cancelled")}
                                  variant="outline"
                                  className="h-14 px-6 border-red-200 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                >
                                  <XCircle className="w-6 h-6" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── INVENTORY TAB ─── */}
          <TabsContent value="menu">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 mt-8">
              {menu.map((m) => (
                <div key={m.id} className={cn("bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 flex flex-col gap-5 transition-all hover:shadow-2xl hover:scale-[1.02] duration-500", !m.is_active && "opacity-60 grayscale-[0.5]")}>
                  <div className="w-full h-48 rounded-[1.5rem] overflow-hidden relative group">
                    <img src={m.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop"} alt={m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-3 right-3">
                       <Button onClick={() => { setEditing(m); setOpen(true); }} variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-xl bg-white/90 backdrop-blur-sm border-none hover:bg-white">
                         <Pencil className="w-4 h-4 text-gray-900" />
                       </Button>
                    </div>
                    {m.veg_flag !== undefined && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border-none z-10">
                         <div className={cn("h-4 w-4 border-2 rounded-sm flex items-center justify-center", m.veg_flag ? "border-green-600" : "border-red-600")}>
                           <div className={cn("h-1.5 w-1.5 rounded-full", m.veg_flag ? "bg-green-600" : "bg-red-600")} />
                         </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                       {m.is_trending && (
                         <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">Trending</span>
                       )}
                       {m.is_best && (
                         <span className="bg-yellow-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg">Bestseller</span>
                       )}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-xl text-gray-900 leading-tight">{m.name}</h4>
                       <p className="font-black text-2xl text-primary">₹{m.price}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{m.category}</p>
                    
                    <div className="flex items-center justify-between mt-auto bg-gray-50 p-3 rounded-2xl border border-gray-100">
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                         <span className={cn("text-lg font-black", m.available_quantity > 0 ? "text-green-600" : "text-red-600")}>
                           {m.available_quantity} items
                         </span>
                       </div>
                       
                        <div className="flex gap-2">
                          {m.available_quantity > 0 ? (
                            <Button 
                              onClick={() => { setEditing({ ...m, available_quantity: 0 }); save(); }} 
                              variant="ghost" 
                              className="h-12 flex-1 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-black text-xs uppercase tracking-widest"
                            >
                              <Ban className="w-4 h-4 mr-2" /> SOLD OUT
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => { setEditing({ ...m, available_quantity: 50 }); save(); }} 
                              variant="ghost" 
                              className="h-12 flex-1 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all font-black text-xs uppercase tracking-widest"
                            >
                              <Plus className="w-4 h-4 mr-2" /> RESTOCK (50)
                            </Button>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── SLOTS TAB ─── */}
          <TabsContent value="slots">
            <div className="max-w-4xl mx-auto mt-8 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Pickup Slot
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const lunchTimes = ["12:00 PM", "12:05 PM", "12:10 PM", "12:15 PM", "12:20 PM", "12:25 PM", "12:30 PM"];
                        for (const t of lunchTimes) {
                          try { await slotsApi.createSlot({ slot_time: t, max_orders: 25 }); } catch {}
                        }
                        toast.success("Lunch slots added");
                        refresh();
                      }}
                      className="text-[10px] font-black uppercase tracking-widest border-blue-100 text-blue-600 hover:bg-blue-50"
                    >
                      + LUNCH PRESET
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const breakTimes = ["10:30 AM", "10:35 AM", "10:40 AM", "10:45 AM"];
                        for (const t of breakTimes) {
                          try { await slotsApi.createSlot({ slot_time: t, max_orders: 25 }); } catch {}
                        }
                        toast.success("Break slots added");
                        refresh();
                      }}
                      className="text-[10px] font-black uppercase tracking-widest border-orange-100 text-orange-600 hover:bg-orange-50"
                    >
                      + BREAK PRESET
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input 
                      placeholder="e.g. 10:30 AM" 
                      value={newSlot.slot_time} 
                      onChange={(e) => setNewSlot({...newSlot, slot_time: e.target.value})}
                      className="h-14 rounded-xl font-bold"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <Input 
                      type="number" 
                      placeholder="Max Orders" 
                      value={newSlot.max_orders}
                      onChange={(e) => setNewSlot({...newSlot, max_orders: +e.target.value})}
                      className="h-14 rounded-xl font-bold"
                    />
                  </div>
                  <Button 
                    onClick={async () => {
                      if(!newSlot.slot_time) return toast.error("Time required");
                      await slotsApi.createSlot(newSlot);
                      toast.success("Slot added");
                      setNewSlot({ slot_time: "", max_orders: 25 });
                      refresh();
                    }}
                    className="h-14 px-8 font-black rounded-xl"
                  >
                    ADD SLOT
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {slots.sort((a,b) => a.slot_time.localeCompare(b.slot_time)).map(s => (
                  <div key={s.id} className={cn("bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between", !s.is_active && "bg-gray-50 opacity-70")}>
                    <div>
                      <p className="font-black text-lg">{s.slot_time}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.max_orders} max capacity</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={s.is_active} 
                        onCheckedChange={async () => {
                          await slotsApi.toggleSlot(s.id);
                          refresh();
                        }} 
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={async () => {
                          if(confirm("Delete slot?")) {
                            await slotsApi.deleteSlot(s.id);
                            refresh();
                          }
                        }}
                        className="text-red-400 hover:text-red-600 h-10 w-10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
