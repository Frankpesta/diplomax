import { describe, it, expect } from "vitest";
import { countryFromHeaders, detectLocale, primaryLanguage } from "@/i18n/detect";
import { format } from "@/i18n/format";
import { en } from "@/i18n/dictionaries/en";
import { tr } from "@/i18n/dictionaries/tr";
import { getService, getServiceList } from "@/data/services";
import { contactSchema } from "@convex/lib/contactPolicy";

describe("detectLocale", () => {
  it("serves Turkish to visitors in Turkey", () => {
    expect(detectLocale({ country: "TR" })).toBe("tr");
    expect(detectLocale({ country: "tr", acceptLanguage: "en-US" })).toBe("tr");
  });

  it("serves English to visitors elsewhere, even with a Turkish browser", () => {
    expect(detectLocale({ country: "DE", acceptLanguage: "tr-TR" })).toBe("en");
  });

  it("lets an explicit cookie choice override geo detection", () => {
    expect(detectLocale({ cookie: "en", country: "TR" })).toBe("en");
    expect(detectLocale({ cookie: "tr", country: "US" })).toBe("tr");
  });

  it("ignores invalid cookie values", () => {
    expect(detectLocale({ cookie: "fr", country: "TR" })).toBe("tr");
  });

  it("falls back to Accept-Language when no geo header is present", () => {
    expect(detectLocale({ acceptLanguage: "tr-TR,tr;q=0.9,en;q=0.8" })).toBe("tr");
    expect(detectLocale({ acceptLanguage: "en-GB,tr;q=0.5" })).toBe("en");
    expect(detectLocale({})).toBe("en");
  });
});

describe("countryFromHeaders", () => {
  it("reads platform geo headers", () => {
    expect(countryFromHeaders(new Headers({ "x-vercel-ip-country": "TR" }))).toBe("TR");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "tr" }))).toBe("TR");
  });

  it("ignores unknown / Tor placeholders", () => {
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "T1" }))).toBeNull();
    expect(countryFromHeaders(new Headers())).toBeNull();
  });
});

describe("primaryLanguage", () => {
  it("respects q-values", () => {
    expect(primaryLanguage("en;q=0.4,tr;q=0.9")).toBe("tr");
    expect(primaryLanguage("*")).toBeNull();
    expect(primaryLanguage(null)).toBeNull();
  });
});

describe("dictionaries", () => {
  function shape(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(shape);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
    return typeof value;
  }

  it("Turkish has the same structure as English", () => {
    // Status maps are open-ended (Turkish covers extra common statuses), so compare them separately.
    const withoutStatuses = (d: typeof en) => ({ ...d, statuses: {} });
    expect(shape(withoutStatuses(tr))).toEqual(shape(withoutStatuses(en)));
  });

  it("translates every status that has a dedicated style", () => {
    for (const status of Object.keys(en.statuses)) expect(tr.statuses[status]).toBeTruthy();
  });

  it("keeps placeholders intact in translations", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    const walk = (a: unknown, b: unknown) => {
      if (typeof a === "string") expect(placeholders(b as string)).toEqual(placeholders(a));
      else if (a && typeof a === "object") for (const key of Object.keys(a)) walk((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]);
    };
    walk(en, tr);
  });

  it("offers a label for every contact subject the backend accepts", () => {
    for (const subject of contactSchema.shape.subject.options) {
      expect(en.contact.subjects[subject]).toBeTruthy();
      expect(tr.contact.subjects[subject]).toBeTruthy();
    }
  });
});

describe("services", () => {
  it("localizes service copy", () => {
    expect(getService(tr, "express")?.name).toBe("Ekspres Teslimat");
    expect(getService(en, "express")?.name).toBe("Express Delivery");
    expect(getService(en, "unknown")).toBeUndefined();
    expect(getService(en, "toString")).toBeUndefined();
    expect(getServiceList(tr).map(s => s.slug)).toEqual(["express", "standard", "freight", "international"]);
  });
});

describe("format", () => {
  it("fills placeholders", () => {
    expect(format("© {year} X", { year: 2026 })).toBe("© 2026 X");
    expect(format("{missing}", {})).toBe("{missing}");
  });
});
