"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChartIcon,
} from "lucide-react";

// ── Colors ───────────────────────────────────────────────────────────────────

const CHART_COLORS = {
  primary: "#245b45",
  inTransit: "#6b8e52",
  revenue: "#6b8e52",
  rate: "#0d9488",
  muted: "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
  "Shipment Registered": "#64748b",
  "In Transit": "#245b45",
  "Held at the Airport": "#6b8e52",
};

const TICK_STYLE = { fill: "#888", fontSize: 11 };
const GRID_COLOR = "rgba(128,128,128,0.15)";

// ── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  prefix?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl shadow-lg p-3 text-xs min-w-[140px]">
      {label && <div className="font-semibold mb-2">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-semibold">
            {prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  height = 260,
}: {
  title: string;
  subtitle: string;
  icon: import("lucide-react").LucideIcon;
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

// ── Empty chart state ─────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const data = useQuery(api.shipments.getAnalyticsData);
  const metrics = useQuery(api.shipments.getDashboardMetrics);

  const isLoading = data === undefined || metrics === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform metrics and performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card border rounded-2xl p-5 h-[340px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { monthly, statusDistribution } = data;
  const hasData = data.total > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Platform metrics across {data.total.toLocaleString()} total shipments
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: metrics.totalShipments, color: CHART_COLORS.primary },
          { label: "In Transit", value: metrics.inTransitShipments, color: CHART_COLORS.inTransit },
          { label: "Held at Airport", value: metrics.heldAtAirportShipments, color: "#a08549" },
          {
            label: "Revenue",
            value: `$${metrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            color: CHART_COLORS.revenue,
          },
        ].map((s) => (
          <div key={s.label} className="bg-card border rounded-xl p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</div>
            <div className="text-xl font-extrabold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Shipment Volume */}
        <ChartCard
          title="Shipment Volume"
          subtitle="Total & in-transit shipments per month (last 12 months)"
          icon={BarChart3}
        >
          {!hasData ? (
            <EmptyChart message="No shipment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(128,128,128,0.06)" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  formatter={(v) => <span style={{ color: "#888", fontSize: 11 }}>{v}</span>}
                />
                <Bar dataKey="total" name="Total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="inTransit" name="In Transit" fill={CHART_COLORS.inTransit} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 2. Status Distribution */}
        <ChartCard
          title="Status Distribution"
          subtitle="Current breakdown of all shipment statuses"
          icon={PieChartIcon}
        >
          {!hasData || statusDistribution.length === 0 ? (
            <EmptyChart message="No shipment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="45%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={48}
                  paddingAngle={2}
                >
                  {statusDistribution.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? `hsl(${(i * 47 + 200) % 360},60%,50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0];
                    return (
                      <div className="bg-card border rounded-xl shadow-lg p-3 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="h-2 w-2 rounded-full" style={{ background: d.payload.fill ?? d.color }} />
                          <span className="font-semibold">{d.name}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {d.value} shipment{Number(d.value) !== 1 ? "s" : ""}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 10, paddingLeft: 8 }}
                  formatter={(v) => <span style={{ color: "#888", fontSize: 10 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 3. Held at Airport Rate */}
        <ChartCard
          title="Held at Airport Rate"
          subtitle="Percentage of shipments held at the airport per month"
          icon={TrendingUp}
        >
          {!hasData ? (
            <EmptyChart message="No shipment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  content={<ChartTooltip suffix="%" />}
                  cursor={{ stroke: CHART_COLORS.rate, strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="heldAtAirportRate"
                  name="Held at Airport Rate"
                  stroke={CHART_COLORS.rate}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CHART_COLORS.rate, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.rate, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 4. Revenue */}
        <ChartCard
          title="Monthly Revenue"
          subtitle="Total shipment value collected per month"
          icon={DollarSign}
        >
          {!hasData ? (
            <EmptyChart message="No shipment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.revenue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="label" tick={TICK_STYLE} tickLine={false} axisLine={false} />
                <YAxis
                  tick={TICK_STYLE}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                />
                <Tooltip
                  content={<ChartTooltip prefix="$" />}
                  cursor={{ stroke: CHART_COLORS.revenue, strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3.5, fill: CHART_COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.revenue, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
