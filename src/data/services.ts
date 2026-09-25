import type { Dictionary } from "@/i18n/dictionaries/en";

export type ServiceSlug = keyof Dictionary["services"];
type ServiceCopy = Dictionary["services"]["express"];
export type ServiceData = ServiceCopy & { slug: ServiceSlug; icon: string; accent: string };

/** Language-independent service attributes; copy lives in the i18n dictionaries. */
const SERVICE_META: Record<ServiceSlug, { icon: string; accent: string }> = {
  express: { icon: "Zap", accent: "#658535" },
  standard: { icon: "Package", accent: "#245b45" },
  freight: { icon: "Truck", accent: "#547c65" },
  international: { icon: "Globe", accent: "#697d3f" },
};

export const SERVICE_SLUGS = Object.keys(SERVICE_META) as ServiceSlug[];

export function isServiceSlug(slug: string): slug is ServiceSlug {
  return Object.hasOwn(SERVICE_META, slug);
}

export function getService(t: Dictionary, slug: string): ServiceData | undefined {
  if (!isServiceSlug(slug)) return undefined;
  return { slug, ...SERVICE_META[slug], ...t.services[slug] };
}

export function getServiceList(t: Dictionary): ServiceData[] {
  return SERVICE_SLUGS.map(slug => getService(t, slug)!);
}
