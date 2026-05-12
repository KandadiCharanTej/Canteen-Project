import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Spinner } from "@/components/Spinner";

const Home = lazy(() => import("@/pages/Home"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const Profile = lazy(() => import("@/pages/Profile"));
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Spinner label="Verifying session..." />
    </div>
  );

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <MainLayout>
              <Suspense fallback={
                <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                  <Spinner label="Loading QuickBite..." />
                </div>
              }>
                <Routes>
                  {/* Public - NO login required */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  
                  {/* Admin Only */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </MainLayout>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
