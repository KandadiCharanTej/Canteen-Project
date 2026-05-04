import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  login: (name: string, contact: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(api.getUser());
    setLoading(false);
  }, []);

  const login = async (name: string, contact: string) => {
    const u = await api.login({ name, contact });
    setUser(u);
    return u;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
