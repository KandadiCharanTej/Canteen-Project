export type Role = "student" | "lecturer" | "admin";

export interface User {
  id: number;
  name: string;
  contact: string;
  role: Role;
  category: string;
  student_class?: string | null;
  profile_image?: string | null;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  veg_flag: boolean;
  available_quantity: number;
  image_url?: string | null;
  description?: string | null;
  is_active: boolean;
  is_best: boolean;
  date: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image_url?: string | null;
}

export interface TimeSlot {
  id: number;
  slot_time: string;
  max_orders: number;
  current_orders: number;
  is_active: boolean;
}

export type OrderStatus = "Pending Payment" | "Payment Verification" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentStatus = "pending" | "verification_pending" | "paid" | "failed";

export interface OrderItem {
  id: number;
  item_id: number;
  quantity: number;
  price_at_time: number;
  item: MenuItem;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  payment_screenshot?: string | null;
  time_slot: string;
  otp?: string | null;
  created_at: string;
  items: OrderItem[];
  user_name?: string | null;
  user_contact?: string | null;
}

export interface Profile {
  user: User;
  total_orders: number;
  total_spent: number;
  favorite_items: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
