import type { Metadata } from "next";
import { SERVICES } from "@/data/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = SERVICES[slug];

  if (!svc) {
    return { title: "Service Not Found" };
  }

  return {
    title: svc.name,
    description: svc.longDescription,
    openGraph: {
      title: `${svc.name} — Diplomaxdelivery`,
      description: svc.description,
      type: "website",
    },
  };
}

export default function ServiceSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
