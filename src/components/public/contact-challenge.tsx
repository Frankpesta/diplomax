"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
type TurnstileApi = {
  render(element: HTMLElement, options: { sitekey: string; action: string; theme: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }): string;
  remove(id: string): void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
export function ContactChallenge({ onToken }: { onToken: (token: string) => void }) {
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
      sitekey, action: "contact", theme: "auto",
      callback: token => { setError(false); callback.current(token); },
      "expired-callback": () => callback.current(""),
      "error-callback": () => { callback.current(""); setError(true); },
    });
    return () => api.remove(id);
  }, [ready, sitekey]);
  if (!sitekey) return <p role="status" className="text-sm text-muted-foreground">The contact form is currently unavailable. Please email support@diplomaxdelivery.com.</p>;
  return <div>
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setError(true)} />
    <div ref={element} />
    {error && <p role="alert" className="text-sm text-destructive">Verification could not load. Please refresh the page or contact us by email.</p>}
  </div>;
}
