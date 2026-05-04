import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🍕</div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Looks like this page wandered off the menu!
      </p>
      <Button onClick={() => navigate("/")} className="rounded-full">
        Back to Home
      </Button>
    </main>
  );
}
