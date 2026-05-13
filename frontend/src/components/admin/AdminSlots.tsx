import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { slotsApi } from "@/services/api";
import { TimeSlot } from "@/types";
import { Plus, Trash2, Power, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/utils/utils";

export function AdminSlots() {
  const queryClient = useQueryClient();
  const [newSlot, setNewSlot] = useState("");

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["admin-slots"],
    queryFn: () => slotsApi.getSlots(),
  });

  const createSlot = useMutation({
    mutationFn: (time: string) => slotsApi.createSlot({ slot_time: time, max_orders: 25 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      setNewSlot("");
      toast.success("Slot added");
    },
  });

  const toggleSlot = useMutation({
    mutationFn: (id: number) => slotsApi.toggleSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
    },
  });

  const deleteSlot = useMutation({
    mutationFn: (id: number) => slotsApi.deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-slots"] });
      toast.success("Slot deleted");
    },
  });

  if (isLoading) return <div className="space-y-2">
    {[1, 2].map(i => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />)}
  </div>;

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3">Add New Slot</h3>
        <div className="flex gap-2">
          <Input 
            value={newSlot}
            onChange={e => setNewSlot(e.target.value)}
            placeholder="e.g. 11:30 AM"
            className="h-11 rounded-xl bg-gray-50 border-none font-bold"
          />
          <Button onClick={() => createSlot.mutate(newSlot)} className="rounded-xl px-6 font-black h-11">
            ADD
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                s.is_active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400"
              )}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-[15px] font-black text-gray-900">{s.slot_time}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase">{s.current_orders}/{s.max_orders} Orders</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => toggleSlot.mutate(s.id)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  s.is_active ? "text-green-500 hover:bg-green-50" : "text-gray-300 hover:bg-gray-50"
                )}
              >
                 <Power className="h-4 w-4" />
              </button>
              <button 
                onClick={() => deleteSlot.mutate(s.id)}
                className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
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


