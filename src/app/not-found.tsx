import Link from "next/link";
import { Home, Search, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you&apos;re looking for doesn't exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <Logo height={36} />
      </Link>

      {/* 404 */}
      <div
        className="text-[120px] font-extrabold leading-none mb-4"
        style={{ color: "#245b45" }}
      >
        404
      </div>

      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        The page you&apos;re looking for has moved, been deleted, or never existed.
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border font-semibold px-5 py-2.5 rounded-xl hover:bg-accent transition-colors"
        >
          <Search className="h-4 w-4" />
          Track a Package
        </Link>
      </div>

      {/* Quick links */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        {[
          ["Services", "/services"],
          ["About Us", "/about"],
          ["Contact", "/contact"],
          ["Admin Portal", "/admin/login"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            {label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}

