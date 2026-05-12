import axios from "axios";
import type {
  AuthResponse,
  MenuItem,
  Order,
  OrderStatus,
  Profile,
  TimeSlot,
  User,
} from "./types";

// ─────────── Axios Instance ───────────
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token to every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("canteen_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("canteen_token");
      localStorage.removeItem("canteen_user");
      // Don't redirect - let the UI handle showing login when needed
    }
    return Promise.reject(error);
  }
);

// ─────────── Auth API ───────────
export const authApi = {
  async login(contact: string, aurora_uid?: string): Promise<{
    access_token: string;
    user: User;
  }> {
    const res = await http.post<{
      access_token: string;
      user: User;
    }>("/auth/login", { contact, aurora_uid });
    
    localStorage.setItem("canteen_token", res.data.access_token);
    localStorage.setItem("canteen_user", JSON.stringify(res.data.user));
    return res.data;
  },

  async signup(data: {
    name: string;
    email?: string;
    contact: string;
    category?: string;
    student_class?: string;
    aurora_uid?: string;
  }): Promise<AuthResponse> {
    const res = await http.post<AuthResponse>("/auth/signup", data);
    localStorage.setItem("canteen_token", res.data.access_token);
    localStorage.setItem("canteen_user", JSON.stringify(res.data.user));
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await http.get<User>("/me");
    localStorage.setItem("canteen_user", JSON.stringify(res.data));
    return res.data;
  },

  async getProfile(): Promise<Profile> {
    const res = await http.get<Profile>("/profile");
    return res.data;
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem("canteen_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("canteen_token");
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem("canteen_token");
  },

  logout() {
    localStorage.removeItem("canteen_token");
    localStorage.removeItem("canteen_user");
  },
};

// ─────────── Menu API ───────────
export const menuApi = {
  async getMenu(): Promise<MenuItem[]> {
    const res = await http.get<MenuItem[]>("/menu");
    return res.data;
  },

  async getAllMenu(): Promise<MenuItem[]> {
    const res = await http.get<MenuItem[]>("/menu/all");
    return res.data;
  },

  async createItem(item: Omit<MenuItem, "id" | "date">): Promise<MenuItem> {
    const res = await http.post<MenuItem>("/menu", item);
    return res.data;
  },

  async updateItem(
    id: number,
    data: Partial<MenuItem>
  ): Promise<MenuItem> {
    const res = await http.put<MenuItem>(`/menu/${id}`, data);
    return res.data;
  },

  async deleteItem(id: number): Promise<void> {
    await http.delete(`/menu/${id}`);
  },
};

// ─────────── Slots API ───────────
export const slotsApi = {
  async getSlots(): Promise<TimeSlot[]> {
    const res = await http.get<TimeSlot[]>("/slots");
    return res.data;
  },

  async createSlot(data: { slot_time: string; max_orders: number }): Promise<TimeSlot> {
    const res = await http.post<TimeSlot>("/slots", data);
    return res.data;
  },

  async deleteSlot(id: number): Promise<void> {
    await http.delete(`/slots/${id}`);
  },

  async toggleSlot(id: number): Promise<{ is_active: boolean }> {
    const res = await http.put<{ is_active: boolean }>(`/slots/${id}/toggle`);
    return res.data;
  },
};

// ─────────── Orders API ───────────
export const ordersApi = {
  async createOrder(data: {
    time_slot: string;
    special_instructions?: string;
    items: { item_id: number; quantity: number }[];
  }): Promise<Order> {
    const res = await http.post<Order>("/orders", data);
    return res.data;
  },

  async getOrders(): Promise<Order[]> {
    const res = await http.get<Order[]>("/orders");
    return res.data;
  },

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const res = await http.put<Order>(`/orders/${orderId}/status`, { status });
    return res.data;
  },

  async updatePayment(
    orderId: number,
    payment_status: string,
    upi_ref?: string
  ): Promise<Order> {
    const res = await http.put<Order>(`/orders/${orderId}/payment`, {
      payment_status,
      upi_ref,
    });
    return res.data;
  },

  async markSelfPaid(orderId: number): Promise<void> {
    await http.post(`/orders/${orderId}/mark-paid`);
  },

  async uploadScreenshot(orderId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await http.post<{ url: string }>(`/orders/${orderId}/screenshot`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async verifyOTP(orderId: number, otp: string): Promise<void> {
    await http.post("/orders/verify-otp", { order_id: orderId, otp });
  },
};
