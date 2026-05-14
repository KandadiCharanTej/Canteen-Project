import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  ChevronDown,
  Receipt,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";
import { AppShell, VegBadge } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { pickupSlots } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, remove, total, user } = useStore();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("12:40 PM");
  const [instructions, setInstructions] = useState("");

  const fee = cart.length ? 5 : 0;
  const grand = total + fee;

  const checkout = () => {
    if (!cart.length) return;
    if (!user) return navigate({ to: "/login", search: { next: "/cart" } });
    navigate({ to: "/payment", search: { pickup, instructions } });
  };

  return (
    <AppShell>
      <div className="space-y-20 sm:space-y-32">
        <header className="flex flex-col xl:flex-row items-center justify-between gap-12 sm:gap-20">
          <div className="space-y-4 text-center xl:text-left">
            <h1 className="text-5xl sm:text-9xl font-black tracking-tighter leading-none">Your Tray</h1>
            <p className="text-xl sm:text-4xl text-muted-foreground font-bold opacity-60 flex items-center justify-center xl:justify-start gap-4">
              <Sparkles className="h-8 w-8 text-primary" /> Review items and choose pickup.
            </p>
          </div>
          <div className="px-12 py-6 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 text-primary text-[16px] sm:text-[20px] font-black uppercase tracking-widest shadow-xl">
            {cart.length} Selections
          </div>
        </header>

        {!cart.length ? (
          <div className="py-60 flex flex-col items-center text-center px-6 bg-card/40 rounded-[6rem] border-2 border-dashed border-border/60 backdrop-blur-xl space-y-12">
            <div className="h-48 w-48 rounded-[4.5rem] bg-muted/40 flex items-center justify-center shadow-inner">
              <ShoppingBag className="h-24 w-24 text-muted-foreground/30" />
            </div>
            <div className="space-y-6">
              <h2 className="text-5xl sm:text-7xl font-black tracking-tighter">Your tray is empty</h2>
              <p className="text-2xl sm:text-3xl text-muted-foreground font-bold max-w-xl mx-auto opacity-60 leading-relaxed">
                Start adding some delicious campus favorites to begin your smart order.
              </p>
            </div>
            <Link
              to="/"
              className="h-24 px-20 rounded-[3rem] bg-primary text-white text-2xl font-black shadow-3xl shadow-primary/30 flex items-center gap-6 hover:scale-105 active:scale-95 transition-all"
            >
              Explore Menu <ArrowRight className="h-8 w-8" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 sm:gap-32 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-8">
                <AnimatePresence initial={false}>
                  {cart.map((it) => (
                    <motion.div
                      key={it.food.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex flex-col sm:flex-row items-center gap-10 bg-card/40 border-2 border-border/40 rounded-[4rem] p-10 sm:p-16 shadow-lg hover:shadow-3xl transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Receipt className="h-32 w-32" /></div>
                      
                      <div className="h-40 w-40 sm:h-56 sm:w-56 rounded-[3rem] overflow-hidden bg-muted shrink-0 shadow-2xl relative z-10">
                        <img
                          src={it.food.image}
                          alt={it.food.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-1000"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left relative z-10">
                        <div className="flex items-center justify-center sm:justify-start gap-6">
                          <VegBadge veg={it.food.veg} />
                          <p className="text-3xl sm:text-5xl font-black truncate leading-tight tracking-tighter">{it.food.name}</p>
                        </div>
                        <p className="text-3xl sm:text-5xl font-black text-primary leading-none">
                          ₹{it.food.price * it.qty} 
                          <span className="text-[14px] text-muted-foreground ml-6 font-black uppercase tracking-[0.4em] opacity-40">
                            Unit: ₹{it.food.price}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                        <div className="flex items-center bg-muted/60 rounded-[2.5rem] h-20 sm:h-24 p-4 border-2 border-border/20 shadow-inner">
                          <button
                            onClick={() => setQty(it.food.id, it.qty - 1)}
                            className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center hover:bg-background rounded-2xl transition-all active:scale-75 shadow-sm"
                          >
                            <Minus className="h-6 w-6 sm:h-8 sm:w-8" />
                          </button>
                          <span className="w-16 text-center text-3xl font-black tabular-nums">{it.qty}</span>
                          <button
                            onClick={() => setQty(it.food.id, it.qty + 1)}
                            className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center hover:bg-background rounded-2xl transition-all active:scale-75 shadow-sm"
                          >
                            <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.food.id)}
                          className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center text-muted-foreground/20 hover:text-destructive hover:bg-destructive/5 rounded-[2rem] transition-all active:scale-90"
                        >
                          <Trash2 className="h-8 w-8 sm:h-10 sm:w-10" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Instructions */}
              <div className="bg-card/40 border-2 border-border/40 rounded-[4.5rem] p-12 sm:p-24 space-y-12 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-6 px-4">
                   <Info className="h-10 w-10 text-primary/40" />
                   <h3 className="text-[16px] font-black tracking-[0.4em] uppercase text-muted-foreground/40">Instructions for Kitchen</h3>
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Extra spicy, no onions, allergies..."
                  className="w-full min-h-[250px] bg-muted/30 border-4 border-transparent focus:border-primary/40 focus:bg-background rounded-[3.5rem] p-12 text-2xl sm:text-3xl font-bold outline-none transition-all placeholder:text-muted-foreground/10 shadow-inner"
                />
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-5 space-y-12 sticky top-32">
              <div className="bg-card/40 border-4 border-primary/20 rounded-[5rem] p-12 sm:p-24 space-y-20 shadow-3xl shadow-primary/5 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 pointer-events-none"><Clock className="h-64 w-64" /></div>
                
                <div className="space-y-6 relative z-10">
                   <div className="flex items-center gap-6 text-primary mb-4">
                      <Clock className="h-12 w-12" />
                      <span className="text-[16px] font-black uppercase tracking-[0.6em] opacity-60">Estimated Pickup</span>
                   </div>
                   <h2 className="text-6xl sm:text-9xl font-black tracking-tighter leading-none">{pickup}</h2>
                </div>

                <div className="space-y-16 relative z-10">
                  <SlotGroup label="Morning" slots={pickupSlots.morning} pickup={pickup} setPickup={setPickup} />
                  <SlotGroup label="Lunch Peak" slots={pickupSlots.lunch} pickup={pickup} setPickup={setPickup} highlight />
                  <SlotGroup label="Afternoon" slots={pickupSlots.afternoon} pickup={pickup} setPickup={setPickup} />
                </div>

                <div className="pt-16 border-t-4 border-dashed border-border/40 space-y-12 relative z-10">
                   <div className="space-y-6">
                      <BillRow label="Cart Subtotal" value={`₹${total}`} />
                      <BillRow label="Campus OS Fee" value={`₹${fee}`} />
                   </div>
                   <div className="flex flex-col gap-10 pt-10">
                      <div className="space-y-4">
                         <p className="text-[16px] font-black uppercase tracking-[0.6em] text-muted-foreground/40 leading-none">Total Investment</p>
                         <p className="text-7xl sm:text-[10rem] font-black text-primary leading-none tracking-tighter">₹{grand}</p>
                      </div>
                      <button
                        onClick={checkout}
                        className="w-full h-28 sm:h-32 rounded-[3rem] bg-foreground text-background font-black text-3xl shadow-3xl shadow-black/20 flex items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all group"
                      >
                        Secure Checkout <ArrowRight className="h-10 w-10 group-hover:translate-x-4 transition-transform duration-500" />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function BillRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-2xl sm:text-3xl font-black text-muted-foreground/40 uppercase tracking-widest">{label}</span>
      <span className={cn("text-3xl sm:text-4xl font-black", bold ? "text-primary" : "text-foreground")}>{value}</span>
    </div>
  );
}

function SlotGroup({ label, slots, pickup, setPickup, highlight }: { label: string; slots: string[]; pickup: string; setPickup: (s: string) => void; highlight?: boolean }) {
  return (
    <div className="space-y-8">
      <p className={cn("text-[14px] font-black uppercase tracking-[0.6em]", highlight ? "text-primary" : "text-muted-foreground/40")}>{label}</p>
      <div className="flex flex-wrap gap-4">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPickup(s)}
            className={cn(
              "h-16 px-10 rounded-[1.75rem] text-[18px] sm:text-[20px] font-black border-4 transition-all duration-500",
              pickup === s
                ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-110"
                : "bg-muted/40 border-transparent hover:border-primary/40 text-muted-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
