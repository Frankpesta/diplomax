"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Id } from "@convex/_generated/dataModel";
const LABELS = { queued: "Queued", sending: "Sending", accepted: "Accepted by Resend", retrying: "Retry scheduled", failed: "Failed" };
export default function NotificationsPage() {
  const jobs = useQuery(api.notificationJobs.list);
  const retry = useMutation(api.notificationJobs.retry);
  const [pending, setPending] = useState<string | null>(null);
  async function retryJob(jobId: Id<"notificationJobs">) {
    setPending(jobId);
    try { await retry({ jobId }); toast.success("Notification queued for retry"); }
    catch { toast.error("Could not retry. The notification must be failed and less than 23 hours old."); }
    finally { setPending(null); }
  }
  return <div className="space-y-8"><div><p className="section-kicker">Customer communication</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Email notifications</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Shipment updates are saved before emails are sent. Temporary failures are retried up to three times. Provider acceptance does not confirm inbox delivery.</p></div>
    <div className="overflow-hidden rounded-2xl border bg-card">
      {!jobs ? <p className="p-8 text-muted-foreground">Loading notifications…</p> : jobs.length === 0 ? <div className="p-12 text-center"><Mail className="mx-auto mb-4 text-muted-foreground" /><p>No shipment notifications yet.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/40"><tr>{["Shipment", "Recipient", "Status", "Attempts", "Details", "Action"].map(label=><th key={label} className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</th>)}</tr></thead><tbody className="divide-y">{jobs.map(job=><tr key={job._id}><td className="px-5 py-4"><Link className="font-mono font-semibold text-primary" href={`/admin/shipments/${job.trackingCode}`}>{job.trackingCode}</Link><p className="mt-1 text-xs text-muted-foreground">{job.shipmentStatus}</p></td><td className="px-5 py-4">{job.recipient}<p className="mt-1 text-xs text-muted-foreground">{job.isReceiver ? "Receiver" : "Sender"}</p></td><td className="px-5 py-4"><span className={job.state === "failed" ? "font-semibold text-destructive" : "font-semibold"}>{LABELS[job.state]}</span></td><td className="px-5 py-4">{job.attempts}</td><td className="max-w-xs px-5 py-4 text-xs leading-5 text-muted-foreground">{job.lastError ?? (job.providerId ? `Provider ID: ${job.providerId}` : "Awaiting processing")}{job.state === "retrying" && <p>Next attempt: {new Date(job.dueAt).toLocaleString()}</p>}</td><td className="px-5 py-4">{job.state === "failed" && <button onClick={()=>retryJob(job._id)} disabled={pending !== null} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 disabled:opacity-50"><RefreshCw size={14} />{pending === job._id ? "Queuing…" : "Retry"}</button>}</td></tr>)}</tbody></table></div>}
    </div><p className="text-xs text-muted-foreground">Showing the latest 100 notifications. Retries retain the same provider idempotency key and expire after 23 hours to prevent duplicate emails.</p></div>;
}
