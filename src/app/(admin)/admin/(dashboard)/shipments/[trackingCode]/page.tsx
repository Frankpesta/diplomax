"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/admin/shipments/status-badge";
import { StatusUpdateDialog } from "@/components/admin/shipments/status-update-dialog";
import { DeleteConfirmDialog } from "@/components/admin/shipments/delete-confirm-dialog";
import { QrCodeDisplay } from "@/components/admin/shipments/qr-code-display";
import { StatusTimeline } from "@/components/shared/status-timeline";
import {
  Pencil,
  RefreshCw,
  Archive,
  ArchiveRestore,
  Trash2,
  ArrowLeft,
  Copy,
  Package,
  Loader2,
  MapPin,
  QrCode,
  Download,
  History,
} from "lucide-react";

interface PageProps {
  params: Promise<{ trackingCode: string }>;
}

function SectionCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 print:p-3 space-y-3 print:space-y-1.5 ${className}`}>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide print:text-[11px]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-sm print:text-xs">
      <span className="text-muted-foreground w-32 print:w-24 shrink-0">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}

export default function ShipmentDetailPage({ params }: PageProps) {
  const { trackingCode } = use(params);
  const router = useRouter();

  const shipment = useQuery(api.shipments.getShipmentByTrackingCode, {
    trackingCode,
  });
  const auditLogs = useQuery(
    api.auditLogs.getShipmentAuditLogs,
    shipment ? { shipmentId: shipment._id } : "skip"
  );

  const archiveShipment = useMutation(api.shipments.archiveShipment);
  const restoreShipment = useMutation(api.shipments.restoreShipment);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (shipment === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (shipment === null) {
    return (
      <div className="p-6 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Shipment not found</h2>
        <p className="text-muted-foreground text-sm mt-1">
          No shipment found for tracking code{" "}
          <span className="font-mono">{trackingCode}</span>.
        </p>
        <Button className="mt-4" render={<Link href="/admin/shipments" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shipments
        </Button>
      </div>
    );
  }

  async function handleArchive() {
    if (!shipment) return;
    try {
      await archiveShipment({ id: shipment._id });
      toast.success("Shipment archived.");
    } catch {
      toast.error("Failed to archive.");
    }
  }

  async function handleRestore() {
    if (!shipment) return;
    try {
      await restoreShipment({ id: shipment._id });
      toast.success("Shipment restored.");
    } catch {
      toast.error("Failed to restore.");
    }
  }

  const checkpoints = shipment.checkpoints ?? [];
  const items = shipment.items ?? [];

  return (
    <>
      {/* Print CSS — hide admin chrome when printing */}
      <style>{`
        @media print {
          @page { margin: 11mm; size: A4; }
          [data-sidebar] { display: none !important; }
          aside { display: none !important; }
          .admin-header-print-hide { display: none !important; }
          .print-hide { display: none !important; }
          body { color: black !important; background: white !important; }
        }
      `}</style>

    <div className="p-6 print:p-0 space-y-6 print:space-y-3 max-w-5xl">
      {/* Print-only header */}
      <div className="hidden print:flex items-center gap-3 print:mb-3 print:pb-2 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-forest">
          <Package className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-black text-brand-forest">Diplomaxdelivery</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Shipment Record — Admin</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mt-0.5 shrink-0 print-hide"
          render={<Link href="/admin/shipments" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold font-mono">{shipment.trackingCode}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 print-hide"
              onClick={() => {
                navigator.clipboard.writeText(shipment.trackingCode);
                toast.success("Copied!");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <StatusBadge status={shipment.status} />
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              {shipment.shipmentType}
            </span>
            {shipment.archived && (
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                Archived
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Created {new Date(shipment.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap print-hide">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusDialogOpen(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Update Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={`/admin/shipments/new?edit=${shipment.trackingCode}`} />
            }
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </Button>
          {shipment.archived ? (
            <Button variant="outline" size="sm" onClick={handleRestore}>
              <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Sender + Receiver */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-3">
        <SectionCard title="Sender">
          <InfoRow label="Name" value={shipment.senderFullName} />
          <InfoRow label="Email" value={shipment.senderEmail} />
          <InfoRow label="Phone" value={shipment.senderPhone} />
          <InfoRow label="Address" value={shipment.senderAddress} />
          <InfoRow
            label="Location"
            value={`${shipment.senderCity}, ${shipment.senderState} ${shipment.senderPostalCode}`}
          />
          <InfoRow label="Country" value={shipment.senderCountry} />
        </SectionCard>

        <SectionCard title="Receiver">
          <InfoRow label="Name" value={shipment.receiverFullName} />
          <InfoRow label="Email" value={shipment.receiverEmail} />
          <InfoRow label="Phone" value={shipment.receiverPhone} />
          <InfoRow label="Address" value={shipment.receiverAddress} />
          <InfoRow
            label="Location"
            value={`${shipment.receiverCity}, ${shipment.receiverState} ${shipment.receiverPostalCode}`}
          />
          <InfoRow label="Country" value={shipment.receiverCountry} />
        </SectionCard>
      </div>

      {/* Shipment details + QR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:gap-3">
        <div className="sm:col-span-2 space-y-4 print:space-y-2">
          <SectionCard title="Shipment Details">
            <InfoRow label="Type" value={shipment.shipmentType} />
            <InfoRow label="Status" value={shipment.status} />
            <InfoRow label="Dispatch Date" value={shipment.dispatchDate ?? "—"} />
            <InfoRow
              label="Est. Delivery"
              value={shipment.estimatedDeliveryDate ?? "—"}
            />
            <InfoRow
              label="Dimensions"
              value={`${shipment.length} × ${shipment.width} × ${shipment.height} cm`}
            />
            <InfoRow label="Weight" value={`${shipment.weight} kg`} />
          </SectionCard>

          <SectionCard title="Cost Breakdown">
            <InfoRow label="Shipping" value={`$${shipment.shippingCost}`} />
            <InfoRow label="Tax" value={`$${shipment.tax}`} />
            <InfoRow label="Insurance" value={`$${shipment.insurance}`} />
            <div className="border-t pt-2 print:pt-1 mt-2 print:mt-1">
              <InfoRow label="Total Cost" value={`$${shipment.totalCost}`} />
            </div>
          </SectionCard>
        </div>

        <SectionCard title="QR Code" className="flex flex-col items-center justify-start print:[&_img]:h-20 print:[&_img]:w-20">
          <QrCodeDisplay
            url={shipment.qrCodeUrl ?? ""}
            trackingCode={shipment.trackingCode}
          />
          <p className="text-xs text-muted-foreground text-center mt-2 print:hidden">
            Scan to track this shipment
          </p>
        </SectionCard>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <SectionCard title={`Items (${items.length})`}>
          <div className="space-y-3 print:space-y-1.5">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 print:gap-2 text-sm print:text-xs border-b last:border-0 pb-3 print:pb-1.5 last:pb-0"
              >
                <Package className="h-4 w-4 print:h-3 print:w-3 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Qty: {item.quantity} · {item.weight} kg ·{" "}
                    ${item.declaredValue} declared
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Tabs: Timeline | Route | Audit Log */}
      <Tabs defaultValue="timeline" className="print-hide">
        <TabsList>
          <TabsTrigger value="timeline">
            <History className="mr-1.5 h-4 w-4" />
            Timeline ({shipment.statusHistory.length})
          </TabsTrigger>
          <TabsTrigger value="route">
            <MapPin className="mr-1.5 h-4 w-4" />
            Route ({checkpoints.length})
          </TabsTrigger>
          <TabsTrigger value="audit">
            <QrCode className="mr-1.5 h-4 w-4" />
            Audit Log ({auditLogs?.length ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-4">
          <div className="rounded-xl border bg-card p-5">
            <StatusTimeline events={shipment.statusHistory} />
          </div>
        </TabsContent>

        {/* Route */}
        <TabsContent value="route" className="mt-4">
          {checkpoints.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center">
              <MapPin className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No route checkpoints.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checkpoints.map((cp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cp.cityName}</p>
                    <p className="text-xs text-muted-foreground">{cp.country}</p>
                  </div>
                  {cp.arrivalStatus && (
                    <StatusBadge status={cp.arrivalStatus} />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {cp.latitude.toFixed(4)}, {cp.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="mt-4">
          {!auditLogs || auditLogs.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center">
              <p className="text-sm text-muted-foreground">No audit log entries.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="rounded-xl border bg-card p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {log.adminName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {statusDialogOpen && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          shipmentId={shipment._id}
          currentStatus={shipment.status}
        />
      )}
      {deleteDialogOpen && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          shipmentId={shipment._id}
          trackingCode={shipment.trackingCode}
          onDeleted={() => router.push("/admin/shipments")}
        />
      )}
    </div>
    </>
  );
}
