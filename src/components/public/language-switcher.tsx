"use client";

import { useTransition } from "react";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { useI18n } from "@/i18n/provider";

/** Segmented EN / TR control. Choosing a language stores it in a cookie, which overrides geo detection. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={t.language.label} className={cn("inline-flex h-10 items-center gap-0.5 rounded-lg border bg-card p-1", className)}>
      {pending ? <Loader2 className="mx-1 h-3.5 w-3.5 animate-spin text-muted-foreground" aria-hidden /> : <Languages className="mx-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
      {LOCALES.map(code => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          title={t.language.names[code]}
          disabled={pending}
          onClick={() => { if (code !== locale) startTransition(() => setLocale(code)); }}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-bold transition-colors disabled:cursor-wait",
            locale === code ? "bg-brand-forest text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="sr-only">{t.language.names[code]}</span>
          <span aria-hidden>{t.language.short[code]}</span>
        </button>
      ))}
    </div>
  );
}
