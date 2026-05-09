import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CartItem, MenuItem } from "@/lib/types";
import { toast } from "sonner";

interface CartCtx {
  items: CartItem[];
  add: (item: MenuItem) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartCtx | undefined>(undefined);
const LS_KEY = "canteen_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: MenuItem) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        toast.success(`Increased ${item.name} quantity`);
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, qty: Math.min(i.qty + 1, item.available_quantity) }
            : i
        );
      }
      toast.success(`Added ${item.name} to cart`);
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          image_url: item.image_url,
        },
      ];
    });
  };

  const remove = (id: number) => {
    setItems((prev) => {
      const item = prev.find(i => i.id === id);
      if (item) toast.info(`Removed ${item.name} from cart`);
      return prev.filter((i) => i.id !== id);
    });
  }

  const setQty = (id: number, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <CartContext.Provider
      value={{ items, add, remove, setQty, clear, count, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
