import { DEFAULT_LOCALE, TURKISH_COUNTRIES, isLocale, type Locale } from "./config";

/**
 * Geo headers set by common hosting platforms / CDNs, in priority order.
 * Vercel, Cloudflare, AWS CloudFront, Netlify (via x-country) and generic proxies.
 */
export const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country",
  "x-country-code",
] as const;

export function countryFromHeaders(headers: Pick<Headers, "get">): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    // Cloudflare uses "XX" (unknown) and "T1" (Tor) — not real countries.
    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX" && value !== "T1") return value;
  }
  return null;
}

/** Returns the visitor's most preferred language tag's primary subtag, e.g. "tr" for "tr-TR,tr;q=0.9". */
export function primaryLanguage(acceptLanguage: string | null | undefined): string | null {
  if (!acceptLanguage) return null;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map(p => p.trim()).find(p => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter(entry => entry.tag && entry.tag !== "*" && Number.isFinite(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  return ranked[0]?.tag.split("-")[0] ?? null;
}

/**
 * Resolves the locale for a request:
 * 1. An explicit choice stored in the locale cookie.
 * 2. The visitor's country from the hosting platform's geo-IP header (Turkey → Turkish).
 * 3. When no geo information is available (e.g. local dev), the browser's preferred language.
 */
export function detectLocale({
  cookie,
  country,
  acceptLanguage,
}: {
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(cookie)) return cookie;
  if (country) return TURKISH_COUNTRIES.has(country.toUpperCase()) ? "tr" : DEFAULT_LOCALE;
  return primaryLanguage(acceptLanguage) === "tr" ? "tr" : DEFAULT_LOCALE;
}
