import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/server";
export async function generateMetadata(): Promise<Metadata> { const { meta } = getDictionary(await getLocale()); return meta.contact; }
export default function ContactLayout({ children }: { children: React.ReactNode }) { return children; }
