import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  subject: z.enum(["General Enquiry", "Track a Shipment", "Sales & Pricing", "Partnership", "Technical Support", "Other"]),
  message: z.string().trim().min(10).max(5000),
  turnstileToken: z.string().min(1).max(2048),
});
export async function verifyContactChallenge(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Contact verification is not configured");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token }), signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("Contact verification is unavailable");
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "diplomaxdelivery.com,www.diplomaxdelivery.com").split(",").map(host => host.trim());
  if (result.success !== true || result.action !== "contact" || !result.hostname || !hosts.includes(result.hostname)) {
    throw new Error("Contact verification failed. Please try again.");
  }
}
