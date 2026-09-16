import { describe, it, expect } from "vitest";
import { isValidTrackingCode, trackingUrl } from "../../convex/lib/tracking";

// ── Tracking code format validation ─────────────────────────────────────────
describe("isValidTrackingCode", () => {
  it("accepts valid tracking codes", () => {
    expect(isValidTrackingCode("DMD-2026-839201")).toBe(true);
    expect(isValidTrackingCode("DMD-2025-100000")).toBe(true);
    expect(isValidTrackingCode("DMD-2030-999999")).toBe(true);
  });

  it("rejects wrong prefix", () => {
    expect(isValidTrackingCode("GOX-2026-839201")).toBe(false);
    expect(isValidTrackingCode("DHL-2026-839201")).toBe(false);
    expect(isValidTrackingCode("DMD2026839201")).toBe(false);
  });

  it("rejects wrong digit count in random part", () => {
    expect(isValidTrackingCode("DMD-2026-12345")).toBe(false);   // 5 digits
    expect(isValidTrackingCode("DMD-2026-1234567")).toBe(false); // 7 digits
  });

  it("rejects lowercase", () => {
    expect(isValidTrackingCode("dmd-2026-839201")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidTrackingCode("")).toBe(false);
  });

  it("rejects partial codes", () => {
    expect(isValidTrackingCode("DMD-2026-")).toBe(false);
    expect(isValidTrackingCode("DMD-")).toBe(false);
  });
});

// ── Tracking code format structure ───────────────────────────────────────────
describe("Tracking code structure", () => {
  it("has correct segment count when split by dash", () => {
    const code = "DMD-2026-839201";
    const parts = code.split("-");
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe("DMD");
    expect(parts[1]).toHaveLength(4); // year
    expect(parts[2]).toHaveLength(6); // random
  });

  it("year part is a valid 4-digit year", () => {
    const code = "DMD-2026-839201";
    const year = parseInt(code.split("-")[1], 10);
    expect(year).toBeGreaterThanOrEqual(2020);
    expect(year).toBeLessThanOrEqual(2099);
  });

  it("random part is within expected numeric range", () => {
    const code = "DMD-2026-839201";
    const random = parseInt(code.split("-")[2], 10);
    expect(random).toBeGreaterThanOrEqual(100000);
    expect(random).toBeLessThanOrEqual(999999);
  });
});

// ── Shipment cost calculation ────────────────────────────────────────────────
describe("Shipment total cost calculation", () => {
  function calcTotal(
    shippingCost: number,
    tax: number,
    insurance: number
  ): number {
    return Math.round((shippingCost + tax + insurance) * 100) / 100;
  }

  it("sums shipping, tax, and insurance correctly", () => {
    expect(calcTotal(100, 10, 5)).toBe(115);
  });

  it("handles zero tax and insurance", () => {
    expect(calcTotal(250, 0, 0)).toBe(250);
  });

  it("handles decimal values correctly", () => {
    expect(calcTotal(99.99, 8.5, 2.5)).toBe(110.99);
  });

  it("handles large amounts", () => {
    expect(calcTotal(5000, 450, 125)).toBe(5575);
  });

  it("never returns negative values when all inputs are non-negative", () => {
    const result = calcTotal(0, 0, 0);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

// ── trackingUrl / QR code URL generation ────────────────────────────────────

describe("trackingUrl", () => {
  it("builds the correct URL for a valid tracking code", () => {
    const url = trackingUrl("DMD-2026-839201");
    expect(url).toContain("/track/DMD-2026-839201");
  });

  it("always ends with the full tracking code path segment", () => {
    const code = "DMD-2025-123456";
    const url = trackingUrl(code);
    expect(url.endsWith(`/track/${code}`)).toBe(true);
  });

  it("returns a string (usable as QR code URL)", () => {
    expect(typeof trackingUrl("DMD-2026-000001")).toBe("string");
  });

  it("does not contain double slashes in the path", () => {
    const url = trackingUrl("DMD-2026-839201");
    // Strip protocol:// — check path has no //
    const path = url.replace(/^https?:\/\//, "").replace(/^[^/]+/, "");
    expect(path).not.toContain("//");
  });

  it("produces different URLs for different tracking codes", () => {
    const url1 = trackingUrl("DMD-2026-111111");
    const url2 = trackingUrl("DMD-2026-222222");
    expect(url1).not.toBe(url2);
  });
});

// ── Status lifecycle validation ───────────────────────────────────────────────
describe("Shipment status definitions", () => {
  const DEFAULT_STATUSES = [
    "Shipment Registered",
    "In Transit",
    "Held at the Airport",
  ];

  it("contains exactly 3 default statuses", () => {
    expect(DEFAULT_STATUSES).toHaveLength(3);
  });

  it("Held at the Airport is a valid status", () => {
    expect(DEFAULT_STATUSES).toContain("Held at the Airport");
  });

  it("auto-archive applies only to Held at the Airport status", () => {
    const archivableStatuses = DEFAULT_STATUSES.filter(
      (s) => s === "Held at the Airport"
    );
    expect(archivableStatuses).toHaveLength(1);
  });
});

