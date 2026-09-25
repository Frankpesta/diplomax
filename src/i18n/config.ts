export const LOCALES = ["en", "tr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie holding an explicit language choice. It always wins over detection. */
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Countries whose visitors are served Turkish by default (ISO 3166-1 alpha-2). */
export const TURKISH_COUNTRIES = new Set(["TR"]);

/** BCP 47 tags used for `Intl` date/number formatting. */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", tr: "tr-TR" };
export const OG_LOCALE: Record<Locale, string> = { en: "en_GB", tr: "tr_TR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
