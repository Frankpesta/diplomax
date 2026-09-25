"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, Zap, Truck, Globe, ArrowLeft, ArrowUpRight, Check, type LucideIcon } from "lucide-react";
import { getService, getServiceList } from "@/data/services";
import { useI18n } from "@/i18n/provider";
import { NavHeader } from "@/components/public/nav-header";
import { SiteFooter } from "@/components/public/site-footer";
const icons: Record<string, LucideIcon> = { Package, Zap, Truck, Globe };
export default function ServiceDetailPage({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = use(params);
  const { t } = useI18n();
  const d = t.serviceDetail;
  const service = getService(t, slug);
  if (!service) notFound();
  const Icon = icons[service.icon] ?? Package;
  return <div><NavHeader /><main><section className="secondary-hero bg-brand-forest px-5 py-16 text-white sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><Link href="/services" className="inline-flex items-center gap-2 text-xs text-white/65"><ArrowLeft size={14} /> {d.back}</Link><div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.3fr_.7fr]"><div><p className="section-kicker !text-[#c7f36b]">{service.tagline}</p><h1 className="mt-5 text-5xl font-medium tracking-[-.05em] sm:text-6xl">{service.name}</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/65">{service.description}</p><Link href="/contact" className="pill-button lime mt-8">{d.cta} <ArrowUpRight size={18} /></Link></div><div className="flex aspect-square max-h-72 items-center justify-center rounded-[3rem] border border-white/15 bg-white/5"><Icon size={120} strokeWidth={.8} className="text-[#c7f36b]" /></div></div></div></section><section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2"><div><p className="section-kicker">{d.fitKicker}</p><h2 className="section-title mt-4">{d.fitTitle[0]}<br />{d.fitTitle[1]}</h2><p className="mt-6 max-w-xl leading-8 text-muted-foreground">{service.longDescription}</p></div><div className="rounded-3xl border bg-card p-8"><h3 className="text-xl font-semibold">{d.helpTitle}</h3><ul className="mt-7 space-y-4">{service.features.map(feature=><li key={feature} className="flex gap-3 text-sm"><Check size={17} className="shrink-0 text-primary" />{feature}</li>)}</ul><div className="mt-8 flex flex-wrap justify-between gap-4 border-t pt-6 text-sm"><span className="font-semibold">{service.price}</span><span className="text-muted-foreground">{service.deliveryTime}</span></div></div></section><section className="journey-section px-5 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><p className="section-kicker">{d.stepsKicker}</p><h2 className="section-title mt-4">{d.stepsTitle}</h2><div className="mt-12 grid gap-8 md:grid-cols-3">{d.steps.map((step,i)=><div key={step.title} className="border-t pt-6"><span className="font-mono text-xs text-muted-foreground">0{i+1}</span><h3 className="mt-5 text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p></div>)}</div></div></section><section className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><h2 className="text-2xl font-semibold tracking-tight">{d.otherTitle}</h2><div className="mt-8 grid gap-4 md:grid-cols-3">{getServiceList(t).filter(s=>s.slug!==slug).map(s=><Link key={s.slug} href={`/services/${s.slug}`} className="service-tile flex items-center justify-between gap-4"><span className="font-semibold">{s.name}</span><ArrowUpRight size={20} /></Link>)}</div></section></main><SiteFooter /></div>;
}
