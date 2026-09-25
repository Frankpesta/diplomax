import type { Metadata } from "next";
import { getService } from "@/data/services";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getDictionary(await getLocale());
  const svc = getService(t, slug);

  if (!svc) {
    return { title: t.meta.serviceNotFound };
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
