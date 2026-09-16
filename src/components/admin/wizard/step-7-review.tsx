"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WizardData } from "@/types/wizard";
import { QrCodeDisplay } from "@/components/admin/shipments/qr-code-display";
import { ArrowLeft, CheckCircle2, Loader2, Copy, Download, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardData;
  onBack: () => void;
  editShipmentId?: Id<"shipments">;
  editTrackingCode?: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
      {children}
    </p>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="font-medium break-all">{value}</span>
    </div>
  );
}

export function Step7Review({ data, onBack, editShipmentId, editTrackingCode }: Props) {
  const router = useRouter();
  const createShipment = useMutation(api.shipments.createShipment);
  const updateShipment = useMutation(api.shipments.updateShipment);
  const replaceCheckpoints = useMutation(api.routes.replaceRouteCheckpoints);
  const replaceItems = useMutation(api.shipments.replaceShipmentItems);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const isEdit = !!editShipmentId;
  const { sender, receiver, items, pricing, checkpoints } = data;

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const checkpointArgs =
        checkpoints.length >= 2
          ? checkpoints.map((cp, i) => ({
              cityName: cp.cityName,
              country: cp.country,
              latitude: cp.latitude,
              longitude: cp.longitude,
              sequence: i + 1,
            }))
          : undefined;

      const itemArgs = items.map(({ description, quantity, weight, declaredValue }) => ({
        description,
        quantity: Number(quantity),
        weight: Number(weight),
        declaredValue: Number(declaredValue),
      }));

      if (isEdit && editShipmentId) {
        // Update existing shipment
        await updateShipment({
          id: editShipmentId,
          senderFullName: sender.fullName,
          senderEmail: sender.email,
          senderPhone: sender.phone,
          senderAddress: sender.address,
          senderCity: sender.city,
          senderState: sender.state,
          senderCountry: sender.country,
          senderPostalCode: sender.postalCode,
          receiverFullName: receiver.fullName,
          receiverEmail: receiver.email,
          receiverPhone: receiver.phone,
          receiverAddress: receiver.address,
          receiverCity: receiver.city,
          receiverState: receiver.state,
          receiverCountry: receiver.country,
          receiverPostalCode: receiver.postalCode,
          shipmentType: pricing.shipmentType,
          dispatchDate: pricing.dispatchDate || undefined,
          estimatedDeliveryDate: pricing.estimatedDeliveryDate || undefined,
          shippingCost: Number(pricing.shippingCost),
          tax: Number(pricing.tax),
          insurance: Number(pricing.insurance),
          totalCost: Number(pricing.totalCost),
          weight: Number(pricing.weight),
          length: Number(pricing.length),
          width: Number(pricing.width),
          height: Number(pricing.height),
        });

        // Replace checkpoints
        await replaceCheckpoints({
          shipmentId: editShipmentId,
          checkpoints: checkpointArgs ?? [],
        });

        // Replace items
        await replaceItems({
          shipmentId: editShipmentId,
          items: itemArgs,
        });

        toast.success("Shipment updated successfully!");
        router.push(`/admin/shipments/${editTrackingCode}`);
      } else {
        // Create new shipment
        const result = await createShipment({
          senderFullName: sender.fullName,
          senderEmail: sender.email,
          senderPhone: sender.phone,
          senderAddress: sender.address,
          senderCity: sender.city,
          senderState: sender.state,
          senderCountry: sender.country,
          senderPostalCode: sender.postalCode,
          receiverFullName: receiver.fullName,
          receiverEmail: receiver.email,
          receiverPhone: receiver.phone,
          receiverAddress: receiver.address,
          receiverCity: receiver.city,
          receiverState: receiver.state,
          receiverCountry: receiver.country,
          receiverPostalCode: receiver.postalCode,
          shipmentType: pricing.shipmentType,
          status: pricing.status || "Shipment Registered",
          dispatchDate: pricing.dispatchDate || undefined,
          estimatedDeliveryDate: pricing.estimatedDeliveryDate || undefined,
          shippingCost: Number(pricing.shippingCost),
          tax: Number(pricing.tax),
          insurance: Number(pricing.insurance),
          totalCost: Number(pricing.totalCost),
          weight: Number(pricing.weight),
          length: Number(pricing.length),
          width: Number(pricing.width),
          height: Number(pricing.height),
          items: itemArgs,
          checkpoints: checkpointArgs,
        });
        setCreatedCode(result.trackingCode);
        toast.success("Shipment created successfully!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(
        `${isEdit ? "Failed to update shipment" : "Failed to create shipment"}: ${message}`
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdCode) {
    const publicUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/track/${createdCode}`
        : `/track/${createdCode}`;

    return (
      <>
        {/* Print CSS — hide admin chrome and on-screen success UI, show only the sender's copy */}
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

        <div className="print-hide flex flex-col items-center gap-6 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Shipment Created!</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Your shipment is now live and ready to be tracked.
            </p>
          </div>
          <div className="rounded-xl bg-muted px-6 py-4 w-full max-w-xs">
            <p className="text-xs text-muted-foreground mb-1">Tracking Code</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-xl font-mono font-bold tracking-wider">{createdCode}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  toast.success("Copied to clipboard!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/admin/shipments")}>
              View All Shipments
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Download Sender&apos;s Copy
            </Button>
            <Button onClick={() => router.push(`/admin/shipments/${createdCode}`)}>
              View Shipment
            </Button>
          </div>
        </div>

        {/* Sender's copy — screen-hidden, shown only when printing/saving as PDF */}
        <div className="hidden print:block text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-forest">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-black text-brand-forest">Diplomaxdelivery</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Sender&apos;s Copy — Shipment Receipt</div>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Tracking Code</p>
              <p className="text-2xl font-mono font-black">{createdCode}</p>
            </div>
            <QrCodeDisplay url={publicUrl} trackingCode={createdCode} size={80} />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sender</p>
              <p className="font-semibold">{sender.fullName}</p>
              <p className="text-sm text-slate-600">{sender.address}</p>
              <p className="text-sm text-slate-600">{sender.city}, {sender.state} {sender.postalCode}</p>
              <p className="text-sm text-slate-600">{sender.country}</p>
              <p className="text-sm text-slate-600 mt-1">{sender.phone}</p>
              <p className="text-sm text-slate-600">{sender.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Receiver</p>
              <p className="font-semibold">{receiver.fullName}</p>
              <p className="text-sm text-slate-600">{receiver.address}</p>
              <p className="text-sm text-slate-600">{receiver.city}, {receiver.state} {receiver.postalCode}</p>
              <p className="text-sm text-slate-600">{receiver.country}</p>
              <p className="text-sm text-slate-600 mt-1">{receiver.phone}</p>
              <p className="text-sm text-slate-600">{receiver.email}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Shipment Details</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div>Type: <span className="font-semibold">{pricing.shipmentType}</span></div>
              <div>Status: <span className="font-semibold">{pricing.status}</span></div>
              <div>Dispatch: <span className="font-semibold">{pricing.dispatchDate || "—"}</span></div>
              <div>Est. Delivery: <span className="font-semibold">{pricing.estimatedDeliveryDate || "—"}</span></div>
              <div>Weight: <span className="font-semibold">{pricing.weight} kg</span></div>
              <div>Dimensions: <span className="font-semibold">{pricing.length} × {pricing.width} × {pricing.height} cm</span></div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Items ({items.length})
              </p>
              {items.map((item) => (
                <div key={item.id} className="text-sm border-b border-slate-100 py-1">
                  <span className="font-medium">{item.description}</span> — Qty {item.quantity} ·{" "}
                  {item.weight} kg · ${item.declaredValue} declared
                </div>
              ))}
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Cost Breakdown</p>
            <div className="text-sm space-y-1 max-w-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Shipping</span>
                <span>${pricing.shippingCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span>${pricing.tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Insurance</span>
                <span>${pricing.insurance}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1">
                <span>Total</span>
                <span>${pricing.totalCost}</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4">
            Keep this receipt for your records. Track this shipment anytime at {publicUrl}
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {isEdit ? "Review Changes" : "Review & Create"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Review your changes before saving the shipment."
            : "Review all details before creating the shipment."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4 space-y-2">
          <SectionLabel>Sender</SectionLabel>
          <Row label="Name" value={sender.fullName} />
          <Row label="Email" value={sender.email} />
          <Row label="Phone" value={sender.phone} />
          <Row label="Address" value={`${sender.address}, ${sender.city}, ${sender.state} ${sender.postalCode}`} />
          <Row label="Country" value={sender.country} />
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <SectionLabel>Receiver</SectionLabel>
          <Row label="Name" value={receiver.fullName} />
          <Row label="Email" value={receiver.email} />
          <Row label="Phone" value={receiver.phone} />
          <Row label="Address" value={`${receiver.address}, ${receiver.city}, ${receiver.state} ${receiver.postalCode}`} />
          <Row label="Country" value={receiver.country} />
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <SectionLabel>Items ({items.length})</SectionLabel>
          {items.map((item, i) => (
            <div key={item.id} className={cn("text-sm", i > 0 && "pt-2 border-t")}>
              <p className="font-medium">{item.description}</p>
              <p className="text-muted-foreground text-xs">
                Qty: {item.quantity} · {item.weight} kg · ${item.declaredValue} declared
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <SectionLabel>Pricing & Details</SectionLabel>
          <Row label="Type" value={pricing.shipmentType} />
          <Row label="Status" value={pricing.status} />
          <Row label="Dispatch" value={pricing.dispatchDate || "—"} />
          <Row label="Est. Delivery" value={pricing.estimatedDeliveryDate || "—"} />
          <Row label="Dimensions" value={`${pricing.length} × ${pricing.width} × ${pricing.height} cm`} />
          <Row label="Weight" value={`${pricing.weight} kg`} />
          <Row label="Total Cost" value={`$${pricing.totalCost}`} />
        </div>

        {checkpoints.length >= 2 && (
          <div className="rounded-lg border p-4 space-y-2">
            <SectionLabel>Route ({checkpoints.length} stops)</SectionLabel>
            {checkpoints.map((cp, i) => (
              <div key={cp.id} className="text-sm flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <span>{cp.cityName}, {cp.country}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create Shipment"
          )}
        </Button>
      </div>
    </div>
  );
}
