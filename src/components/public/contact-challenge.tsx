"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useI18n } from "@/i18n/provider";
type TurnstileApi = {
  render(element: HTMLElement, options: { sitekey: string; action: string; theme: string; language: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }): string;
  remove(id: string): void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
export function ContactChallenge({ onToken }: { onToken: (token: string) => void }) {
  const { locale, t } = useI18n();
  const element = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => { callback.current = onToken; }, [onToken]);
  useEffect(() => {
    if (!ready || !sitekey || !element.current || !window.turnstile) return;
    const api = window.turnstile;
    const id = api.render(element.current, {
      sitekey, action: "contact", theme: "auto", language: locale,
      callback: token => { setError(false); callback.current(token); },
      "expired-callback": () => callback.current(""),
      "error-callback": () => { callback.current(""); setError(true); },
    });
    return () => api.remove(id);
  }, [ready, sitekey, locale]);
  if (!sitekey) return <p role="status" className="text-sm text-muted-foreground">{t.contact.challengeUnavailable}</p>;
  return <div>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setError(true)} />
    <div ref={element} />
    {error && <p role="alert" className="text-sm text-destructive">{t.contact.challengeError}</p>}
  </div>;
}
