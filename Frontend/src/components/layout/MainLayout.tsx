import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface Props {
  children: ReactNode;
}

export function MainLayout({ children }: Props) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 relative">
        <div className="max-w-4xl mx-auto md:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
