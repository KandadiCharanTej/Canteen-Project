import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Clock, ChevronDown } from "lucide-react";
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
  const [openSlot, setOpenSlot] = useState(false);

  const fee = cart.length ? 5 : 0;
  const grand = total + fee;

  const checkout = () => {
    if (!cart.length) return;
    if (!user) return navigate({ to: "/login", search: { next: "/cart" } });
    navigate({ to: "/payment", search: { pickup, instructions } });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 pt-3">
        <h1 className="text-base font-semibold">
          Your Cart{" "}
          {cart.length > 0 && (
            <span className="text-muted-foreground font-normal">({cart.length})</span>
          )}
        </h1>

        {!cart.length ? (
          <div className="mt-12 flex flex-col items-center text-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-3">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Your cart is empty</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Add some delicious items to get started.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold items-center"
            >
              Browse menu
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {cart.map((it) => (
                  <motion.div
                    key={it.food.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-2.5"
                  >
                    <img
                      src={it.food.image}
                      alt={it.food.name}
                      className="h-14 w-14 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <VegBadge veg={it.food.veg} />
                        <p className="text-[13px] font-semibold truncate">{it.food.name}</p>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        ₹{it.food.price} × {it.qty} ={" "}
                        <span className="font-semibold text-foreground">
                          ₹{it.food.price * it.qty}
                        </span>
                      </p>
                    </div>
                    <div className="inline-flex items-center bg-primary text-primary-foreground rounded-lg h-8 text-[12px] font-semibold">
                      <button
                        onClick={() => setQty(it.food.id, it.qty - 1)}
                        className="h-8 w-8 grid place-items-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center">{it.qty}</span>
                      <button
                        onClick={() => setQty(it.food.id, it.qty + 1)}
                        className="h-8 w-8 grid place-items-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.food.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pickup time */}
            <div className="mt-4 bg-card border border-border rounded-xl">
              <button
                onClick={() => setOpenSlot((o) => !o)}
                className="w-full flex items-center justify-between px-3 h-12"
              >
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-primary" /> Pickup time
                </span>
                <span className="text-[13px] font-semibold text-primary inline-flex items-center gap-1">
                  {pickup}{" "}
                  <ChevronDown className={cn("h-4 w-4 transition", openSlot && "rotate-180")} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openSlot && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-3">
                      <SlotGroup
                        label="Morning · Snacks"
                        slots={pickupSlots.morning}
                        pickup={pickup}
                        setPickup={setPickup}
                      />
                      <SlotGroup
                        label="🍱 Lunch Hour (popular)"
                        slots={pickupSlots.lunch}
                        pickup={pickup}
                        setPickup={setPickup}
                        highlight
                      />
                      <SlotGroup
                        label="Afternoon · Snacks"
                        slots={pickupSlots.afternoon}
                        pickup={pickup}
                        setPickup={setPickup}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="mt-3 bg-card border border-border rounded-xl p-3">
              <label className="text-sm font-medium">
                Special Instructions{" "}
                <span className="text-muted-foreground font-normal text-[11px]">(optional)</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Less spicy, no onions, extra sauce…"
                className="mt-2 w-full min-h-[60px] resize-none bg-muted rounded-lg p-2.5 text-[13px] outline-none focus:ring-2 ring-primary/40 placeholder:text-muted-foreground"
              />
            </div>

            {/* Bill */}
            <div className="mt-3 bg-card border border-border rounded-xl p-3 text-[13px] space-y-1.5">
              <Row label="Item total" value={`₹${total}`} />
              <Row label="Convenience fee" value={`₹${fee}`} />
              <div className="border-t border-dashed border-border pt-1.5 flex justify-between font-semibold">
                <span>To pay</span>
                <span className="text-primary">₹{grand}</span>
              </div>
            </div>

            <div className="h-24" />
            {/* Sticky checkout */}
            <div className="fixed bottom-0 sm:bottom-0 left-0 right-0 z-30 sm:static sm:mt-3 sm:rounded-xl">
              <div className="mx-auto max-w-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] sm:pb-0 sm:px-0">
                <div className="bg-card border border-border shadow-[var(--shadow-pop)] rounded-2xl p-2.5 flex items-center gap-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground leading-none">Total</div>
                    <div className="text-base font-bold leading-tight">₹{grand}</div>
                  </div>
                  <button
                    onClick={checkout}
                    className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.99] transition"
                  >
                    Proceed to Pay →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  pickup,
  setPickup,
  highlight,
}: {
  label: string;
  slots: string[];
  pickup: string;
  setPickup: (s: string) => void;
  highlight?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "text-[10px] uppercase tracking-wider font-semibold mb-1.5",
          highlight ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-1.5 p-1.5 rounded-lg",
          highlight && "bg-primary/5 border border-primary/20",
        )}
      >
        {slots.map((s) => (
          <button
            key={s}
            onClick={() => setPickup(s)}
            className={cn(
              "h-7 px-2.5 rounded-md text-[11px] font-medium border transition",
              pickup === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/40",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
