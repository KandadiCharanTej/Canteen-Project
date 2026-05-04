import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  login: (contact: string, password: string) => Promise<User>;
  signup: (data: {
    name: string;
    contact: string;
    password: string;
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
    // Try to restore user from localStorage
    const stored = authApi.getStoredUser();
    if (stored && authApi.getToken()) {
      setUser(stored);
      // Verify token is still valid in background
      authApi.getMe().then(setUser).catch(() => {
        authApi.logout();
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (contact: string, password: string) => {
    const res = await authApi.login(contact, password);
    setUser(res.user);
    return res.user;
  };

  const signup = async (data: {
    name: string;
    contact: string;
    password: string;
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
      value={{ user, login, signup, logout, loading, isLoggedIn: !!user }}
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
