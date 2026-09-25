"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, ArrowRight, Package, Globe2, Truck, Zap, Search, ShieldCheck, MapPin, Check, Headphones } from "lucide-react";
import { NavHeader } from "@/components/public/nav-header";
import { SiteFooter } from "@/components/public/site-footer";
import { getServiceList } from "@/data/services";
import { useI18n } from "@/i18n/provider";
import { isValidTrackingCode } from "../../../convex/lib/tracking";
const DeliveryGlobe = dynamic(() => import("@/components/public/delivery-globe"), { ssr: false });
const icons: Record<string, import("lucide-react").LucideIcon> = { Zap, Package, Truck, Globe: Globe2 };
function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const { t } = useI18n();
  const h = t.home;
  function track(event: React.FormEvent) {
    event.preventDefault();
    const value = code.trim().toUpperCase();
    if (!isValidTrackingCode(value)) { setError(value ? h.errorFormat : h.errorEmpty); return; }
    setError(""); router.push(`/track/${value}`);
  }
  return <div className="landing min-h-screen"><NavHeader /><main>
    <section className="delivery-hero"><div className="hero-grid mx-auto max-w-7xl px-5 sm:px-8">
      <div className="relative z-10 py-16 lg:py-24"><div className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[#c7f36b]" /> {h.eyebrow}</div>
        <h1 className="mt-8 text-[clamp(3.5rem,6.5vw,6.2rem)] font-semibold leading-[1.02] tracking-[-.065em]">{h.heroTitle[0]}<br />{h.heroTitle[1]}<span className="text-[#c7f36b]">.</span></h1>
        <p className="mt-7 max-w-md text-base leading-7 text-white/65">{h.heroText}</p>
        <div className="mt-9 flex flex-wrap items-center gap-5"><Link href="/contact" className="pill-button lime">{h.heroCta} <ArrowUpRight size={18} /></Link><Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-white/80">{h.heroSecondary} <ArrowRight size={16} /></Link></div>
        <div className="mt-12 flex flex-wrap gap-6 text-xs text-white/65"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#c7f36b]" /> {h.badgeCare}</span><span className="flex items-center gap-2"><MapPin size={16} className="text-[#c7f36b]" /> {h.badgeVisibility}</span></div>
      </div>
      <div className="globe-stage relative"><div className="absolute inset-[-7%] lg:inset-[-12%]"><DeliveryGlobe /></div><div className="orbit-label orbit-label-top"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#c7f36b] text-[#123d32]"><Globe2 size={18} /></span><div><b>{h.orbitTopTitle}</b><small>{h.orbitTopText}</small></div></div><div className="orbit-label orbit-label-bottom"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Package size={18} /></span><div><b>{h.orbitBottomTitle}</b><small>{h.orbitBottomText}</small></div><Check size={18} className="ml-3 text-[#c7f36b]" /></div><div className="absolute bottom-5 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-[.3em] text-white/40">{h.globeCaption}</div></div>
    </div></section>
    <section id="track" className="tracking-strip scroll-mt-24"><div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[.8fr_1.2fr]"><div className="flex items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-current/15"><Package size={23} /></span><div><h2 className="text-xl font-semibold tracking-tight">{h.trackTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{h.trackText}</p></div></div><form onSubmit={track} className="min-w-0"><div className="flex gap-2 rounded-2xl border bg-card p-2 shadow-sm"><label htmlFor="tracking-code" className="sr-only">{h.trackLabel}</label><input id="tracking-code" autoComplete="off" value={code} onChange={e => { setCode(e.target.value); setError(""); }} placeholder={h.trackPlaceholder} aria-invalid={!!error} aria-describedby={error ? "tracking-error" : undefined} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" /><button className="pill-button forest !rounded-xl !px-5"><Search size={16} /><span className="hidden sm:inline">{h.trackButton}</span><span className="sm:hidden">{h.trackButtonShort}</span></button></div>{error && <p id="tracking-error" role="alert" className="mt-2 text-sm text-red-600">{error}</p>}{params.get("rateLimited") === "1" && <p role="alert" className="mt-2 text-sm text-red-600">{h.rateLimited}</p>}</form></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="section-kicker">{h.servicesKicker}</p><h2 className="section-title mt-4">{h.servicesTitle[0]}<br />{h.servicesTitle[1]}</h2></div><p className="max-w-sm text-sm leading-7 text-muted-foreground">{h.servicesText}</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{getServiceList(t).map((service, index) => { const Icon = icons[service.icon] ?? Package; return <Link key={service.slug} href={`/services/${service.slug}`} className="service-tile group"><div className="flex items-start justify-between"><span className="service-icon"><Icon size={26} strokeWidth={1.5} /></span><span className="font-mono text-xs opacity-40">0{index + 1}</span></div><h3 className="mt-10 text-xl font-semibold tracking-tight">{service.name}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{service.description}</p><div className="mt-7 flex items-center justify-between border-t pt-5 text-sm font-semibold"><span>{h.exploreService}</span><ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></Link>; })}</div></section>
    <section className="journey-section px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center"><div className="journey-art"><span className="section-kicker">{h.journeyKicker}</span><div className="journey-path"><div className="journey-stop"><Package size={22} /><span>{h.journeyStops[0]}</span><Check size={16} /></div><div className="journey-stop"><Truck size={22} /><span>{h.journeyStops[1]}</span><Check size={16} /></div><div className="journey-stop"><MapPin size={22} /><span>{h.journeyStops[2]}</span><Check size={16} /></div></div><p className="text-xs text-muted-foreground">{h.journeyCaption}</p></div><div><p className="section-kicker">{h.careKicker}</p><h2 className="section-title mt-4">{h.careTitle[0]}<br />{h.careTitle[1]}</h2><div className="mt-9 space-y-7">{[MapPin, ShieldCheck, Headphones].map((icon, i) => ({ icon, ...h.careItems[i] })).map(item => <div key={item.title} className="flex gap-4"><item.icon size={21} className="mt-1 shrink-0 text-primary" /><div><h3 className="font-semibold">{item.title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{item.text}</p></div></div>)}</div></div></div></section>
    <section className="px-5 py-20 sm:px-8"><div className="shipping-cta mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-[2rem] p-8 sm:p-14 lg:flex-row lg:items-center"><div><p className="section-kicker !text-[#c7f36b]">{h.ctaKicker}</p><h2 className="mt-4 text-4xl font-medium tracking-[-.045em] sm:text-5xl">{h.ctaTitle[0]}<br />{h.ctaTitle[1]}</h2></div><Link href="/contact" className="pill-button lime">{h.ctaButton} <ArrowUpRight size={20} /></Link></div></section>
  </main><SiteFooter /></div>;
}
export default function HomePage() { return <Suspense fallback={<div className="min-h-screen bg-[#123d32]" />}><Home /></Suspense>; }
