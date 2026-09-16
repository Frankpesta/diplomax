import { cn } from "@/lib/utils";
import { getStatusStyle } from "@convex/lib/statusStyles";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = getStatusStyle(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.badgeBg,
        style.badgeText,
        className
      )}
    >
      {status}
    </span>
  );
}
