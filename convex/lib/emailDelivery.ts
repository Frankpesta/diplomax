export class EmailDeliveryError extends Error {
  constructor(public readonly retryable: boolean, message: string) { super(message); }
}
export function senderAddress() {
  const address = process.env.EMAIL_FROM;
  if (!address) throw new EmailDeliveryError(false, "Email sender is not configured");
  return address;
}
export async function sendEmail(message: { from: string; to: string[]; subject: string; html: string; reply_to?: string }, idempotencyKey?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailDeliveryError(false, "Email service is not configured");
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}) },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new EmailDeliveryError(true, "Email provider could not be reached"); }
  const data: { id?: string; error?: unknown } = await response.json().catch(() => ({}));
  if (!response.ok || data.error || !data.id) {
    // Never persist provider response bodies, credentials, or recipient details in errors.
    throw new EmailDeliveryError(response.status === 429 || response.status >= 500 || response.status === 408 || response.ok,
      `Email provider did not accept the message (HTTP ${response.status})`);
  }
  return data.id;
}
export function retryDelay(attempt: number) { return [60_000, 300_000, 900_000][attempt - 1]; }
