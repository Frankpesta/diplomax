"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { WizardShell } from "@/components/admin/wizard/wizard-shell";
import { Step1Sender } from "@/components/admin/wizard/step-1-sender";
import { Step2Receiver } from "@/components/admin/wizard/step-2-receiver";
import { Step3Items } from "@/components/admin/wizard/step-3-items";
import { Step4Pricing } from "@/components/admin/wizard/step-4-pricing";
import { Step5Route } from "@/components/admin/wizard/step-5-route";
import { Step7Review } from "@/components/admin/wizard/step-7-review";
import {
  WizardData,
  ContactData,
  ItemFormData,
  PricingData,
  CheckpointFormData,
  DEFAULT_SENDER,
  DEFAULT_PRICING,
} from "@/types/wizard";
import { Loader2 } from "lucide-react";

const EMPTY_DATA: WizardData = {
  sender: { ...DEFAULT_SENDER },
  receiver: { ...DEFAULT_SENDER },
  items: [],
  pricing: { ...DEFAULT_PRICING },
  checkpoints: [],
};

function WizardPageInner() {
  const searchParams = useSearchParams();
  const editCode = searchParams.get("edit");

  const existingShipment = useQuery(
    api.shipments.getShipmentByTrackingCode,
    editCode ? { trackingCode: editCode } : "skip"
  );

  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(EMPTY_DATA);
  const [initialized, setInitialized] = useState(!editCode);

  useEffect(() => {
    if (!editCode || initialized) return;
    if (existingShipment === undefined) return;

    if (existingShipment) {
      setData({
        sender: {
          fullName: existingShipment.senderFullName,
          email: existingShipment.senderEmail,
          phone: existingShipment.senderPhone,
          address: existingShipment.senderAddress,
          city: existingShipment.senderCity,
          state: existingShipment.senderState,
          country: existingShipment.senderCountry,
          postalCode: existingShipment.senderPostalCode,
        },
        receiver: {
          fullName: existingShipment.receiverFullName,
          email: existingShipment.receiverEmail,
          phone: existingShipment.receiverPhone,
          address: existingShipment.receiverAddress,
          city: existingShipment.receiverCity,
          state: existingShipment.receiverState,
          country: existingShipment.receiverCountry,
          postalCode: existingShipment.receiverPostalCode,
        },
        items: (existingShipment.items ?? []).map((item) => ({
          id: crypto.randomUUID(),
          description: item.description,
          quantity: item.quantity,
          weight: item.weight,
          declaredValue: item.declaredValue,
        })),
        pricing: {
          shipmentType: existingShipment.shipmentType,
          status: existingShipment.status,
          dispatchDate: existingShipment.dispatchDate ?? "",
          estimatedDeliveryDate: existingShipment.estimatedDeliveryDate ?? "",
          weight: existingShipment.weight,
          length: existingShipment.length,
          width: existingShipment.width,
          height: existingShipment.height,
          shippingCost: existingShipment.shippingCost,
          tax: existingShipment.tax,
          insurance: existingShipment.insurance,
          totalCost: existingShipment.totalCost,
        },
        checkpoints: (existingShipment.checkpoints ?? []).map((cp) => ({
          id: crypto.randomUUID(),
          cityName: cp.cityName,
          country: cp.country,
          latitude: cp.latitude,
          longitude: cp.longitude,
        })),
      });
    }
    setInitialized(true);
  }, [editCode, existingShipment, initialized]);

  const isEdit = !!editCode;
  const editShipmentId = existingShipment?._id;

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? `Edit Shipment · ${editCode}` : "New Shipment"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Step {step} of 6 — fill in each section{" "}
          {isEdit ? "to update the shipment." : "to create the shipment."}
        </p>
      </div>

      <WizardShell currentStep={step}>
        {step === 1 && (
          <Step1Sender
            data={data.sender}
            onComplete={(sender: ContactData) => {
              setData((d) => ({ ...d, sender }));
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2Receiver
            data={data.receiver}
            onComplete={(receiver: ContactData) => {
              setData((d) => ({ ...d, receiver }));
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Items
            data={data.items}
            onComplete={(items: ItemFormData[]) => {
              setData((d) => ({ ...d, items }));
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4Pricing
            data={data.pricing}
            onComplete={(pricing: PricingData) => {
              setData((d) => ({ ...d, pricing }));
              setStep(5);
            }}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Step5Route
            data={data.checkpoints}
            onComplete={(checkpoints: CheckpointFormData[]) => {
              setData((d) => ({ ...d, checkpoints }));
              setStep(6);
            }}
            onBack={() => setStep(4)}
          />
        )}
        {step === 6 && (
          <Step7Review
            data={data}
            onBack={() => setStep(5)}
            editShipmentId={editShipmentId}
            editTrackingCode={editCode ?? undefined}
          />
        )}
      </WizardShell>
    </div>
  );
}

export default function NewShipmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <WizardPageInner />
    </Suspense>
  );
}
