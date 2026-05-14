import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Image as ImageIcon,
  X,
  Edit3,
  Trash2,
  ArrowLeft,
  MoreVertical,
  Search,
} from "lucide-react";
import { foods as seed, categories, type Food } from "@/lib/data";
import { VegBadge } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/foods")({
  component: AdminFoods,
});

function loadFoods(): Food[] {
  if (typeof window === "undefined") return seed;
  try {
    const v = localStorage.getItem("qb_admin_foods");
    return v ? JSON.parse(v) : seed;
  } catch {
    return seed;
  }
}

function AdminFoods() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>(seed);
  const [open, setOpen] = useState<null | { food?: Food }>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFoods(loadFoods());
  }, []);
  useEffect(() => {
    localStorage.setItem("qb_admin_foods", JSON.stringify(foods));
  }, [foods]);

  const save = (f: Food) => {
    setFoods((arr) =>
      arr.find((x) => x.id === f.id) ? arr.map((x) => (x.id === f.id ? f : x)) : [f, ...arr],
    );
    toast.success(open?.food ? "Item updated" : "Item added");
    setOpen(null);
  };

  const toggleStock = (id: string) =>
    setFoods((arr) => arr.map((f) => (f.id === id ? { ...f, inStock: !f.inStock } : f)));
  const remove = (id: string) => {
    setFoods((arr) => arr.filter((f) => f.id !== id));
    toast.success("Item removed");
  };

  const filtered = foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-8 py-12 sm:py-24 pb-40 space-y-16">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-12">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="p-6 rounded-[2rem] bg-muted/50 hover:bg-muted transition-all active:scale-90 shadow-sm"
          >
            <ArrowLeft className="h-10 w-10" />
          </button>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter">Menu Manager</h1>
            <p className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              {foods.length} Total Inventory Items
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen({})}
          className="h-20 px-12 rounded-[2rem] bg-foreground text-background font-black text-xl active:scale-95 transition-all shadow-3xl shadow-black/10 flex items-center gap-6"
        >
          <Plus className="h-8 w-8" /> New Item
        </button>
      </header>

      {/* Search & Stats Bar */}
      <div className="flex gap-4">
        <div className="flex-1 h-20 bg-card border-2 border-border/40 rounded-[2.5rem] flex items-center px-10 gap-6 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-inner">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the kitchen inventory..."
            className="flex-1 bg-transparent outline-none text-2xl font-bold placeholder:text-muted-foreground/10"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filtered.map((f) => (
          <motion.div
            key={f.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border-2 border-border/40 rounded-[3.5rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-10 group hover:shadow-3xl hover:shadow-primary/5 transition-all"
          >
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-[2.5rem] overflow-hidden bg-muted shrink-0 shadow-2xl">
              <img
                src={f.image}
                alt={f.name}
                className={cn("h-full w-full object-cover transition-transform group-hover:scale-110 duration-1000", !f.inStock && "grayscale opacity-40")}
              />
              <div className="absolute top-4 left-4 scale-150 origin-top-left">
                <VegBadge veg={f.veg} />
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <div className="text-3xl sm:text-4xl font-black tracking-tight group-hover:text-primary transition-colors">{f.name}</div>
              <div className="text-[16px] sm:text-[18px] font-black text-primary/60 uppercase tracking-[0.4em] mt-2 leading-none">
                ₹{f.price} · {f.category}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleStock(f.id)}
                className={cn(
                  "h-14 px-8 rounded-2xl text-[14px] font-black uppercase tracking-widest transition-all shadow-xl",
                  f.inStock ? "bg-green-100 text-green-700 shadow-green-600/5" : "bg-rose-100 text-rose-700 shadow-rose-600/5",
                )}
              >
                {f.inStock ? "Live" : "Sold Out"}
              </button>
              <button
                onClick={() => setOpen({ food: f })}
                className="h-16 w-16 flex items-center justify-center rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all shadow-sm active:scale-90"
              >
                <Edit3 className="h-7 w-7" />
              </button>
              <button
                onClick={() => remove(f.id)}
                className="h-16 w-16 flex items-center justify-center rounded-2xl bg-destructive/5 hover:bg-destructive/10 text-destructive transition-all shadow-sm active:scale-90"
              >
                <Trash2 className="h-7 w-7" />
              </button>
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

function FoodModal({
  food,
  onClose,
  onSave,
}: {
  food?: Food;
  onClose: () => void;
  onSave: (f: Food) => void;
}) {
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
    if (!name || !price) return toast.error("Required fields missing");
    onSave({
      id: food?.id ?? "f_" + Date.now(),
      name,
      price: Number(price),
      category,
      veg,
      emoji,
      image: image || `https://placehold.co/800x600/ff6b20/fff?text=${encodeURIComponent(name)}`,
      inStock,
      stockCount: food?.stockCount ?? 10,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/60 backdrop-blur-3xl p-8"
    >
      <motion.form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 100, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 100, scale: 0.9 }}
        className="bg-card w-full max-w-3xl rounded-[5rem] border-4 border-border/40 p-12 sm:p-20 shadow-[0_100px_200px_-50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] no-scrollbar space-y-12"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">{food ? "Edit Inventory" : "New Item"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-16 w-16 rounded-[2rem] bg-muted/50 flex items-center justify-center hover:bg-muted shadow-sm transition-all active:scale-90"
          >
            <X className="h-10 w-10" />
          </button>
        </div>

        <div className="space-y-10">
          <div className="relative h-64 sm:h-80 rounded-[4rem] border-4 border-dashed border-border/60 bg-muted/30 flex flex-col items-center justify-center overflow-hidden group shadow-inner">
            {image ? (
              <>
                <img src={image} className="h-full w-full object-cover" alt="" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/20" />
                <p className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
                  Upload Product Photo
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <AdminInput label="Item Name" value={name} onChange={setName} />
            <AdminInput
              label="Price (₹)"
              value={price}
              onChange={(v) => setPrice(v.replace(/\D/g, ""))}
            />
          </div>

          <div className="space-y-6">
            <p className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-4">
              Category Mapping
            </p>
            <div className="flex flex-wrap gap-4">
              {categories
                .filter((c) => c.id !== "all")
                .map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "h-16 px-10 rounded-[2rem] text-[18px] sm:text-[20px] font-black border-4 transition-all duration-500 shadow-sm",
                      category === c.id
                        ? "bg-primary text-white border-primary shadow-3xl shadow-primary/20 scale-110"
                        : "bg-muted/50 border-transparent hover:border-primary/40",
                    )}
                  >
                    <span className="text-3xl mr-4">{c.emoji}</span> {c.name}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 pt-4">
            <button
              type="button"
              onClick={() => setVeg(!veg)}
              className={cn(
                "h-20 rounded-[2.5rem] border-4 transition-all flex items-center justify-center gap-6 font-black text-2xl shadow-xl",
                veg
                  ? "bg-green-50 border-green-200 text-green-700 shadow-green-600/5"
                  : "bg-rose-50 border-rose-200 text-rose-700 shadow-rose-600/5",
              )}
            >
              <VegBadge veg={veg} /> {veg ? "Vegetarian" : "Non-Veg"}
            </button>
            <button
              type="button"
              onClick={() => setInStock(!inStock)}
              className={cn(
                "h-20 rounded-[2.5rem] border-4 transition-all flex items-center justify-center font-black text-2xl shadow-xl",
                inStock
                  ? "bg-green-50 border-green-200 text-green-700 shadow-green-600/5"
                  : "bg-rose-50 border-rose-200 text-rose-700 shadow-rose-600/5",
              )}
            >
              {inStock ? "Active Stock" : "Sold Out"}
            </button>
          </div>
        </div>

        <div className="mt-16 flex gap-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-24 rounded-[3rem] bg-muted text-muted-foreground font-black text-2xl hover:bg-muted/80 active:scale-95 transition-all shadow-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 h-24 rounded-[3rem] bg-primary text-white font-black text-2xl shadow-3xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Commit to Menu
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-4 flex-1">
      <p className="text-[14px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-4">
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full h-20 sm:h-24 bg-muted/50 border-4 border-transparent focus:border-primary/20 focus:bg-background rounded-[2.5rem] px-10 text-2xl sm:text-3xl font-black outline-none transition-all shadow-inner"
      />
    </div>
  );
}
