import { useEffect, useState, useCallback } from "react";
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
import { StatusBadge } from "@/components/StatusBadge";
import { menuApi, ordersApi } from "@/lib/api";
import { MenuItem, Order, OrderStatus } from "@/lib/types";
import { Plus, Pencil, Trash2, CheckCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Partial<MenuItem> | null>(null);
  const [open, setOpen] = useState(false);
  const [otpInputs, setOtpInputs] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [m, o] = await Promise.all([
        menuApi.getAllMenu(),
        ordersApi.getOrders(),
      ]);
      setMenu(m);
      setOrders(o);
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [refresh]);

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  // Group orders by time slot
  const groupedOrders = orders.reduce(
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

  // Calculate Stats
  const activeOrders = orders.filter(o => o.status === "Placed" || o.status === "Preparing").length;
  const todaysRevenue = orders.reduce((sum, o) => sum + (o.payment_status === "paid" ? o.total_price : 0), 0);
  const todaysOrders = orders.length;

  return (
    <>
      <PageHeader title="Admin Dashboard" showLogout />
      <div className="max-w-4xl mx-auto px-4 py-4 safe-bottom space-y-6">
        
        {/* Stats Grid from ADU Food Court */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-border shadow-soft">
            <h3 className="text-2xl font-black text-slate-900 mb-0.5">{todaysOrders}</h3>
            <p className="text-muted-foreground text-[13px] font-medium">Total Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border shadow-soft">
            <h3 className="text-2xl font-black text-success mb-0.5">₹{todaysRevenue}</h3>
            <p className="text-muted-foreground text-[13px] font-medium">Today's Revenue</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border shadow-soft">
            <h3 className="text-2xl font-black text-warning mb-0.5">{activeOrders}</h3>
            <p className="text-muted-foreground text-[13px] font-medium">Active Orders</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border shadow-soft">
            <h3 className="text-2xl font-black text-primary mb-0.5">{menu.length}</h3>
            <p className="text-muted-foreground text-[13px] font-medium">Menu Items</p>
          </div>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="orders" className="text-base">
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="menu" className="text-base">
              Menu ({menu.length})
            </TabsTrigger>
          </TabsList>

          {/* ─── ORDERS TAB ─── */}
          <TabsContent value="orders">
            <div className="space-y-6">
              {orders.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No orders yet
                </p>
              )}

              {Object.entries(groupedOrders).map(([slot, slotOrders]) => (
                <div key={slot} className="space-y-3">
                  <div className="flex justify-between items-center bg-accent/60 p-3 rounded-xl">
                    <h3 className="font-bold text-base">
                      ⏰ {slot} ({slotOrders.length} orders)
                    </h3>
                  </div>

                  {slotOrders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-card rounded-2xl shadow-soft border border-border/50 p-4"
                    >
                      {/* Order Header */}
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div>
                          <p className="font-bold text-base">
                            #{o.id} · {o.user_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {o.user_contact} ·{" "}
                            {new Date(o.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={o.status} />
                          <Badge
                            className={cn(
                              "text-[10px]",
                              o.payment_status === "paid"
                                ? "bg-success/15 text-success"
                                : "bg-warning/15 text-warning-foreground"
                            )}
                          >
                            {o.payment_status === "paid"
                              ? "Paid"
                              : "Pending"}
                          </Badge>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-sm text-muted-foreground mb-3 bg-muted/30 rounded-lg p-2.5">
                        {o.items.map((i) => (
                          <div key={i.id} className="flex justify-between">
                            <span>
                              {i.item?.name || `Item #${i.item_id}`} ×{" "}
                              {i.quantity}
                            </span>
                            <span className="font-medium">
                              ₹{i.price_at_time * i.quantity}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-border mt-1.5 pt-1.5 flex justify-between font-semibold text-foreground">
                          <span>Total</span>
                          <span>₹{o.total_price}</span>
                        </div>
                      </div>

                      {/* OTP Display (admin sees it) */}
                      {o.otp && o.status !== "Completed" && (
                        <div className="bg-accent/50 rounded-xl p-2.5 mb-3 flex items-center gap-2">
                          <KeyRound className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            OTP:{" "}
                            <strong className="tracking-widest text-primary">
                              {o.otp}
                            </strong>
                          </span>
                        </div>
                      )}

                      {/* Action Buttons - BIG + SIMPLE */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {o.payment_status !== "paid" && (
                          <Button
                            size="lg"
                            onClick={() => markPaid(o.id)}
                            className="flex-1 min-w-[120px] h-11 rounded-xl bg-success hover:bg-success/90 text-success-foreground font-bold text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Mark Paid
                          </Button>
                        )}

                        {o.status === "Placed" && (
                          <Button
                            size="lg"
                            onClick={() => updateStatus(o.id, "Preparing")}
                            className="flex-1 min-w-[120px] h-11 rounded-xl bg-warning hover:bg-warning/90 text-warning-foreground font-bold text-sm"
                          >
                            🍳 Preparing
                          </Button>
                        )}

                        {o.status === "Preparing" && (
                          <Button
                            size="lg"
                            onClick={() => updateStatus(o.id, "Ready")}
                            className="flex-1 min-w-[120px] h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm"
                          >
                            ✅ Ready
                          </Button>
                        )}

                        {o.status === "Ready" && (
                          <div className="w-full space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter 4-digit OTP"
                                maxLength={4}
                                value={otpInputs[o.id] || ""}
                                onChange={(e) =>
                                  setOtpInputs((prev) => ({
                                    ...prev,
                                    [o.id]: e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    ),
                                  }))
                                }
                                className="flex-1 h-11 text-center text-lg font-bold tracking-widest"
                              />
                              <Button
                                size="lg"
                                onClick={() => verifyOTP(o.id)}
                                className="h-11 px-6 rounded-xl font-bold text-sm"
                              >
                                Verify & Complete
                              </Button>
                            </div>
                            <Button
                              size="lg"
                              variant="outline"
                              onClick={() =>
                                updateStatus(o.id, "Completed")
                              }
                              className="w-full h-11 rounded-xl font-bold text-sm"
                            >
                              Complete Without OTP
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ─── MENU TAB ─── */}
          <TabsContent value="menu">
            <div className="flex justify-end mb-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setEditing({ ...blank })}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editing?.id ? "Edit" : "Add"} Menu Item
                    </DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editing.name || ""}
                          onChange={(e) =>
                            setEditing({ ...editing, name: e.target.value })
                          }
                          maxLength={60}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={editing.description || ""}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              description: e.target.value,
                            })
                          }
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={editing.image_url || ""}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              image_url: e.target.value,
                            })
                          }
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            min={0}
                            value={editing.price || 0}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                price: +e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            min={0}
                            value={editing.available_quantity || 0}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                available_quantity: +e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input
                            value={editing.category || ""}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                category: e.target.value,
                              })
                            }
                            maxLength={30}
                          />
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editing.is_active ?? true}
                            onCheckedChange={(v) =>
                              setEditing({ ...editing, is_active: v })
                            }
                          />
                          <Label>Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editing.veg_flag ?? true}
                            onCheckedChange={(v) =>
                              setEditing({ ...editing, veg_flag: v })
                            }
                          />
                          <Label>Veg</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editing.is_best ?? false}
                            onCheckedChange={(v) =>
                              setEditing({ ...editing, is_best: v })
                            }
                          />
                          <Label>Best Seller</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      onClick={save}
                      disabled={saving}
                      className="rounded-full"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {menu.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "bg-card rounded-xl shadow-soft border border-border/50 p-3 flex items-center gap-3",
                    !m.is_active && "opacity-50"
                  )}
                >
                  <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={
                        m.image_url ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                      }
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{m.price} · Stock: {m.available_quantity} ·{" "}
                      {m.category}
                    </p>
                  </div>
                  <Switch
                    checked={m.is_active}
                    onCheckedChange={() => toggleActive(m)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditing(m);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => remove(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
