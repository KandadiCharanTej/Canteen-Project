import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  login: (contact: string, aurora_uid?: string) => Promise<User>;
  signup: (data: {
    name: string;
    email?: string;
    contact: string;
    category?: string;
    student_class?: string;
    aurora_uid?: string;
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

  const login = async (contact: string, aurora_uid?: string) => {
    const res = await authApi.login(contact, aurora_uid);
    setUser(res.user);
    return res.user;
  };

  const signup = async (data: {
    name: string;
    email?: string;
    contact: string;
    category?: string;
    student_class?: string;
    aurora_uid?: string;
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
