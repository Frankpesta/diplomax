import type { QueryCtx } from "../_generated/server";

/** Generates a unique tracking code in the format DMD-YYYY-NNNNNN */
export async function generateTrackingCode(ctx: QueryCtx): Promise<string> {
  const year = new Date().getFullYear();
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const random = Math.floor(100000 + Math.random() * 900000);
    const code = `DMD-${year}-${random}`;
    const existing = await ctx.db
      .query("shipments")
      .withIndex("by_tracking_code", (q) => q.eq("trackingCode", code))
      .first();
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique tracking code after max attempts");
}

/** Returns the public tracking URL for a given tracking code */
export function trackingUrl(trackingCode: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://diplomaxdelivery.com";
  return `${base}/track/${trackingCode}`;
}

/** Pure tracking code format validator — no DB access, usable in tests */
export function isValidTrackingCode(code: string): boolean {
  return /^DMD-\d{4}-\d{6}$/.test(code);
}
