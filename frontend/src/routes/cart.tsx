import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Clock,
  ArrowRight,
  Info,
  Receipt,
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
  const [pickup, setPickup] = useState(pickupSlots.lunch[0] ?? "12:30 PM");
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
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <header className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Checkout</h1>
          {cart.length > 0 && (
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
              {cart.length} items
            </div>
          )}
        </header>

        {!cart.length ? (
          <div className="py-20 flex flex-col items-center text-center space-y-5 bg-card border rounded-2xl shadow-sm">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <Link
              to="/"
              className="mt-4 h-11 px-6 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
            >
              Browse Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Col: Items & Instructions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card border rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-bold border-b pb-3 mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" /> Order Items
                </h2>
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
                          className="h-20 w-20 rounded-xl object-cover shrink-0 bg-muted border"
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <VegBadge veg={it.food.veg} />
                                <h3 className="font-bold text-base leading-tight text-foreground truncate">{it.food.name}</h3>
                              </div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{it.food.category}</p>
                            </div>
                            <p className="text-base font-bold text-foreground shrink-0">₹{it.food.price * it.qty}</p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center bg-muted rounded-lg h-8 p-1 border">
                              <button
                                onClick={() => setQty(it.food.id, it.qty - 1)}
                                className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-md transition-all text-foreground"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold tabular-nums">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.food.id, it.qty + 1)}
                                className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-md transition-all text-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(it.food.id)}
                              className="h-8 px-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-card border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-base font-bold text-foreground mb-3">
                   <Info className="h-4 w-4 text-primary" /> Cooking Instructions
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, no onions..."
                  className="w-full bg-muted/50 border rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
                />
              </div>
            </div>

            {/* Right Col: Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card border rounded-2xl p-5 shadow-sm lg:sticky lg:top-24 space-y-6">
                
                {/* Pickup Time */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground font-bold">
                         <Clock className="h-4 w-4 text-primary" />
                         <span className="text-base">Pickup Time</span>
                      </div>
                      <span className="text-xs font-bold bg-primary text-white px-3 py-1 rounded-md shadow-sm">{pickup}</span>
                   </div>
                   
                   <div className="bg-muted/30 p-4 rounded-xl border space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <span className="h-px flex-1 bg-border" /> Lunch Break <span className="h-px flex-1 bg-border" />
                     </p>
                     <div className="flex flex-wrap gap-2 justify-center">
                       <SlotGroup slots={pickupSlots.lunch} pickup={pickup} setPickup={setPickup} highlight={true} />
                     </div>

                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 pt-2">
                        <span className="h-px flex-1 bg-border" /> Regular Slots <span className="h-px flex-1 bg-border" />
                     </p>
                     <div className="flex flex-wrap gap-2 justify-center">
                       <SlotGroup slots={[...pickupSlots.morning, ...pickupSlots.afternoon]} pickup={pickup} setPickup={setPickup} />
                     </div>
                   </div>
                </div>

                {/* Bill */}
                <div className="space-y-4">
                   <h2 className="text-base font-bold flex items-center gap-2 border-b pb-3">
                     <Receipt className="h-4 w-4 text-primary" /> Bill Details
                   </h2>
                   <div className="space-y-2.5">
                      <BillRow label="Item Total" value={`₹${total}`} />
                      <BillRow label="Platform Fee" value={`₹${fee}`} />
                   </div>
                   <div className="pt-4 border-t flex justify-between items-center">
                      <p className="text-base font-bold text-foreground">To Pay</p>
                      <p className="text-2xl font-bold text-foreground">₹{grand}</p>
                   </div>
                </div>

                <button
                  onClick={checkout}
                  className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
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

function SlotGroup({ slots, pickup, setPickup, highlight }: { slots: string[]; pickup: string; setPickup: (s: string) => void, highlight?: boolean }) {
  return (
    <>
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => setPickup(s)}
          className={cn(
            "h-8 px-3 rounded-lg text-[11px] font-bold border transition-all active:scale-95 shrink-0",
            pickup === s
              ? "bg-primary text-white border-primary shadow-sm"
              : highlight 
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground",
          )}
        >
          {s}
        </button>
      ))}
    </>
  );
}
