"use client";

import { useState } from "react";
import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  ClipboardList,
  Search,
  ChevronRight,
  Loader2,
} from "lucide-react";

// ── Action label formatting ───────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  "shipment.created": "Shipment Created",
  "shipment.updated": "Shipment Updated",
  "shipment.status_changed": "Status Changed",
  "shipment.archived": "Shipment Archived",
  "shipment.restored": "Shipment Restored",
  "shipment.deleted": "Shipment Deleted",
  "user.login": "Admin Login",
  "user.logout": "Admin Logout",
  "user.password_changed": "Password Changed",
};

const ACTION_COLORS: Record<string, string> = {
  "shipment.created": "text-blue-600 dark:text-blue-400",
  "shipment.updated": "text-amber-600 dark:text-amber-400",
  "shipment.status_changed": "text-purple-600 dark:text-purple-400",
  "shipment.archived": "text-slate-500",
  "shipment.restored": "text-teal-600 dark:text-teal-400",
  "shipment.deleted": "text-red-600 dark:text-red-400",
  "user.login": "text-green-600 dark:text-green-400",
  "user.logout": "text-gray-500",
  "user.password_changed": "text-orange-600 dark:text-orange-400",
};

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "shipment.created", label: "Shipment Created" },
  { value: "shipment.updated", label: "Shipment Updated" },
  { value: "shipment.status_changed", label: "Status Changed" },
  { value: "shipment.archived", label: "Archived" },
  { value: "shipment.restored", label: "Restored" },
  { value: "shipment.deleted", label: "Deleted" },
];

// ── Format relative time ──────────────────────────────────────────────────────

function formatRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Extract tracking code from a log entry ────────────────────────────────────

function getTrackingCode(log: {
  newValue?: unknown;
  previousValue?: unknown;
}): string | null {
  const nv = log.newValue as Record<string, unknown> | undefined;
  const pv = log.previousValue as Record<string, unknown> | undefined;
  if (nv?.trackingCode) return String(nv.trackingCode);
  if (pv?.trackingCode) return String(pv.trackingCode);
  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [search, setSearch] = useState("");

  const { results, status, loadMore } = usePaginatedQuery(
    api.auditLogs.listAuditLogs,
    { action: actionFilter || undefined },
    { initialNumItems: 20 }
  );

  const filtered = search
    ? results.filter(
        (l) =>
          l.action.includes(search.toLowerCase()) ||
          l.adminName?.toLowerCase().includes(search.toLowerCase()) ||
          l.details?.toLowerCase().includes(search.toLowerCase()) ||
          getTrackingCode(l)?.toLowerCase().includes(search.toLowerCase())
      )
    : results;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Complete history of all admin actions in the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search actions, admins, tracking codes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {ACTION_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-2xl overflow-hidden">
        {results.length === 0 && status === "Exhausted" ? (
          <div className="p-12 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No audit log entries yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Actions will appear here as admins interact with the platform.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Timestamp
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Action
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Admin
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Shipment
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((log) => {
                    const trackingCode = getTrackingCode(log);
                    const colorCls = ACTION_COLORS[log.action] ?? "text-foreground";
                    return (
                      <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-xs font-medium text-foreground">
                            {formatRelative(log.timestamp)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold ${colorCls}`}>
                            {ACTION_LABELS[log.action] ?? log.action}
                          </span>
                          <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                            {log.action}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {log.adminName ?? "—"}
                        </td>
                        <td className="py-3 px-4">
                          {trackingCode ? (
                            <Link
                              href={`/admin/shipments/${trackingCode}`}
                              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              {trackingCode}
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-[240px] truncate">
                          {log.details ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Load more */}
            {status !== "Exhausted" && (
              <div className="border-t p-4 flex justify-center">
                <button
                  onClick={() => loadMore(20)}
                  disabled={status === "LoadingMore"}
                  className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {status === "LoadingMore" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                    </>
                  ) : (
                    "Load more entries"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Showing {filtered.length} of {results.length} loaded entries
        </p>
      )}
    </div>
  );
}
