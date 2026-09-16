import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Services",
  description:
    "Express, Standard, Freight, and International shipping services from Diplomaxdelivery. Explore delivery options and request a quote for your shipment.",
  openGraph: {
    title: "Shipping Services — Diplomaxdelivery",
    description:
      "From priority parcels to freight enquiries — compare all Diplomaxdelivery shipping services.",
    type: "website",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

