"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Brand() {
  return <Logo height={36} />;
}

export function NavHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 shadow-[0_10px_35px_rgba(7,22,45,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Diplomaxdelivery home">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border bg-white/70 p-1 shadow-sm md:flex dark:bg-white/5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                pathname === link.href
                  ? "bg-brand-forest text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            className="grid h-10 w-10 place-items-center rounded-lg border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <Link
            href="/#track"
            className="hidden items-center gap-2 rounded-lg bg-brand-lime px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-sm transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            <Search className="h-4 w-4" />
            Track
          </Link>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg border bg-card md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t bg-background px-4 py-4 shadow-xl md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#track"
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-brand-lime px-4 py-3 text-sm font-extrabold text-slate-950"
              onClick={() => setMobileOpen(false)}
            >
              <Search className="h-4 w-4" />
              Track Package
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

