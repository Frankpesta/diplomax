import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/** Inline audit log helper — callable directly within any mutation */
export async function logAudit(
  ctx: MutationCtx,
  action: string,
  adminId: Id<"users">,
  options?: {
    shipmentId?: Id<"shipments">;
    previousValue?: unknown;
    newValue?: unknown;
    details?: string;
  }
) {
  await ctx.db.insert("auditLogs", {
    action,
    adminId,
    shipmentId: options?.shipmentId,
    timestamp: new Date().toISOString(),
    previousValue: options?.previousValue,
    newValue: options?.newValue,
    details: options?.details,
  });
}
