import { OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<OrderStatus, string> = {
  Placed: "bg-accent text-accent-foreground",
  Preparing: "bg-warning/20 text-warning-foreground border border-warning/40",
  Ready: "bg-success text-success-foreground",
  Completed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("rounded-full font-medium hover:opacity-100", map[status])}>{status}</Badge>;
}
