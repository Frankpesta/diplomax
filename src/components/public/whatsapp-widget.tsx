"use client";

import { useI18n } from "@/i18n/provider";
import { whatsappUrl } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/public/whatsapp-icon";

/**
 * Floating WhatsApp launcher, pinned bottom-left so it never collides with the
 * Chatway live-chat launcher in the bottom-right corner.
 */
export function WhatsAppWidget() {
  const { t } = useI18n();
  return (
    <a
      href={whatsappUrl(t.whatsapp.message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.label}
      className="group fixed z-[60] flex items-center print:hidden left-[max(1.25rem,env(safe-area-inset-left))] bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform duration-200 group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-[#25D366]/40">
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-[whatsapp-pulse_2.4s_ease-out_infinite]" aria-hidden="true" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
      <span className="pointer-events-none ml-3 hidden -translate-x-2 whitespace-nowrap rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground opacity-0 shadow-lg ring-1 ring-border transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 sm:block">
        {t.whatsapp.tooltip}
      </span>
    </a>
  );
}
