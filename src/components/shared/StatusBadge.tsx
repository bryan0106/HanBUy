import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    paid: "bg-success/10 text-success",
    unpaid: "bg-error/10 text-error",
    pending: "bg-warning/10 text-warning",
    delivered: "bg-success/10 text-success",
    in_warehouse: "bg-info/10 text-info",
    in_transit: "bg-info/10 text-info",
    in_customs: "bg-warning/10 text-warning",
    at_ph_hub: "bg-info/10 text-info",
    out_for_delivery: "bg-info/10 text-info",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-grey-100 text-grey-800",
        className
      )}
    >
      {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
}

