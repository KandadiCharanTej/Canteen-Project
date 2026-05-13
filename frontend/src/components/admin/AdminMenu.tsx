import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuApi } from "@/services/api";
import { Menu } from "@/types";
import { Plus, Trash2, Edit2, Check, X, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export function AdminMenu() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "Snacks", price: 0, available_quantity: 50 });

  const { data: menu = [], isLoading } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: () => menuApi.getAllMenu(),
  });

  const createItem = useMutation({
    mutationFn: (data: any) => menuApi.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
      setIsAdding(false);
      setNewItem({ name: "", category: "Snacks", price: 0, available_quantity: 50 });
      toast.success("Item added");
    },
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => menuApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
      toast.success("Item deleted");
    },
  });

  if (isLoading) return <div className="animate-pulse space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
         <h3 className="text-[14px] font-black text-gray-900 uppercase tracking-widest">Menu Catalog</h3>
         <Button onClick={() => setIsAdding(true)} size="sm" className="rounded-xl font-bold h-9">
           <Plus className="h-4 w-4 mr-1.5" /> New Item
         </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-4 rounded-2xl border-2 border-primary/20 shadow-lg space-y-4 animate-in zoom-in-95">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Item Name</label>
              <Input 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                placeholder="Butter Dosa..."
                className="h-11 rounded-xl bg-gray-50 border-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Price (₹)</label>
              <Input 
                type="number"
                value={newItem.price} 
                onChange={e => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                className="h-11 rounded-xl bg-gray-50 border-none font-bold"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Stock</label>
              <Input 
                type="number"
                value={newItem.available_quantity} 
                onChange={e => setNewItem({...newItem, available_quantity: parseInt(e.target.value)})}
                className="h-11 rounded-xl bg-gray-50 border-none font-bold"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createItem.mutate(newItem)} className="flex-1 rounded-xl font-black uppercase tracking-wider h-11">
              Save Item
            </Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-11 text-gray-400 font-bold">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menu.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                 <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-black text-gray-900">{item.name}</p>
                <p className="text-[11px] font-bold text-gray-400">₹{item.price} • {item.category}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                 <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  if(confirm("Delete item?")) deleteItem.mutate(item.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                 <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


