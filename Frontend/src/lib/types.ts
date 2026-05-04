export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  contact: string;
  role: Role;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  active: boolean;
  emoji?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  emoji?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  capacity: number;
  booked: number;
}

export type OrderStatus = "Placed" | "Preparing" | "Ready" | "Completed";

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  slotLabel: string;
  paymentMethod: "Cash" | "UPI";
  status: OrderStatus;
  createdAt: string;
}
