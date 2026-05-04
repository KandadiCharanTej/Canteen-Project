import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { MenuItem, Order, OrderStatus } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const blank: MenuItem = { id: "", name: "", price: 0, category: "Snacks", stock: 0, active: true, emoji: "🍽️" };
const STATUSES: OrderStatus[] = ["Placed", "Preparing", "Ready", "Completed"];

export default function Admin() {
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = async () => {
    setMenu(await api.getAllMenu());
    setOrders(await api.getOrders());
  };

  useEffect(() => { refresh(); }, []);

  if (!user || user.role !== "admin") return <Navigate to="/" replace />;

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return toast.error("Name required");
    await api.upsertMenuItem(editing);
    toast.success("Item saved");
    setOpen(false);
    setEditing(null);
    refresh();
  };

  const toggleActive = async (item: MenuItem) => {
    await api.upsertMenuItem({ ...item, active: !item.active });
    refresh();
  };

  const remove = async (id: string) => {
    await api.deleteMenuItem(id);
    toast.success("Item deleted");
    refresh();
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    refresh();
  };

  return (
    <>
      <PageHeader title="Admin Dashboard" showLogout />
      <div className="max-w-4xl mx-auto px-4 py-4 safe-bottom">
        <Tabs defaultValue="menu">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <div className="flex justify-end mb-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditing({ ...blank })} className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editing?.id ? "Edit" : "Add"} Menu Item</DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                        <div>
                          <Label>Emoji</Label>
                          <Input value={editing.emoji ?? ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} maxLength={4} />
                        </div>
                        <div>
                          <Label>Name</Label>
                          <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={60} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Price</Label>
                          <Input type="number" min={0} value={editing.price} onChange={(e) => setEditing({ ...editing, price: +e.target.value })} />
                        </div>
                        <div>
                          <Label>Stock</Label>
                          <Input type="number" min={0} value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: +e.target.value })} />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} maxLength={30} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                        <Label>Active</Label>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={save} className="rounded-full">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menu.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.emoji} {m.name}</TableCell>
                      <TableCell>₹{m.price}</TableCell>
                      <TableCell>{m.stock}</TableCell>
                      <TableCell>
                        <Switch checked={m.active} onCheckedChange={() => toggleActive(m)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(m); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-3">
              {orders.length === 0 && <p className="text-center text-muted-foreground py-12">No orders yet</p>}
              {orders.map((o) => (
                <div key={o.id} className="bg-card rounded-2xl shadow-soft border border-border/50 p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <p className="font-semibold">{o.id} · {o.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()} · Pickup {o.slotLabel} · {o.paymentMethod}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">₹{o.total}</span>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className="w-44 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
