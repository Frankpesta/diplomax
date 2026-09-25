"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { useI18n } from "@/i18n/provider";
import { format } from "@/i18n/format";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
const SERVICE_SLUGS = ["express", "standard", "freight", "international"] as const;
export function SiteFooter() {
  const { t } = useI18n();
  const f = t.footer;
  const links = [[f.links.about, "/about"], [f.links.contact, "/contact"], [f.links.track, "/#track"], [f.links.signIn, "/admin/login"]];
  return <footer className="bg-brand-forest text-white"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]"><div><Link href="/" className="inline-block"><Logo variant="light" height={42} /></Link><p className="mt-6 max-w-xs text-sm leading-7 text-white/55">{f.tagline[0]}<br />{f.tagline[1]}</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm text-[#c7f36b]">{f.cta} <ArrowUpRight size={16} /></Link></div><div><h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[.2em] text-white/40">{f.servicesHeading}</h3><ul className="space-y-4 text-sm text-white/75">{SERVICE_SLUGS.map(slug=><li key={slug}><Link href={`/services/${slug}`} className="hover:text-[#c7f36b]">{f.services[slug]}</Link></li>)}</ul></div><div><h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[.2em] text-white/40">{f.aboutHeading}</h3><ul className="space-y-4 text-sm text-white/75">{links.map(([label,href])=><li key={href}><Link href={href} className="hover:text-[#c7f36b]">{label}</Link></li>)}</ul></div><div><h3 className="mb-6 text-[10px] font-semibold uppercase tracking-[.2em] text-white/40">{f.talkHeading}</h3><p className="text-sm leading-7 text-white/55">{f.talkText}</p><Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm text-[#c7f36b]">{f.talkCta} <ArrowUpRight size={16} /></Link><p className="mt-4 break-all text-xs text-white/65">support@diplomaxdelivery.com</p><a href={whatsappUrl(t.whatsapp.message)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-white/65 hover:text-[#c7f36b]">WhatsApp: {WHATSAPP_DISPLAY}</a></div></div><div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-6 text-xs text-white/40 sm:px-8"><span>{format(f.rights, { year: new Date().getFullYear() })}</span><span>{f.slogan}</span></div></div></footer>;
}
