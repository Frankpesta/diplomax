import { internalMutation, query, mutation, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { requireAdmin } from "./lib/admin";
import { trackingUrl } from "./lib/tracking";
import { retryDelay } from "./lib/emailDelivery";

export async function queueShipmentEmails(ctx: MutationCtx, args: {
  shipmentId: Id<"shipments">; trackingCode: string; status: string;
  senderName: string; senderEmail: string; receiverName: string; receiverEmail: string;
  senderCity?: string; receiverCity?: string; estimatedDeliveryDate?: string;
  statusHistory?: { status: string; createdAt: string }[];
}) {
  const now = Date.now();
  for (const isReceiver of [false, true]) {
    const jobId = await ctx.db.insert("notificationJobs", {
      shipmentId: args.shipmentId, trackingCode: args.trackingCode, shipmentStatus: args.status,
      recipient: isReceiver ? args.receiverEmail : args.senderEmail,
      recipientName: isReceiver ? args.receiverName : args.senderName, isReceiver,
      senderCity: args.senderCity, receiverCity: args.receiverCity,
      estimatedDeliveryDate: args.estimatedDeliveryDate, statusHistory: args.statusHistory,
      from: process.env.EMAIL_FROM, publicUrl: trackingUrl(args.trackingCode),
      state: "queued", attempts: 0, createdAt: now, dueAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.emails.deliverNotification, { jobId });
  }
}
export const claim = internalMutation({
  args: { jobId: v.id("notificationJobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job || !["queued", "retrying"].includes(job.state) || job.dueAt > Date.now()) return null;
    // Resend retains idempotency keys for 24 hours. Never automatically resend an
    // ambiguous attempt after that window, when it could duplicate an accepted email.
    if (Date.now() - job.createdAt >= 23 * 60 * 60 * 1000) {
      await ctx.db.patch(jobId, { state: "failed", lastError: "Retry window expired; check the provider before sending a new notification" });
      return null;
    }
    const attempts = job.attempts + 1;
    await ctx.db.patch(jobId, { state: "sending", attempts, leaseUntil: Date.now() + 120_000 });
    return { ...job, attempts };
  },
});
export const finish = internalMutation({
  args: { jobId: v.id("notificationJobs"), attempt: v.number(), providerId: v.optional(v.string()), error: v.optional(v.string()), retryable: v.boolean() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.state !== "sending" || job.attempts !== args.attempt) return;
    if (args.providerId) {
      await ctx.db.patch(job._id, { state: "accepted", providerId: args.providerId, lastError: undefined, leaseUntil: undefined });
      return;
    }
    const delay = args.retryable ? retryDelay(job.attempts) : undefined;
    await ctx.db.patch(job._id, { state: delay ? "retrying" : "failed", lastError: args.error ?? "Email was not accepted", leaseUntil: undefined, dueAt: Date.now() + (delay ?? 0) });
    if (delay) await ctx.scheduler.runAfter(delay, internal.emails.deliverNotification, { jobId: job._id });
  },
});
export const recover = internalMutation({
  args: {},
  handler: async (ctx) => {
    const stale = await ctx.db.query("notificationJobs").withIndex("by_state_lease", q => q.eq("state", "sending").lt("leaseUntil", Date.now())).take(50);
    for (const job of stale) {
      const retry = job.attempts < 4;
      await ctx.db.patch(job._id, { state: retry ? "retrying" : "failed", dueAt: Date.now(), leaseUntil: undefined, lastError: "Email attempt interrupted; acceptance is unconfirmed" });
      if (retry) await ctx.scheduler.runAfter(0, internal.emails.deliverNotification, { jobId: job._id });
    }
    for (const state of ["queued", "retrying"] as const) {
      const due = await ctx.db.query("notificationJobs").withIndex("by_state_due", q => q.eq("state", state).lte("dueAt", Date.now())).take(50);
      for (const job of due) await ctx.scheduler.runAfter(0, internal.emails.deliverNotification, { jobId: job._id });
    }
  },
});
export const list = query({
  args: {},
  handler: async ctx => { await requireAdmin(ctx); return ctx.db.query("notificationJobs").withIndex("by_created").order("desc").take(100); },
});
// Retry with the SAME idempotency key and payload. Do not create a fresh email
// after an ambiguous failure; Resend may already have accepted the first request.
export const retry = mutation({
  args: { jobId: v.id("notificationJobs") },
  handler: async (ctx, { jobId }) => {
    await requireAdmin(ctx);
    const job = await ctx.db.get(jobId);
    if (!job || job.state !== "failed") throw new Error("Only failed notifications can be retried");
    if (Date.now() - job.createdAt >= 23 * 60 * 60 * 1000) throw new Error("Retry window expired. Check the provider before sending a new notification.");
    // Missing sender means no network call was possible, so it is safe to fill it now.
    await ctx.db.patch(jobId, { state: "queued", dueAt: Date.now(), from: job.from ?? process.env.EMAIL_FROM });
    await ctx.scheduler.runAfter(0, internal.emails.deliverNotification, { jobId });
  },
});

