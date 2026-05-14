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
      <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        <header className="flex items-center justify-between border-b pb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Checkout</h1>
          {cart.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-muted text-xs font-semibold">
              {cart.length} items
            </div>
          )}
        </header>

        {!cart.length ? (
          <div className="py-20 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Your tray is empty</h2>
              <p className="text-sm text-muted-foreground">Add items from the menu to start a new order.</p>
            </div>
            <Link
              to="/"
              className="mt-2 h-10 px-6 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
            >
              Browse Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* Left Col: Items & Instructions */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="bg-card border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold border-b pb-3">Order Items</h2>
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {cart.map((it) => (
                      <motion.div
                        key={it.food.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex gap-4 group"
                      >
                        <img
                          src={it.food.image}
                          alt={it.food.name}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover shrink-0 bg-muted"
                        />
                        <div className="flex-1 min-w-0 flex flex-col py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <VegBadge veg={it.food.veg} />
                                <h3 className="font-bold text-sm sm:text-base leading-tight">{it.food.name}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground font-medium mt-0.5">₹{it.food.price}</p>
                            </div>
                            <p className="text-sm font-bold">₹{it.food.price * it.qty}</p>
                          </div>

                          <div className="mt-auto flex items-center gap-3">
                            <div className="flex items-center bg-muted rounded-lg h-8 p-1 border">
                              <button
                                onClick={() => setQty(it.food.id, it.qty - 1)}
                                className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-md transition-all"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold tabular-nums">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.food.id, it.qty + 1)}
                                className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-md transition-all"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(it.food.id)}
                              className="p-2 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                   <Info className="h-4 w-4" /> Cooking Instructions
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, no onions..."
                  className="w-full bg-muted/50 border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-none h-20"
                />
              </div>
            </div>

            {/* Right Col: Summary */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className="bg-card border rounded-2xl p-5 space-y-6 shadow-sm lg:sticky lg:top-24">
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                         <Clock className="h-4 w-4 text-primary" />
                         <span className="text-sm">Pickup Time</span>
                      </div>
                      <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">{pickup}</span>
                   </div>
                   <div className="space-y-3">
                     <SlotGroup slots={pickupSlots.lunch.slice(0, 4)} pickup={pickup} setPickup={setPickup} />
                     <SlotGroup slots={[...pickupSlots.morning, ...pickupSlots.afternoon].slice(0, 4)} pickup={pickup} setPickup={setPickup} />
                   </div>
                </div>

                <div className="pt-5 border-t space-y-3">
                   <h2 className="text-sm font-bold border-b pb-2">Bill Details</h2>
                   <div className="space-y-2">
                      <BillRow label="Item Total" value={`₹${total}`} />
                      <BillRow label="Platform Fee" value={`₹${fee}`} />
                   </div>
                   <div className="pt-3 border-t flex justify-between items-center">
                      <p className="text-sm font-bold text-foreground">To Pay</p>
                      <p className="text-lg font-bold">₹{grand}</p>
                   </div>
                </div>

                <button
                  onClick={checkout}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Pay <ArrowRight className="h-4 w-4" />
                </button>
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
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SlotGroup({ slots, pickup, setPickup }: { slots: string[]; pickup: string; setPickup: (s: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => setPickup(s)}
          className={cn(
            "h-8 px-3 rounded-lg text-xs font-semibold border transition-all",
            pickup === s
              ? "bg-primary text-white border-primary"
              : "bg-muted/30 border-border text-muted-foreground hover:border-primary/40",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
