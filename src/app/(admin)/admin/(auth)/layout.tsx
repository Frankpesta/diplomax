import Link from "next/link";
import Image from "next/image";
import { BarChart3, Globe2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

const AUTH_PHOTO =
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1200&q=85";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-brand-forest text-white lg:block">
        <Image
          src={AUTH_PHOTO}
          alt="Warehouse operations dashboard"
          fill
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(18,61,50,0.96),rgba(18,61,50,0.82)_55%,rgba(199,243,107,0.25))]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/">
            <Logo variant="light" height={40} />
          </Link>

          <div className="max-w-xl">
            <p className="mb-4 text-sm font-black uppercase text-brand-lime">
              Admin operations portal
            </p>
            <h1 className="text-5xl font-medium leading-tight tracking-[-.04em]">
              Control every shipment from one secure desk.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/68">
              Manage bookings, timelines, shipment exceptions, analytics, and
              audit logs with a focused logistics command center.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, label: "Secure access" },
              { icon: BarChart3, label: "Live metrics" },
              { icon: Globe2, label: "Global routes" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur">
                <Icon className="mb-3 h-5 w-5 text-brand-lime" />
                <div className="text-sm font-black">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        {children}
      </main>
    </div>
  );
}

