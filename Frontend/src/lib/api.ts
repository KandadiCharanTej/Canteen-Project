// Centralized API service. Swap implementations with real fetch() calls.
import { MenuItem, Order, TimeSlot, User } from "./types";

const LS = {
  user: "canteen_user",
  orders: "canteen_orders",
  menu: "canteen_menu",
};

// --- Seed data (replace with API) ---
const seedMenu: MenuItem[] = [
  { id: "1", name: "Veg Sandwich", price: 40, category: "Snacks", stock: 12, active: true, emoji: "🥪" },
  { id: "2", name: "Masala Dosa", price: 70, category: "South Indian", stock: 5, active: true, emoji: "🥞" },
  { id: "3", name: "Paneer Roll", price: 90, category: "Snacks", stock: 0, active: true, emoji: "🌯" },
  { id: "4", name: "Veg Biryani", price: 120, category: "Meals", stock: 20, active: true, emoji: "🍛" },
  { id: "5", name: "Cold Coffee", price: 60, category: "Beverages", stock: 30, active: true, emoji: "🥤" },
  { id: "6", name: "Samosa (2 pcs)", price: 30, category: "Snacks", stock: 50, active: true, emoji: "🥟" },
  { id: "7", name: "Chole Bhature", price: 90, category: "Meals", stock: 8, active: true, emoji: "🍲" },
  { id: "8", name: "Masala Chai", price: 20, category: "Beverages", stock: 100, active: true, emoji: "☕" },
  { id: "9", name: "Pasta Alfredo", price: 110, category: "Meals", stock: 6, active: true, emoji: "🍝" },
  { id: "10", name: "Chocolate Brownie", price: 55, category: "Desserts", stock: 4, active: true, emoji: "🍫" },
];

const seedSlots: TimeSlot[] = [
  { id: "s1", label: "12:30 PM", capacity: 30, booked: 12 },
  { id: "s2", label: "1:00 PM", capacity: 30, booked: 28 },
  { id: "s3", label: "1:30 PM", capacity: 30, booked: 30 },
  { id: "s4", label: "2:00 PM", capacity: 30, booked: 5 },
  { id: "s5", label: "4:30 PM", capacity: 20, booked: 8 },
  { id: "s6", label: "5:00 PM", capacity: 20, booked: 0 },
];

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

function readMenu(): MenuItem[] {
  const raw = localStorage.getItem(LS.menu);
  if (!raw) {
    localStorage.setItem(LS.menu, JSON.stringify(seedMenu));
    return seedMenu;
  }
  return JSON.parse(raw);
}

function writeMenu(menu: MenuItem[]) {
  localStorage.setItem(LS.menu, JSON.stringify(menu));
}

function readOrders(): Order[] {
  const raw = localStorage.getItem(LS.orders);
  return raw ? JSON.parse(raw) : [];
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(LS.orders, JSON.stringify(orders));
}

export const api = {
  // Auth
  async login(payload: { name: string; contact: string }): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      name: payload.name,
      contact: payload.contact,
      role: payload.contact === "admin@canteen" ? "admin" : "user",
    };
    localStorage.setItem(LS.user, JSON.stringify(user));
    return delay(user, 200);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(LS.user);
    return raw ? JSON.parse(raw) : null;
  },
  logout() {
    localStorage.removeItem(LS.user);
  },

  // Menu
  async getMenu(): Promise<MenuItem[]> {
    return delay(readMenu().filter((m) => m.active));
  },
  async getAllMenu(): Promise<MenuItem[]> {
    return delay(readMenu());
  },
  async upsertMenuItem(item: MenuItem): Promise<MenuItem> {
    const menu = readMenu();
    const idx = menu.findIndex((m) => m.id === item.id);
    if (idx >= 0) menu[idx] = item;
    else menu.push({ ...item, id: crypto.randomUUID() });
    writeMenu(menu);
    return delay(item, 150);
  },
  async deleteMenuItem(id: string): Promise<void> {
    writeMenu(readMenu().filter((m) => m.id !== id));
    return delay(undefined, 150);
  },

  // Slots
  async getSlots(): Promise<TimeSlot[]> {
    return delay(seedSlots);
  },

  // Orders
  async createOrder(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: "Placed",
    };
    const orders = readOrders();
    orders.unshift(newOrder);
    writeOrders(orders);
    return delay(newOrder, 400);
  },
  async getOrders(userId?: string): Promise<Order[]> {
    const all = readOrders();
    return delay(userId ? all.filter((o) => o.userId === userId) : all);
  },
  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
    const orders = readOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx < 0) return null;
    orders[idx].status = status;
    writeOrders(orders);
    return delay(orders[idx], 150);
  },
};
