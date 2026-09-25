import { cache } from "react";
import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./config";
import { countryFromHeaders, detectLocale } from "./detect";
import { en, type Dictionary } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";

const DICTIONARIES: Record<Locale, Dictionary> = { en, tr };

/** Locale for the current request. Memoised so layouts and metadata share one lookup. */
export const getLocale = cache(async (): Promise<Locale> => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return detectLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    country: countryFromHeaders(headerList),
    acceptLanguage: headerList.get("accept-language"),
  });
});

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
