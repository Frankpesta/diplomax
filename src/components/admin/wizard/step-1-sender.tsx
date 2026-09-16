"use client";

import { ContactForm } from "./contact-form";
import { ContactData } from "@/types/wizard";

interface Props {
  data: ContactData;
  onComplete: (data: ContactData) => void;
}

export function Step1Sender({ data, onComplete }: Props) {
  return (
    <ContactForm
      title="Sender Information"
      subtitle="Enter the details of the person or company sending this shipment."
      data={data}
      onComplete={onComplete}
    />
  );
}
