"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { StatusBadge } from "@/components/admin/shipments/status-badge";
import {
  Package,
  TrendingUp,
  CheckCircle2,
  Archive,
  Truck,
  DollarSign,
  ArrowRight,
  Clock,
} from "lucide-react";

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number | string | undefined;
  icon: import("lucide-react").LucideIcon;
  color: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="dashboard-stat bg-card border rounded-2xl p-6 flex flex-row-reverse justify-between items-start gap-4">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
          {label}
        </div>
        <div className="text-3xl font-semibold tracking-tight leading-none mt-3">
          {value === undefined ? (
            <span className="text-muted-foreground/40 text-lg">—</span>
          ) : (
            <>
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const metrics = useQuery(api.shipments.getDashboardMetrics);
  const recent = useQuery(api.shipments.getRecentShipments, { limit: 10 });
  const currentUser = useQuery(api.users.getCurrentUser);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const STAT_CARDS = [
    { label: "Total Shipments", value: metrics?.totalShipments, icon: Package, color: "#245b45" },
    { label: "Shipment Registered", value: metrics?.registeredShipments, icon: TrendingUp, color: "#688148" },
    { label: "In Transit", value: metrics?.inTransitShipments, icon: Truck, color: "#4c8e76" },
    { label: "Held at the Airport", value: metrics?.heldAtAirportShipments, icon: CheckCircle2, color: "#b28845" },
    { label: "Archived", value: metrics?.archivedShipments, icon: Archive, color: "#748774" },
    {
      label: "Total Revenue",
      value: metrics?.totalRevenue !== undefined
        ? metrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : undefined,
      icon: DollarSign,
      color: "#245b45",
      prefix: "$",
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="dashboard-welcome flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[.2em] text-[#c7f36b]">Your delivery overview</p><h1 className="text-3xl font-medium tracking-tight">
            Welcome back{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-white/55 mt-3">{today}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/shipments/new"
            className="relative z-10 bg-[#c7f36b] text-[#123d32] text-sm font-semibold px-5 py-3 rounded-full hover:bg-[#daf99d] transition-colors"
          >
            + New Shipment
          </Link>
          <Link
            href="/admin/analytics"
            className="relative z-10 border border-white/25 text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-1.5"
          >
            Analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent shipments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Shipment activity</h2>
          <Link
            href="/admin/shipments"
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            All shipments <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="bg-card border rounded-2xl overflow-hidden">
          {!recent ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading…</div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No shipments yet.</p>
              <Link href="/admin/shipments/new" className="mt-3 inline-block text-sm text-primary font-semibold hover:underline">
                Create your first shipment →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tracking</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Route</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cost</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recent.map((s) => (
                    <tr key={s._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/shipments/${s.trackingCode}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {s.trackingCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{s.senderCity}</span>
                        {" → "}
                        <span className="font-medium text-foreground">{s.receiverCity}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{s.shipmentType}</td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        ${s.totalCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(s.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

