"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { NavHeader } from "@/components/public/nav-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SERVICE_LIST } from "@/data/services";
import { ArrowRight, CheckCircle2, Globe, Package, Truck, Zap } from "lucide-react";

const ICONS: Record<string, import("lucide-react").LucideIcon> = { Zap, Package, Truck, Globe };
const SERVICE_PHOTOS = [
  "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=85",
];

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />

      <section className="secondary-hero bg-brand-forest px-5 py-16 text-white sm:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div>
            <p className="mb-3 text-sm font-black uppercase text-brand-lime">
              What We Offer
            </p>
            <h1 className="text-5xl font-medium leading-[1.08] tracking-[-.05em] sm:text-6xl">
              Shipping services for every need
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              From urgent express delivery to full container freight, every
              service is designed around visibility, speed, and careful handling.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-72 overflow-hidden rounded-xl">
              <Image
                src={SERVICE_PHOTOS[0]}
                alt="Courier delivery service"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 h-72 overflow-hidden rounded-xl">
              <Image
                src={SERVICE_PHOTOS[2]}
                alt="Freight logistics service"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-16">
          {SERVICE_LIST.map((svc, i) => {
            const Icon = ICONS[svc.icon] ?? Package;
            const isEven = i % 2 === 0;
            return (
              <FadeUp key={svc.slug}>
                <div className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}>
                  <div className="relative min-h-[320px] overflow-hidden rounded-xl shadow-xl">
                    <Image
                      src={SERVICE_PHOTOS[i]}
                      alt={`${svc.name} operation`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-950/5" />
                    <div className="absolute bottom-0 p-8 text-white">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-2xl font-black text-brand-lime">{svc.price}</div>
                      <div className="mt-1 text-sm text-white/70">{svc.deliveryTime}</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="mb-1.5 text-xs font-black uppercase text-brand-lime">
                        {svc.tagline}
                      </p>
                      <h2 className="text-3xl font-black">{svc.name}</h2>
                    </div>
                    <p className="leading-8 text-muted-foreground">{svc.longDescription}</p>
                    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {svc.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm font-semibold">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-lime" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-forest px-5 py-3 text-sm font-black text-white transition-transform hover:-translate-y-0.5"
                    >
                      View full details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </section>

      <section className="bg-muted/45 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <FadeUp className="mb-10 text-center">
            <h2 className="text-3xl font-black">Compare services</h2>
            <p className="mt-2 text-muted-foreground">
              Find the right service for your shipment size and timeline.
            </p>
          </FadeUp>
          <FadeUp>
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand-forest text-white">
                    <tr>
                      <th className="px-5 py-4 text-left font-black">Feature</th>
                      {SERVICE_LIST.map((service) => (
                        <th key={service.slug} className="px-4 py-4 text-center font-black">
                          {service.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["Delivery Time", "1-2 days", "3-5 days", "Varies", "3-14 days"],
                      ["Starting Price", "$29.99", "$9.99", "Custom", "$49.99"],
                      ["Real-time Tracking", "Yes", "Yes", "Yes", "Yes"],
                      ["Insurance Included", "Yes", "Yes", "Yes", "Yes"],
                      ["Customs Handling", "No", "No", "Yes", "Yes"],
                    ].map(([feature, ...values]) => (
                      <tr key={feature} className="hover:bg-muted/35">
                        <td className="px-5 py-4 font-bold text-muted-foreground">{feature}</td>
                        {values.map((value, index) => (
                          <td key={index} className="px-4 py-4 text-center font-semibold">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6">
        <FadeUp>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black">Not sure which service fits?</h2>
            <p className="mt-3 text-muted-foreground">
              Our logistics team will help you choose the right option for your shipment.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="rounded-lg bg-brand-lime px-6 py-3 text-sm font-black text-slate-950">
                Talk to an Expert
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      <SiteFooter />
    </div>
  );
}
