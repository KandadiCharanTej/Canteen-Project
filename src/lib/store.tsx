import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Food } from "./data";

export type CartItem = { food: Food; qty: number };

export type User = {
  name: string;
  phone: string;
  role: "Student" | "Lecturer";
  department: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  pickupTime: string;
  instructions?: string;
  otp: string;
  status: "Payment Checking" | "Preparing" | "Ready" | "Completed";
  paid: boolean;
  createdAt: number;
  customerName: string;
  customerPhone: string;
};

type Ctx = {
  cart: CartItem[];
  add: (f: Food) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
  user: User | null;
  setUser: (u: User | null) => void;
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "otp" | "status">) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
};

const CartCtx = createContext<Ctx | null>(null);

const lsGet = <T,>(k: string, fb: T): T => {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
};
const lsSet = (k: string, v: unknown) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* empty */ }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(lsGet("qb_cart", []));
    setUserState(lsGet("qb_user", null));
    setOrders(lsGet("qb_orders", []));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) lsSet("qb_cart", cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) lsSet("qb_user", user); }, [user, hydrated]);
  useEffect(() => { if (hydrated) lsSet("qb_orders", orders); }, [orders, hydrated]);

  const add = (f: Food) =>
    setCart((c) => {
      const ex = c.find((i) => i.food.id === f.id);
      if (ex) return c.map((i) => (i.food.id === f.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { food: f, qty: 1 }];
    });
  const remove = (id: string) => setCart((c) => c.filter((i) => i.food.id !== id));
  const setQty = (id: string, q: number) =>
    setCart((c) => (q <= 0 ? c.filter((i) => i.food.id !== id) : c.map((i) => (i.food.id === id ? { ...i, qty: q } : i))));
  const clear = () => setCart([]);
  const total = cart.reduce((s, i) => s + i.food.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const setUser = (u: User | null) => setUserState(u);

  const placeOrder: Ctx["placeOrder"] = (o) => {
    const order: Order = {
      ...o,
      id: "QB" + Math.floor(100000 + Math.random() * 900000),
      otp: String(Math.floor(1000 + Math.random() * 9000)),
      status: "Payment Checking",
      createdAt: Date.now(),
    };
    setOrders((os) => [order, ...os]);
    return order;
  };
  const updateOrder = (id: string, patch: Partial<Order>) =>
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <CartCtx.Provider value={{ cart, add, remove, setQty, clear, total, count, user, setUser, orders, placeOrder, updateOrder }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useStore = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};
