import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { menuApi, ordersApi, slotsApi } from "@/lib/api";
import { MenuItem, Order, OrderStatus } from "@/lib/types";
import { Plus, Pencil, Trash2, CheckCircle2, KeyRound, ChefHat, ShoppingBag, Search, Ban, Clock, Volume2, VolumeX, Filter, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const blank: Partial<MenuItem> = {
  name: "", price: 0, category: "Snacks", available_quantity: 0, is_active: true, veg_flag: true, image_url: ""
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

  const { data: menu = [] } = useQuery({ queryKey: ["admin-menu"], queryFn: () => menuApi.getAllMenu(), refetchInterval: 5000 });
  const { data: slots = [] } = useQuery({ queryKey: ["admin-slots"], queryFn: () => slotsApi.getSlots(), refetchInterval: 10000 });
  const { data: orders = [] } = useQuery({ queryKey: ["admin-orders"], queryFn: () => ordersApi.getOrders(), refetchInterval: 3000 });

  useEffect(() => {
    const activeNow = orders.filter(x => x.status !== "Completed").length;
    if (activeNow > prevOrderCountRef.current) playNotification();
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
    return o.id.toString().includes(q) || o.user_name?.toLowerCase().includes(q) || o.user_contact?.includes(q) || o.status.toLowerCase().includes(q);
  });
  
  const groupedOrders = activeOrders.reduce((acc, order) => {
    acc[order.time_slot] = acc[order.time_slot] || [];
    acc[order.time_slot].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const save = async () => {
    if (!editing?.name?.trim()) return toast.error("Name required");
    setSaving(true);
    try {
      if (editing.id) await menuApi.updateItem(editing.id, editing);
      else await menuApi.createItem(editing as any);
      toast.success("Item saved");
      setOpen(false); setEditing(null); refresh();
    } catch (err: any) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: number, status: OrderStatus) => {
    try { await ordersApi.updateStatus(id, status); toast.success(`Order ${status}`); refresh(); } 
    catch { toast.error("Failed to update"); }
  };

  const markPaid = async (id: number) => {
    try { await ordersApi.updatePayment(id, "paid"); toast.success("Paid"); refresh(); } 
    catch { toast.error("Failed to update"); }
  };

  const verifyOTP = async (orderId: number) => {
    const otp = otpInputs[orderId];
    if (!otp || otp.length !== 4) return toast.error("Enter 4-digit OTP");
    try {
      await ordersApi.verifyOTP(orderId, otp);
      toast.success("Order completed.");
      setOtpInputs(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      refresh();
    } catch { toast.error("Invalid OTP"); }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12">
      <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <h1 className="text-[18px] font-black text-gray-900 tracking-tight">Admin Console</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 text-[12px] font-bold">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <div className="px-3 py-4 max-w-5xl mx-auto">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="flex gap-1 w-full bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
            <TabsTrigger value="orders" className="flex-1 text-[12px] font-bold rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Active Orders</TabsTrigger>
            <TabsTrigger value="menu" className="flex-1 text-[12px] font-bold rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Food Items</TabsTrigger>
            <TabsTrigger value="slots" className="flex-1 text-[12px] font-bold rounded-lg py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Timings</TabsTrigger>
          </TabsList>
            
          <TabsContent value="menu" className="mt-0 outline-none">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-[16px] font-black text-gray-900">Manage Food</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditing({ ...blank })} className="h-9 px-4 text-[12px] font-bold rounded-lg bg-gray-900">
                      <Plus className="w-4 h-4 mr-1" /> Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl p-6 sm:max-w-md border-gray-100 shadow-xl">
                    <DialogHeader><DialogTitle className="text-[18px] font-black">{editing?.id ? "Edit Dish" : "Create Dish"}</DialogTitle></DialogHeader>
                    {editing && (
                      <div className="space-y-4 mt-2">
                        <div>
                          <Label className="text-[11px] font-bold uppercase text-gray-500">Dish Name</Label>
                          <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="h-10 text-[13px] font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-[11px] font-bold uppercase text-gray-500">Price (₹)</Label>
                            <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} className="h-10 text-[13px] font-medium" />
                          </div>
                          <div>
                            <Label className="text-[11px] font-bold uppercase text-gray-500">Stock Qty</Label>
                            <Input type="number" value={editing.available_quantity || 0} onChange={(e) => setEditing({ ...editing, available_quantity: +e.target.value })} className="h-10 text-[13px] font-medium" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[11px] font-bold uppercase text-gray-500">Category</Label>
                          <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="h-10 text-[13px] font-medium" />
                        </div>
                        <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                          <label className="flex items-center gap-2 text-[12px] font-bold"><Switch checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /> Active</label>
                          <label className="flex items-center gap-2 text-[12px] font-bold"><Switch checked={editing.veg_flag ?? true} onCheckedChange={(v) => setEditing({ ...editing, veg_flag: v })} /> Veg</label>
                        </div>
                      </div>
                    )}
                    <DialogFooter className="mt-6">
                      <Button onClick={save} disabled={saving} className="w-full h-10 text-[13px] font-bold rounded-lg">{saving ? "Saving..." : "Save Changes"}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
             </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
              {menu.map((m) => (
                <div key={m.id} className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3", !m.is_active && "opacity-50")}>
                  <div className="flex justify-between items-start">
                     <div>
                       <h4 className="font-bold text-[14px] text-gray-900">{m.name}</h4>
                       <p className="font-bold text-[13px] text-primary">₹{m.price}</p>
                     </div>
                     <button onClick={() => { setEditing(m); setOpen(true); }} className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-md"><Pencil className="w-3.5 h-3.5" /></button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                     <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-gray-400 uppercase">Stock</span>
                       <span className={cn("text-[13px] font-black", m.available_quantity > 0 ? "text-green-600" : "text-red-600")}>{m.available_quantity}</span>
                     </div>
                     
                     {m.available_quantity > 0 ? (
                        <button onClick={() => { setEditing({ ...m, available_quantity: 0 }); save(); }} className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 font-bold text-[10px] uppercase">Sold Out</button>
                      ) : (
                        <button onClick={() => { setEditing({ ...m, available_quantity: 50 }); save(); }} className="px-3 py-1.5 rounded-md bg-green-50 text-green-600 font-bold text-[10px] uppercase">Restock</button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── ORDERS TAB ─── */}
          <TabsContent value="orders">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setSearchQuery("")} className={cn("px-4 py-2 rounded-lg font-bold text-[12px] whitespace-nowrap", !searchQuery ? "bg-gray-900 text-white" : "bg-white border border-gray-200")}>All</button>
              <button onClick={() => setSearchQuery("verification_pending")} className={cn("px-4 py-2 rounded-lg font-bold text-[12px] whitespace-nowrap flex items-center gap-1", searchQuery === "verification_pending" ? "bg-blue-600 text-white" : "bg-white border border-gray-200")}><Filter className="w-3.5 h-3.5" /> Verify</button>
              <button onClick={() => setSearchQuery("preparing")} className={cn("px-4 py-2 rounded-lg font-bold text-[12px] whitespace-nowrap flex items-center gap-1", searchQuery === "preparing" ? "bg-orange-600 text-white" : "bg-white border border-gray-200")}><ChefHat className="w-3.5 h-3.5" /> Prep</button>
              <button onClick={() => setSearchQuery("ready")} className={cn("px-4 py-2 rounded-lg font-bold text-[12px] whitespace-nowrap flex items-center gap-1", searchQuery === "ready" ? "bg-green-600 text-white" : "bg-white border border-gray-200")}><KeyRound className="w-3.5 h-3.5" /> Delivery</button>
            </div>

            {activeOrders.length === 0 ? (
              <p className="text-[13px] text-gray-500 font-medium text-center py-10 bg-white rounded-xl border border-gray-100">No active orders</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedOrders).map(([slot, slotOrders]) => (
                  <div key={slot} className="space-y-3">
                    <h3 className="font-black text-[15px] bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 flex justify-between">
                      {slot} <span className="text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{slotOrders.length} orders</span>
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {slotOrders.map((o) => (
                        <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                          <div className="p-3.5 flex justify-between items-start bg-gray-50/50">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-[14px] text-gray-900 truncate">{o.user_name || "Guest"}</h4>
                              <p className="text-[11px] font-bold text-gray-400 mt-0.5">#{o.id} • {o.user_contact}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-black text-[14px] text-primary leading-tight">₹{o.total_price}</p>
                              <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1.5 inline-block border", 
                                o.payment_status === "paid" ? "bg-green-50 text-green-700 border-green-100" : 
                                o.payment_status === "verification_pending" ? "bg-blue-50 text-blue-700 border-blue-100 animate-pulse" : 
                                "bg-red-50 text-red-700 border-red-100")}>
                                {o.payment_status === "verification_pending" ? "Action Req" : o.payment_status}
                              </span>
                            </div>
                          </div>
 
                          <div className="p-3.5 flex-1">
                            <div className="space-y-1 mb-3">
                              {o.items.map((i) => (
                                <div key={i.id} className="flex justify-between text-[12px] font-medium text-gray-700">
                                  <span>{i.quantity}x {i.item?.name}</span>
                                </div>
                              ))}
                            </div>
 
                            {o.special_instructions && (
                              <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 mb-3">
                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-tighter mb-0.5">Note from student:</p>
                                <p className="text-[11px] font-bold text-amber-700 leading-tight italic">"{o.special_instructions}"</p>
                              </div>
                            )}
 
                            <div className="space-y-2">
                              {o.payment_status === "verification_pending" && (
                                <Button onClick={() => markPaid(o.id)} className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg text-[11px] uppercase tracking-wider">Confirm Payment</Button>
                              )}
 
                              {o.status === "Pending Payment" && o.payment_status === "paid" && (
                                 <Button onClick={() => updateStatus(o.id, "Preparing")} className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-[11px] uppercase tracking-wider">Start Prep</Button>
                              )}
 
                              {o.status === "Preparing" && (
                                <Button onClick={() => updateStatus(o.id, "Ready")} className="w-full h-9 bg-green-600 hover:bg-green-700 text-white font-black rounded-lg text-[11px] uppercase tracking-wider">Mark Ready</Button>
                              )}
 
                              {o.status === "Ready" && (
                                <div className="flex gap-2">
                                  <Input 
                                    maxLength={4} 
                                    value={otpInputs[o.id] || ""} 
                                    onChange={(e) => setOtpInputs(prev => ({...prev, [o.id]: e.target.value.replace(/[^0-9]/g, "")}))} 
                                    className="h-9 text-center text-[15px] font-black rounded-lg w-20 bg-gray-50 border-gray-200" 
                                    placeholder="OTP" 
                                  />
                                  <Button onClick={() => verifyOTP(o.id)} className="flex-1 h-9 text-[11px] font-black rounded-lg bg-gray-900 text-white uppercase tracking-wider">Complete</Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── SLOTS TAB ─── */}
          <TabsContent value="slots">
            <div className="max-w-2xl mx-auto mt-4 space-y-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-end gap-3">
                <div className="flex-1">
                  <Label className="text-[11px] font-bold uppercase text-gray-500">Time (e.g. 10:30 AM)</Label>
                  <Input value={newSlot.slot_time} onChange={(e) => setNewSlot({...newSlot, slot_time: e.target.value})} className="h-10 text-[13px] font-medium" />
                </div>
                <div className="w-24">
                  <Label className="text-[11px] font-bold uppercase text-gray-500">Cap</Label>
                  <Input type="number" value={newSlot.max_orders} onChange={(e) => setNewSlot({...newSlot, max_orders: +e.target.value})} className="h-10 text-[13px] font-medium" />
                </div>
                <Button onClick={async () => { if(newSlot.slot_time){ await slotsApi.createSlot(newSlot); refresh(); setNewSlot({slot_time:"",max_orders:25}) } }} className="h-10 px-4 text-[12px] font-bold rounded-lg">Add</Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.sort((a,b) => a.slot_time.localeCompare(b.slot_time)).map(s => (
                  <div key={s.id} className={cn("bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between", !s.is_active && "bg-gray-50 opacity-50")}>
                    <div>
                      <p className="font-bold text-[14px]">{s.slot_time}</p>
                      <p className="text-[10px] font-bold text-gray-400">Cap: {s.max_orders}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={s.is_active} onCheckedChange={async () => { await slotsApi.toggleSlot(s.id); refresh(); }} />
                      <button onClick={async () => { if(confirm("Delete?")) { await slotsApi.deleteSlot(s.id); refresh(); } }} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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
