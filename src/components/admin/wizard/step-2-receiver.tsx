"use client";

import { ContactForm } from "./contact-form";
import { ContactData } from "@/types/wizard";

interface Props {
  data: ContactData;
  onComplete: (data: ContactData) => void;
  onBack: () => void;
}

export function Step2Receiver({ data, onComplete, onBack }: Props) {
  return (
    <ContactForm
      title="Receiver Information"
      subtitle="Enter the details of the person or company receiving this shipment."
      data={data}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
}
