import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  sendOTP: (contact: string) => Promise<any>;
  verifyOTP: (contact: string, otp: string) => Promise<{ is_registered: boolean }>;
  signup: (data: {
    name: string;
    contact: string;
    category?: string;
    student_class?: string;
  }) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getStoredUser();
    if (stored && authApi.getToken()) {
      setUser(stored);
      authApi.getMe().then(setUser).catch(() => {
        authApi.logout();
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const sendOTP = async (contact: string) => {
    return await authApi.sendOTP(contact);
  };

  const verifyOTP = async (contact: string, otp: string) => {
    const res = await authApi.verifyOTP(contact, otp);
    if (res.is_registered && res.user) {
      setUser(res.user);
    }
    return { is_registered: res.is_registered };
  };

  const signup = async (data: {
    name: string;
    contact: string;
    category?: string;
    student_class?: string;
  }) => {
    const res = await authApi.signup(data);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, sendOTP, verifyOTP, signup, logout, loading, isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
