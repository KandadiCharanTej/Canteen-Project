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
  const [pickup, setPickup] = useState("12:50 PM");
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
      <div className="space-y-8 md:space-y-12 max-w-6xl mx-auto">
        <header className="flex items-center justify-between border-b border-border/50 pb-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Checkout</h1>
          {cart.length > 0 && (
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest shadow-sm">
              {cart.length} items
            </div>
          )}
        </header>

        {!cart.length ? (
          <div className="py-32 flex flex-col items-center text-center space-y-6 bg-card border border-border/50 rounded-[3rem] shadow-sm">
            <div className="h-28 w-28 rounded-full bg-muted flex items-center justify-center shadow-inner">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-foreground">Your cart is empty</h2>
              <p className="text-lg text-muted-foreground font-medium max-w-sm">Looks like you haven't added anything to your cart yet.</p>
            </div>
            <Link
              to="/"
              className="mt-6 h-14 px-8 rounded-2xl bg-primary text-white text-base font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Browse Menu <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Col: Items & Instructions */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              <div className="bg-card border border-border/50 rounded-[2rem] p-6 md:p-8 shadow-md">
                <h2 className="text-xl font-bold border-b border-border/50 pb-4 mb-6 flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 text-primary" /> Order Items
                </h2>
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {cart.map((it) => (
                      <motion.div
                        key={it.food.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-5 md:gap-6 group"
                      >
                        <img
                          src={it.food.image}
                          alt={it.food.name}
                          className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover shrink-0 bg-muted shadow-sm"
                        />
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <VegBadge veg={it.food.veg} />
                                <h3 className="font-bold text-lg md:text-xl leading-tight text-foreground truncate">{it.food.name}</h3>
                              </div>
                              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{it.food.category}</p>
                            </div>
                            <p className="text-xl font-black text-foreground shrink-0">₹{it.food.price * it.qty}</p>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-4">
                            <div className="flex items-center bg-muted rounded-xl h-10 p-1 border shadow-sm">
                              <button
                                onClick={() => setQty(it.food.id, it.qty - 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-lg transition-all text-foreground"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center text-sm font-bold tabular-nums">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.food.id, it.qty + 1)}
                                className="h-8 w-8 flex items-center justify-center hover:bg-background rounded-lg transition-all text-foreground"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => remove(it.food.id)}
                              className="h-10 px-4 flex items-center gap-2 text-sm font-bold text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            >
                              <Trash2 className="h-4 w-4" /> <span className="hidden md:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-[2rem] p-6 md:p-8 shadow-md">
                <div className="flex items-center gap-3 text-lg font-bold text-foreground mb-4">
                   <Info className="h-6 w-6 text-primary" /> Cooking Instructions
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, no onions..."
                  className="w-full bg-muted/30 border-2 rounded-[1.5rem] p-6 text-lg outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32"
                />
              </div>
            </div>

            {/* Right Col: Summary */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-8">
              <div className="bg-card border border-border/50 rounded-[2.5rem] p-6 md:p-8 shadow-xl lg:sticky lg:top-32 flex flex-col gap-8">
                
                {/* Pickup Time */}
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-foreground font-bold">
                         <Clock className="h-6 w-6 text-primary" />
                         <span className="text-xl">Pickup Time</span>
                      </div>
                      <span className="text-sm font-black bg-primary text-white px-4 py-1.5 rounded-full shadow-md">{pickup}</span>
                   </div>
                   <div className="bg-muted/30 p-5 rounded-2xl border space-y-4">
                     <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Select Slot</p>
                     <div className="flex flex-wrap gap-2">
                       <SlotGroup slots={pickupSlots.lunch.slice(0, 4)} pickup={pickup} setPickup={setPickup} />
                       <SlotGroup slots={pickupSlots.afternoon.slice(0, 4)} pickup={pickup} setPickup={setPickup} />
                     </div>
                   </div>
                </div>

                {/* Bill */}
                <div className="space-y-5">
                   <h2 className="text-lg font-bold flex items-center gap-3 border-b border-border/50 pb-4">
                     <Receipt className="h-5 w-5 text-primary" /> Bill Details
                   </h2>
                   <div className="space-y-3">
                      <BillRow label="Item Total" value={`₹${total}`} />
                      <BillRow label="Platform Fee" value={`₹${fee}`} />
                   </div>
                   <div className="pt-5 border-t-2 border-dashed flex justify-between items-center">
                      <p className="text-xl font-bold text-foreground">To Pay</p>
                      <p className="text-3xl font-black text-foreground">₹{grand}</p>
                   </div>
                </div>

                <button
                  onClick={checkout}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Pay <ArrowRight className="h-6 w-6" />
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
    <div className="flex justify-between items-center text-base">
      <span className="text-muted-foreground font-semibold">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function SlotGroup({ slots, pickup, setPickup }: { slots: string[]; pickup: string; setPickup: (s: string) => void }) {
  return (
    <>
      {slots.map((s) => (
        <button
          key={s}
          onClick={() => setPickup(s)}
          className={cn(
            "h-10 px-4 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 shrink-0",
            pickup === s
              ? "bg-primary text-white border-primary shadow-md"
              : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {s}
        </button>
      ))}
    </>
  );
}
