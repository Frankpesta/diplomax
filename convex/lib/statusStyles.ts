/**
 * Single source of truth for shipment status styling.
 * Status itself is a free-form string (admins can type anything) — these are
 * just the statuses that get a dedicated color/icon; anything else falls
 * back to a neutral style.
 */

export const KNOWN_STATUSES = [
  "Shipment Registered",
  "In Transit",
  "Held at the Airport",
] as const;

export type StatusIconKey = "package" | "truck" | "check";

export interface StatusStyle {
  hex: string;
  badgeBg: string;
  badgeText: string;
  dotBg: string;
  ringBg: string;
  pulse: boolean;
  icon: StatusIconKey;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  "Shipment Registered": {
    hex: "#475569",
    badgeBg: "bg-slate-100 dark:bg-slate-800/60",
    badgeText: "text-slate-700 dark:text-slate-300",
    dotBg: "bg-slate-400",
    ringBg: "bg-slate-300",
    pulse: false,
    icon: "package",
  },
  "In Transit": {
    hex: "#f59e0b",
    badgeBg: "bg-amber-50 dark:bg-amber-900/30",
    badgeText: "text-amber-700 dark:text-amber-400",
    dotBg: "bg-amber-500",
    ringBg: "bg-amber-400",
    pulse: true,
    icon: "truck",
  },
  "Held at the Airport": {
    hex: "#a855f7",
    badgeBg: "bg-purple-50 dark:bg-purple-900/30",
    badgeText: "text-purple-700 dark:text-purple-400",
    dotBg: "bg-purple-500",
    ringBg: "bg-purple-400",
    pulse: true,
    icon: "check",
  },
};

const FALLBACK_STATUS_STYLE: StatusStyle = {
  hex: "#64748b",
  badgeBg: "bg-muted",
  badgeText: "text-muted-foreground",
  dotBg: "bg-slate-400",
  ringBg: "bg-slate-300",
  pulse: false,
  icon: "package",
};

export function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLES[status] ?? FALLBACK_STATUS_STYLE;
}
