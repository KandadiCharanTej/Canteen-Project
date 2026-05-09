import { ReactNode } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Props {
  title: string;
  showBack?: boolean;
  showLogout?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, showBack, showLogout, right }: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border">
      <div className="w-full flex items-center justify-between px-4 md:px-0 h-16">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-black tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          {right}
          {showLogout && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Logout"
              className="rounded-full text-gray-400 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
