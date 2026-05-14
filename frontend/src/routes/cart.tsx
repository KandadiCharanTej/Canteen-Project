import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  ArrowRight,
  Info,
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
      <div className="space-y-8 sm:space-y-12">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Tray</h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Review items and choose pickup time.</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider border">
            {cart.length} Items
          </div>
        </header>

        {!cart.length ? (
          <div className="py-24 flex flex-col items-center text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Your tray is empty</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Add some delicious items from the menu to get started.</p>
            </div>
            <Link
              to="/"
              className="h-11 px-8 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              Explore Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {cart.map((it) => (
                    <motion.div
                      key={it.food.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4 bg-card border rounded-2xl p-3 sm:p-4 hover:shadow-md transition-all group"
                    >
                      <img
                        src={it.food.image}
                        alt={it.food.name}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <VegBadge veg={it.food.veg} />
                          <h3 className="font-bold truncate text-sm sm:text-base">{it.food.name}</h3>
                        </div>
                        <p className="text-sm font-bold text-primary mt-1">₹{it.food.price * it.qty}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-muted rounded-lg h-9 p-1 border">
                          <button
                            onClick={() => setQty(it.food.id, it.qty - 1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-background rounded-md transition-all"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{it.qty}</span>
                          <button
                            onClick={() => setQty(it.food.id, it.qty + 1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-background rounded-md transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.food.id)}
                          className="h-9 w-9 flex items-center justify-center text-muted-foreground/30 hover:text-destructive transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="bg-card border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                   <Info className="h-4 w-4" /> Cooking Instructions
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, no onions..."
                  className="w-full min-h-[100px] bg-muted/30 border rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-card border rounded-2xl p-6 space-y-8 sticky top-24">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Pickup Time</span>
                   </div>
                   <h2 className="text-2xl font-bold">{pickup}</h2>
                   <div className="space-y-4">
                     <SlotGroup label="Lunch" slots={pickupSlots.lunch} pickup={pickup} setPickup={setPickup} />
                     <SlotGroup label="Others" slots={[...pickupSlots.morning, ...pickupSlots.afternoon].slice(0, 6)} pickup={pickup} setPickup={setPickup} />
                   </div>
                </div>

                <div className="pt-6 border-t border-dashed space-y-4">
                   <div className="space-y-2">
                      <BillRow label="Subtotal" value={`₹${total}`} />
                      <BillRow label="Service Fee" value={`₹${fee}`} />
                   </div>
                   <div className="pt-4 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                         <p className="text-3xl font-bold text-primary">₹{grand}</p>
                      </div>
                      <button
                        onClick={checkout}
                        className="w-full h-12 rounded-xl bg-foreground text-background font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                      >
                        Checkout Now <ArrowRight className="h-4 w-4" />
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

function BillRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm font-medium">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function SlotGroup({ label, slots, pickup, setPickup }: { label: string; slots: string[]; pickup: string; setPickup: (s: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPickup(s)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-bold border transition-all",
              pickup === s
                ? "bg-primary text-white border-primary"
                : "bg-muted/50 border-transparent text-muted-foreground hover:border-primary/30",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
