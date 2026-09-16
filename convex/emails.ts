"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { createHash } from "node:crypto";
import { internal } from "./_generated/api";
import { EmailDeliveryError, sendEmail, senderAddress } from "./lib/emailDelivery";
import { contactSchema, verifyContactChallenge } from "./lib/contactPolicy";
import { render } from "@react-email/render";
import React from "react";
import { StatusEmail } from "./email_templates/status_email";
import { ContactEmail } from "./email_templates/contact_email";

import { getStatusStyle } from "./lib/statusStyles";

// ─── Template helpers — kept for unit tests ───────────────────────────────────

export interface StatusEmailContent {
  subject: string;
  heading: string;
  bodyHtml: string;
}

/** Pure function — safe to unit-test without Resend or react-email. */
export function getStatusEmailContent(
  status: string,
  recipientName: string,
  trackingCode: string,
  opts: {
    estimatedDeliveryDate?: string;
    senderCity?: string;
    receiverCity?: string;
  } = {}
): StatusEmailContent {
  type Copy = { subject: string; heading: string; detail: string };

  const STATUS_COPY: Record<string, Copy> = {
    "Shipment Registered": {
      subject: `Shipment Registered — ${trackingCode}`,
      heading: "Your shipment has been registered",
      detail: "We've registered your shipment. Use your tracking number at any time to see real-time status updates.",
    },
    "In Transit": {
      subject: `In Transit — ${trackingCode}`,
      heading: "Your shipment is on its way",
      detail: "Your package is actively moving through our logistics network toward its destination.",
    },
    "Held at the Airport": {
      subject: `Held at the Airport — ${trackingCode}`,
      heading: "Your shipment is being held at the airport",
      detail: "Your package is currently held at an airport facility. We'll notify you as soon as it clears and continues its journey.",
    },
  };

  const copy: Copy = STATUS_COPY[status] ?? {
    subject: `Shipment Update — ${trackingCode}`,
    heading: `Status update: ${status}`,
    detail: "There has been an update to your shipment. Check the tracking page for the latest information.",
  };

  const cfg = { ...copy, accent: getStatusStyle(status).hex };

  const routeLine =
    opts.senderCity && opts.receiverCity
      ? `<p style="margin:6px 0 0;font-size:13px;color:#64748b;">${opts.senderCity} &rarr; ${opts.receiverCity}</p>`
      : "";

  const deliveryLine = opts.estimatedDeliveryDate
    ? `<p style="margin:6px 0 0;font-size:13px;color:#64748b;">Estimated delivery: <strong style="color:#1e293b">${opts.estimatedDeliveryDate}</strong></p>`
    : "";

  const bodyHtml = `
<p style="margin:0;font-size:15px;color:#1e293b;">
  Dear <strong>${recipientName}</strong>,
</p>
<div style="margin:20px 0;padding:18px 20px;background:#f8fafc;border-left:4px solid ${cfg.accent};border-radius:0 8px 8px 0;">
  <h2 style="margin:0;font-size:17px;color:${cfg.accent};font-weight:700;">${cfg.heading}</h2>
  ${routeLine}
  ${deliveryLine}
</div>
<p style="margin:0;font-size:14px;color:#475569;line-height:1.75;">${cfg.detail}</p>
`.trim();

  return { subject: cfg.subject, heading: cfg.heading, bodyHtml };
}

// ─── Internal action ─────────────────────────────────────────────────────────

export const deliverNotification = internalAction({
  args: { jobId: v.id("notificationJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runMutation(internal.notificationJobs.claim, { jobId });
    if (!job) return;
    let result: { providerId?: string; error?: string; retryable: boolean };
    try {
      if (!job.from) throw new EmailDeliveryError(false, "Email sender is not configured");
      const html = await render(React.createElement(StatusEmail, {
        trackingCode: job.trackingCode, status: job.shipmentStatus,
        statusHistory: job.statusHistory, publicUrl: job.publicUrl,
        senderCity: job.senderCity, receiverCity: job.receiverCity,
        estimatedDeliveryDate: job.estimatedDeliveryDate,
        recipientName: job.recipientName, isReceiver: job.isReceiver,
      }));
      const { subject } = getStatusEmailContent(job.shipmentStatus, "", job.trackingCode);
      const providerId = await sendEmail({ from: job.from, to: [job.recipient], subject, html }, `dmd-notification-${jobId}`);
      result = { providerId, retryable: false };
    } catch (error) {
      result = { error: error instanceof EmailDeliveryError ? error.message : "Unable to prepare the email", retryable: error instanceof EmailDeliveryError && error.retryable };
    }
    // Kept outside the catch: a database failure must leave the lease recoverable,
    // not overwrite a successful provider acceptance with a generic failure.
    await ctx.runMutation(internal.notificationJobs.finish, { jobId, attempt: job.attempts, ...result });
  },
});

export const sendContactEmail = action({
  args: { name: v.string(), email: v.string(), subject: v.string(), message: v.string(), turnstileToken: v.string() },
  handler: async (ctx, args): Promise<{ accepted: true }> => {
    const parsed = contactSchema.safeParse(args);
    if (!parsed.success) throw new Error("Please check your contact details and message length");
    const { turnstileToken, ...message } = parsed.data;
    const from = senderAddress();
    await verifyContactChallenge(turnstileToken);
    const allowed = await ctx.runMutation(internal.contactLimits.consume, { emailHash: createHash("sha256").update(message.email).digest("hex") });
    if (!allowed) throw new Error("Too many messages. Please try again later.");
    const html = await render(React.createElement(ContactEmail, message));
    await sendEmail({ from, to: [process.env.SUPPORT_EMAIL ?? "support@diplomaxdelivery.com"], reply_to: message.email, subject: `[Contact] ${message.subject}`, html });
    return { accepted: true };
  },
});
