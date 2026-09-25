import { Package, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusStyle, type StatusIconKey } from "@convex/lib/statusStyles";

export interface StatusTimelineEvent {
  _id: string;
  status: string;
  createdAt: string;
}

const STATUS_ICONS: Record<StatusIconKey, import("lucide-react").LucideIcon> = {
  package: Package,
  truck: Truck,
  check: CheckCircle2,
};

interface StatusTimelineProps {
  events: StatusTimelineEvent[];
  className?: string;
  /** Display text for a status; styling still keys off the raw value. */
  formatStatus?: (status: string) => string;
  currentLabel?: string;
  /** BCP 47 locale for timestamps; defaults to the browser's. */
  dateLocale?: string;
}

/** Vertical timeline of a shipment's status history, newest first. */
export function StatusTimeline({ events, className, formatStatus = s => s, currentLabel = "Current", dateLocale }: StatusTimelineProps) {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className={cn("space-y-0", className)}>
      {sorted.map((event, i) => {
        const isCurrent = i === 0;
        const isLastRow = i === sorted.length - 1;
        const style = getStatusStyle(event.status);
        const Icon = STATUS_ICONS[style.icon];

        return (
          <div key={event._id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLastRow && (
              <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" aria-hidden />
            )}

            <span
              className={cn(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                isCurrent ? style.badgeBg : "border-border bg-background"
              )}
              style={isCurrent ? { borderColor: style.hex } : undefined}
            >
              {isCurrent && style.pulse && (
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
                    style.ringBg
                  )}
                  aria-hidden
                />
              )}
              <Icon className={cn("relative h-4 w-4", isCurrent ? style.badgeText : "text-muted-foreground")} />
            </span>

            <div className="flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-sm font-black"
                  style={isCurrent ? { color: style.hex } : undefined}
                >
                  {formatStatus(event.status)}
                </span>
                {isCurrent && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    {currentLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(event.createdAt).toLocaleString(dateLocale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
