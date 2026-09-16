import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Auto-archive shipments held at the airport for 90+ days — runs daily at 02:00 UTC
crons.daily(
  "auto-archive-held-at-airport-shipments",
  { hourUTC: 2, minuteUTC: 0 },
  internal.shipments.autoArchiveHeldAtAirport
);

crons.interval("recover-email-notifications", { minutes: 5 }, internal.notificationJobs.recover);
crons.daily("clean-contact-quotas", { hourUTC: 3, minuteUTC: 0 }, internal.contactLimits.cleanup);
export default crons;

