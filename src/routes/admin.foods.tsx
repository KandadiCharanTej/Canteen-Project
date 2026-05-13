import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, X, Edit3, Trash2 } from "lucide-react";
import { foods as seed, categories, type Food } from "@/lib/data";
import { VegBadge } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/foods")({
  component: AdminFoods,
});

function loadFoods(): Food[] {
  if (typeof window === "undefined") return seed;
  try { const v = localStorage.getItem("qb_admin_foods"); return v ? JSON.parse(v) : seed; } catch { return seed; }
}

function AdminFoods() {
  const [foods, setFoods] = useState<Food[]>(seed);
  const [open, setOpen] = useState<null | { food?: Food }>(null);

  useEffect(() => { setFoods(loadFoods()); }, []);
  useEffect(() => { localStorage.setItem("qb_admin_foods", JSON.stringify(foods)); }, [foods]);

  const save = (f: Food) => {
    setFoods((arr) => arr.find((x) => x.id === f.id) ? arr.map((x) => (x.id === f.id ? f : x)) : [f, ...arr]);
    toast.success(open?.food ? "Item updated" : "Item added");
    setOpen(null);
  };

  const toggleStock = (id: string) => setFoods((arr) => arr.map((f) => (f.id === id ? { ...f, inStock: !f.inStock } : f)));
  const remove = (id: string) => { setFoods((arr) => arr.filter((f) => f.id !== id)); toast.success("Item removed"); };

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-semibold">Menu Items</h1>
          <p className="text-[11px] text-muted-foreground">{foods.length} items · tap any to edit</p>
        </div>
        <button onClick={() => setOpen({})} className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98]">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {foods.map((f) => (
          <motion.div key={f.id} layout
            className="bg-card border border-border rounded-xl p-2.5 flex gap-2.5">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
              <img src={f.image} alt={f.name} className={cn("h-full w-full object-cover", !f.inStock && "grayscale opacity-60")} />
              <div className="absolute top-1 left-1 bg-white/90 rounded p-0.5"><VegBadge veg={f.veg} /></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">{f.name}</div>
              <div className="text-[11px] text-muted-foreground">₹{f.price} · {f.category}</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <button onClick={() => toggleStock(f.id)}
                  className={cn("h-7 px-2 rounded-md text-[10px] font-semibold uppercase tracking-wider transition",
                    f.inStock ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                  {f.inStock ? "In stock" : "Sold out"}
                </button>
                <button onClick={() => setOpen({ food: f })} className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted text-muted-foreground"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(f.id)} className="h-7 w-7 grid place-items-center rounded-md hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && <FoodModal food={open.food} onClose={() => setOpen(null)} onSave={save} />}
      </AnimatePresence>
    </div>
  );
}

function FoodModal({ food, onClose, onSave }: { food?: Food; onClose: () => void; onSave: (f: Food) => void }) {
  const [name, setName] = useState(food?.name ?? "");
  const [price, setPrice] = useState(String(food?.price ?? ""));
  const [category, setCategory] = useState(food?.category ?? "snacks");
  const [veg, setVeg] = useState(food?.veg ?? true);
  const [image, setImage] = useState(food?.image ?? "");
  const [emoji, setEmoji] = useState(food?.emoji ?? "🍽️");
  const [inStock, setInStock] = useState(food?.inStock ?? true);

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return toast.error("Name & price required");
    onSave({
      id: food?.id ?? "f_" + Date.now(),
      name, price: Number(price), category, veg, emoji,
      image: image || `https://placehold.co/400x300/ff6b20/fff?text=${encodeURIComponent(name)}`,
      inStock,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/50 backdrop-blur-sm">
      <motion.form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl border border-border p-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">{food ? "Edit item" : "Add new item"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <div className="text-[11px] font-medium text-muted-foreground mb-1">Photo</div>
          <div className="relative h-36 rounded-xl border-2 border-dashed border-border bg-muted/40 grid place-items-center overflow-hidden">
            {image ? <img src={image} className="h-full w-full object-cover" alt="" /> : <div className="text-center text-muted-foreground"><ImageIcon className="h-6 w-6 mx-auto" /><div className="text-[11px] mt-1">Tap to upload</div></div>}
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </label>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <Input label="Emoji" value={emoji} onChange={setEmoji} />
          <Input label="Price ₹" value={price} onChange={(v) => setPrice(v.replace(/\D/g, ""))} colSpan={2} />
        </div>
        <Input label="Name" value={name} onChange={setName} className="mt-2" />

        <div className="mt-2">
          <div className="text-[11px] font-medium text-muted-foreground mb-1">Category</div>
          <div className="flex flex-wrap gap-1.5">
            {categories.filter((c) => c.id !== "all").map((c) => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                className={cn("h-8 px-2.5 rounded-lg text-[12px] font-medium border", category === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border")}>
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setVeg(!veg)}
            className={cn("h-11 rounded-xl border text-sm font-medium inline-flex items-center justify-center gap-2",
              veg ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive"
            )}>
            <VegBadge veg={veg} /> {veg ? "Veg" : "Non-Veg"}
          </button>
          <button type="button" onClick={() => setInStock(!inStock)}
            className={cn("h-11 rounded-xl border text-sm font-medium",
              inStock ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive"
            )}>
            {inStock ? "In stock" : "Sold out"}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-border font-semibold text-sm">Cancel</button>
          <button type="submit" className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">Save</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Input({ label, value, onChange, className, colSpan }: { label: string; value: string; onChange: (v: string) => void; className?: string; colSpan?: number }) {
  return (
    <label className={cn("block", className, colSpan === 2 && "col-span-2")}>
      <div className="text-[11px] font-medium text-muted-foreground mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-primary outline-none text-sm" />
    </label>
  );
}
