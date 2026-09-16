"use client";

import { use, useCallback } from "react";
import { isValidTrackingCode } from "@convex/lib/tracking";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { QrCodeDisplay } from "@/components/admin/shipments/qr-code-display";
import { StatusTimeline } from "@/components/shared/status-timeline";
import {
  Package,
  Calendar,
  MapPin,
  Weight,
  Ruler,
  Copy,
  ArrowRight,
  AlertCircle,
  Home,
  Download,
  Search,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getStatusStyle, type StatusIconKey } from "@convex/lib/statusStyles";

const RouteMap = dynamic(
  () => import("@/components/public/route-map").then((m) => m.RouteMap),
  {
    ssr: false,
    loading: () => <div className="h-80 rounded-xl bg-muted animate-pulse" />,
  }
);

/* ─── Status config ──────────────────────────────────────────────────────────── */

const STATUS_ICONS: Record<StatusIconKey, import("lucide-react").LucideIcon> = {
  package: Package,
  truck: Truck,
  check: CheckCircle2,
};

function getIndicatorStyle(status: string) {
  const style = getStatusStyle(status);
  return {
    dot: style.dotBg,
    dotHex: style.hex,
    ring: style.ringBg,
    pulse: style.pulse,
    bg: style.badgeBg,
    text: style.badgeText,
    icon: STATUS_ICONS[style.icon],
  };
}

/* ─── Shared components ──────────────────────────────────────────────────────── */

function PulsingDot({ status, size = "md" }: { status: string; size?: "sm" | "md" | "lg" }) {
  const ind = getIndicatorStyle(status);
  const sz = { sm: { outer: "h-3 w-3", inner: "h-2.5 w-2.5" }, md: { outer: "h-4 w-4", inner: "h-3 w-3" }, lg: { outer: "h-5 w-5", inner: "h-4 w-4" } }[size];
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", sz.outer)}>
      {ind.pulse && (
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", ind.ring)} />
      )}
      <span className={cn("relative inline-flex rounded-full", sz.inner, ind.dot)} />
    </span>
  );
}

/** Colored badge with pulsing dot — always shows live shipment.status text */
function StatusBadge({ status }: { status: string }) {
  const ind = getIndicatorStyle(status);
  const Icon = ind.icon;
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black", ind.bg, ind.text)}>
      <PulsingDot status={status} size="sm" />
      <Icon className="h-4 w-4" />
      {status}
    </span>
  );
}

/** Plain pill for print — no colors, just text */
function StatusText({ status }: { status: string }) {
  return (
    <span className="font-black text-slate-900 text-sm">{status}</span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 print:py-1 text-sm print:text-xs border-b border-border/50 last:border-0 print:border-slate-200">
      <span className="w-36 print:w-28 shrink-0 text-muted-foreground font-medium print:text-slate-600">{label}</span>
      <span className="font-semibold break-all print:text-slate-900">{value}</span>
    </div>
  );
}

function Card({ title, icon: Icon, children, className }: {
  title?: string; icon?: import("lucide-react").LucideIcon; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm print:border-slate-200 print:shadow-none print:rounded-lg", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b px-6 py-4 print:border-slate-200 print:px-4 print:py-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground print:text-slate-500" />}
          <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground print:text-[11px]">{title}</h2>
        </div>
      )}
      <div className="p-6 print:p-3">{children}</div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl bg-muted animate-pulse", className)} />;
}

function TrackingPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */

export default function PublicTrackingPage({
  params,
}: {
  params: Promise<{ trackingCode: string }>;
}) {
  const { trackingCode } = use(params);
  const validCode = isValidTrackingCode(trackingCode);
  const result = useQuery(api.shipments.getShipmentByTrackingCode, validCode ? { trackingCode } : "skip");
  const shipment = validCode ? result : null;

  const trackingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track/${trackingCode}`
      : `/track/${trackingCode}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(trackingCode);
    toast.success("Tracking code copied!");
  }, [trackingCode]);

  const handleDownloadPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* ── Print stylesheet ── */}
      <style>{`
        @media print {
          @page { margin: 11mm; size: A4; }

          body, html { background: #ffffff !important; }

          /* Force all text to be dark */
          * { color: #1e293b !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Status hero card: swap navy → light */
          .status-hero-print {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
          }
          .status-hero-print .decorative-overlay { display: none !important; }

          /* Card backgrounds */
          .bg-card, .bg-muted\\/20, .bg-background { background: #ffffff !important; }

          /* Make muted text legible */
          .text-muted-foreground { color: #475569 !important; }
          .text-white\\/60, .text-white\\/70, .text-white\\/50, .text-white\\/40 { color: #475569 !important; }
          .text-white { color: #1e293b !important; }

          /* Borders */
          .border, .border-b, .border-t { border-color: #e2e8f0 !important; }

          /* QR code area — always show */
          .qr-print-section { display: block !important; }
          .qr-print-section .qr-download-btn { display: none !important; }

          /* Remove gradient overlays */
          [class*="bg-gradient"] { background: transparent !important; }

          /* Page break helpers */
          .no-break { break-inside: avoid; }
        }
      `}</style>

      {/* ── Print-only document header ── */}
      <div className="hidden print:flex items-center justify-between border-b border-slate-200 print:pb-2 print:mb-3 px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-forest">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-black" style={{ color: "#123d32" }}>Diplomaxdelivery</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Shipment Tracking Report</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Printed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* ── Sticky screen header ── */}
      <header className="print:hidden sticky top-0 z-20 bg-brand-forest text-white shadow-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-black text-lg hover:opacity-90 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-lime">
              <Package className="h-4 w-4 text-slate-950" />
            </div>
            <span className="hidden sm:inline">Diplomaxdelivery</span>
          </Link>

          {/* Live status in header */}
          <div className="flex min-w-0 flex-1 justify-center px-4">
            {shipment && (
              <div className="flex items-center gap-2">
                <PulsingDot status={shipment.status} size="md" />
                <span className="hidden font-mono text-xs font-black tracking-widest text-white/70 sm:inline">
                  {trackingCode}
                </span>
                <span className="hidden text-white/30 sm:inline">·</span>
                <span className="text-sm font-black text-white">{shipment.status}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-black text-white hover:bg-white/20 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-black text-white/80 hover:bg-white/10 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Track Another</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="bg-muted/20 min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8 print:py-0 sm:px-6 space-y-5 print:space-y-2">

          {shipment === undefined ? (
            <TrackingPageSkeleton />
          ) : shipment === null ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-black">Shipment Not Found</h1>
              <p className="mt-3 max-w-sm text-muted-foreground">
                No shipment with tracking code{" "}
                <span className="font-mono font-black text-foreground">{trackingCode}</span> was found.
                Double-check your code and try again.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-forest px-6 py-3 text-sm font-black text-white hover:bg-brand-forest/90 transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to Search
              </Link>
            </motion.div>
          ) : (
            <>
              {/* ── Status hero ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="status-hero-print relative overflow-hidden rounded-2xl bg-brand-forest text-white shadow-2xl no-break"
              >
                <div className="decorative-overlay absolute inset-0 bg-[linear-gradient(135deg,rgba(255,109,0,0.18)_0%,transparent_50%,rgba(255,255,255,0.03)_100%)]" />
                <div className="relative p-7 sm:p-9 print:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 print:gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="font-mono text-xs font-bold tracking-widest text-white/50 uppercase print:text-slate-400">
                          Tracking Code
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-5 print:mb-2">
                        <span className="font-mono text-2xl font-black tracking-widest sm:text-3xl print:text-xl print:text-slate-900">
                          {trackingCode}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="print:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span className="sr-only">Copy</span>
                        </button>
                      </div>

                      {/* Screen: pulsing badge; Print: plain text */}
                      <div className="print:hidden">
                        <StatusBadge status={shipment.status} />
                      </div>
                      <div className="hidden print:flex items-center gap-2">
                        <StatusText status={shipment.status} />
                      </div>
                    </div>

                    <span className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-white/60 print:border-slate-300 print:bg-slate-100 print:text-slate-600">
                      {shipment.shipmentType}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="mt-6 print:mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-brand-lime shrink-0 print:text-slate-500" />
                      <span className="font-black text-white print:text-slate-900">
                        {shipment.senderCity}, {shipment.senderCountry}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 shrink-0 print:text-slate-400" />
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-green-400 shrink-0 print:text-slate-500" />
                      <span className="font-black text-white print:text-slate-900">
                        {shipment.receiverCity}, {shipment.receiverCountry}
                      </span>
                    </div>
                  </div>

                  {/* ETA */}
                  {shipment.estimatedDeliveryDate && (
                    <div className="mt-4 print:mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-3 print:px-3 print:py-1.5 text-sm w-fit print:border-slate-200 print:bg-slate-50">
                      <Calendar className="h-4 w-4 text-brand-lime shrink-0 print:text-slate-500" />
                      <span className="text-white/60 print:text-slate-500">Estimated Delivery</span>
                      <span className="font-black text-white print:text-slate-900">{shipment.estimatedDeliveryDate}</span>
                    </div>
                  )}

                  {/* Dispatch */}
                  {shipment.dispatchDate && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-white/40 print:text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Dispatched {shipment.dispatchDate}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── Tracking history timeline ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border bg-card p-5 shadow-sm no-break print:shadow-none"
              >
                <h2 className="mb-4 text-xs font-black uppercase tracking-wide text-muted-foreground">
                  Tracking History
                </h2>
                <StatusTimeline events={shipment.statusHistory} />
              </motion.div>

              {/* ── Route map (screen only) ── */}
              {shipment.checkpoints.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="print:hidden overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                  <div className="px-6 pt-5 pb-3">
                    <h2 className="text-sm font-black uppercase tracking-wide text-muted-foreground">Recorded route checkpoints</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Updated by our operations team. This is not a live GPS feed; connecting lines illustrate the planned route.</p>
                  </div>
                  <RouteMap checkpoints={shipment.checkpoints} height={320} />
                  <p className="px-6 pb-3 pt-1.5 text-[10px] text-muted-foreground">© OpenStreetMap contributors</p>
                </motion.div>
              )}

              {/* ── Sender / Receiver ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 no-break"
              >
                <Card title="Sender">
                  <div className="space-y-1">
                    <p className="text-base font-black print:text-slate-900">{shipment.senderFullName}</p>
                    <p className="text-sm text-muted-foreground print:text-slate-600">{shipment.senderAddress}</p>
                    <p className="text-sm text-muted-foreground print:text-slate-600">{shipment.senderCity}, {shipment.senderState}</p>
                    <p className="text-sm font-semibold text-muted-foreground print:text-slate-600">{shipment.senderCountry}</p>
                  </div>
                </Card>
                <Card title="Receiver">
                  <div className="space-y-1">
                    <p className="text-base font-black print:text-slate-900">{shipment.receiverFullName}</p>
                    <p className="text-sm text-muted-foreground print:text-slate-600">{shipment.receiverAddress}</p>
                    <p className="text-sm text-muted-foreground print:text-slate-600">{shipment.receiverCity}, {shipment.receiverState}</p>
                    <p className="text-sm font-semibold text-muted-foreground print:text-slate-600">{shipment.receiverCountry}</p>
                  </div>
                </Card>
              </motion.div>

              {/* ── Shipment specs ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="no-break"
              >
                <Card title="Shipment Specifications" icon={Package}>
                  <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
                    <div className="sm:border-r sm:pr-6 print:border-slate-200">
                      <InfoRow label="Service Type" value={shipment.shipmentType} />
                      <InfoRow
                        label="Total Weight"
                        value={
                          <span className="flex items-center gap-1.5">
                            <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                            {shipment.weight} kg
                          </span>
                        }
                      />
                      <InfoRow
                        label="Dimensions"
                        value={
                          <span className="flex items-center gap-1.5">
                            <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                            {shipment.length} × {shipment.width} × {shipment.height} cm
                          </span>
                        }
                      />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:pl-6">
                      {shipment.dispatchDate && (
                        <InfoRow label="Dispatch Date" value={shipment.dispatchDate} />
                      )}
                      {shipment.estimatedDeliveryDate && (
                        <InfoRow label="Est. Delivery" value={shipment.estimatedDeliveryDate} />
                      )}
                      <InfoRow
                        label="Current Status"
                        value={
                          <>
                            {/* Screen: colored badge */}
                            <span className="print:hidden"><StatusBadge status={shipment.status} /></span>
                            {/* Print: plain text */}
                            <span className="hidden print:inline font-black text-slate-900">{shipment.status}</span>
                          </>
                        }
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* ── Package contents ── */}
              {shipment.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="no-break"
                >
                  <Card title={`Package Contents (${shipment.items.length} item${shipment.items.length !== 1 ? "s" : ""})`} icon={Package}>
                    <div className="space-y-3 print:space-y-1.5">
                      {shipment.items.map((item, i) => (
                        <div key={item._id} className={cn("flex items-start gap-4 print:gap-2 text-sm", i > 0 && "border-t pt-3 print:pt-1.5 print:border-slate-200")}>
                          <div className="flex h-9 w-9 print:h-6 print:w-6 shrink-0 items-center justify-center rounded-lg bg-brand-forest/10 print:border print:border-slate-200 print:bg-slate-50">
                            <Package className="h-4 w-4 print:h-3 print:w-3 text-brand-forest print:text-slate-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black print:text-xs print:text-slate-900">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 print:text-slate-600">
                              Qty: {item.quantity} · {item.weight} kg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ── Route checkpoints ── */}
              {shipment.checkpoints.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="no-break"
                >
                  <Card title="Recorded Route Updates" icon={MapPin}>
                    <div className="overflow-x-auto py-1">
                      <div className="flex items-start gap-0 min-w-max">
                        {shipment.checkpoints.map((cp, i) => {
                          // Only read when arrivalStatus is "current" — the other branches use fixed classes.
                          const cpInd = getIndicatorStyle(shipment.status);
                          return (
                            <div key={cp._id} className="flex items-start">
                              <div className="flex flex-col items-center w-24 text-center">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                                    cp.arrivalStatus === "arrived"
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : cp.arrivalStatus === "current"
                                        ? cpInd.bg
                                        : "border-border bg-background"
                                  )}
                                  style={
                                    cp.arrivalStatus === "current"
                                      ? { borderColor: cpInd.dotHex }
                                      : undefined
                                  }
                                >
                                  {cp.arrivalStatus === "arrived" ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : cp.arrivalStatus === "current" ? (
                                    <PulsingDot status={shipment.status} size="sm" />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full bg-border" />
                                  )}
                                </div>
                                <p className="mt-2 text-xs font-bold leading-tight print:text-slate-700">{cp.cityName}</p>
                                <p className="text-[10px] text-muted-foreground print:text-slate-500">{cp.country}</p>
                                {cp.arrivalStatus && (
                                  <p className="mt-0.5 text-[10px] font-bold capitalize text-primary print:text-slate-600">
                                    {cp.arrivalStatus}
                                  </p>
                                )}
                              </div>
                              {i < shipment.checkpoints.length - 1 && (
                                <div
                                  className="h-0.5 w-10 mx-1 flex-shrink-0 mt-3.5"
                                  style={{
                                    backgroundColor:
                                      shipment.checkpoints[i + 1]?.arrivalStatus === "arrived"
                                        ? "var(--color-primary, #123d32)"
                                        : "#e2e8f0",
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ── QR code — visible on screen AND in PDF ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="qr-print-section no-break"
              >
                <Card title="Scan & Share">
                  <div className="flex flex-col sm:flex-row items-center gap-6 print:gap-3">
                    {/* QR renders as an <img> with data URL — prints correctly */}
                    <div className="shrink-0 print:[&_img]:h-20 print:[&_img]:w-20">
                      <QrCodeDisplay
                        url={shipment.qrCodeUrl ?? trackingUrl}
                        trackingCode={trackingCode}
                        size={160}
                      />
                    </div>
                    <div className="flex-1 space-y-3 print:space-y-1 text-sm text-center sm:text-left">
                      <p className="font-black text-base print:text-sm print:text-slate-900">Quick Access QR Code</p>
                      <p className="text-muted-foreground leading-6 print:hidden print:text-slate-600">
                        Scan this code with any phone camera to open this tracking page instantly — no typing required.
                      </p>
                      <p className="font-mono text-xs break-all text-muted-foreground print:text-slate-500">{trackingUrl}</p>
                      {/* Download PDF button — hidden in print */}
                      <button
                        onClick={handleDownloadPDF}
                        className="qr-download-btn print:hidden inline-flex items-center gap-2 rounded-xl bg-brand-forest px-5 py-2.5 text-sm font-black text-white hover:bg-brand-forest/90 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download as PDF
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        {/* Screen-only footer */}
        <footer className="print:hidden mx-auto max-w-5xl px-4 py-8 text-center text-xs text-muted-foreground sm:px-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="h-4 w-4" />
            <span className="font-black">Diplomaxdelivery</span>
          </div>
          <p>© {new Date().getFullYear()} Diplomaxdelivery · Global Courier & Logistics</p>
        </footer>
      </main>
    </>
  );
}
