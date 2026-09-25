import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getDictionary(await getLocale());
  return {
    title: meta.services.title,
    description: meta.services.description,
    openGraph: {
      title: meta.services.ogTitle,
      description: meta.services.ogDescription,
      type: "website",
    },
  };
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
