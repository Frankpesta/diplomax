"use client";

import { createContext, useContext } from "react";
import { INTL_LOCALE, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

interface I18nContextValue {
  locale: Locale;
  /** BCP 47 tag for Intl formatting, e.g. "tr-TR". */
  intlLocale: string;
  t: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Receives only the active dictionary from the server, so each visitor downloads one language. */
export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ locale, intlLocale: INTL_LOCALE[locale], t: dictionary }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
