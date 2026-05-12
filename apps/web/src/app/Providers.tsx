"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "sonner";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <MainLayout>
            {children}
            <Toaster position="top-center" />
          </MainLayout>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
