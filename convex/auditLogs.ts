import { query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/admin";

export const listAuditLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    shipmentId: v.optional(v.id("shipments")),
    action: v.optional(v.string()),
  },
  handler: async (ctx, { paginationOpts, shipmentId, action }) => {
    await requireAdmin(ctx);

    let q;

    if (shipmentId) {
      q = ctx.db
        .query("auditLogs")
        .withIndex("by_shipment", (q) => q.eq("shipmentId", shipmentId));
    } else {
      q = ctx.db
        .query("auditLogs")
        .withIndex("by_timestamp")
        .order("desc");
    }

    const page = await q.paginate(paginationOpts);

    const filtered = action
      ? page.page.filter((log) => log.action.includes(action))
      : page.page;

    // Enrich with user info
    const enriched = await Promise.all(
      filtered.map(async (log) => {
        const admin = await ctx.db.get(log.adminId);
        return {
          ...log,
          adminName: admin?.name ?? admin?.email ?? "Unknown",
        };
      })
    );

    return { ...page, page: enriched };
  },
});

export const getShipmentAuditLogs = query({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, { shipmentId }) => {
    await requireAdmin(ctx);

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_shipment", (q) => q.eq("shipmentId", shipmentId))
      .collect();

    const enriched = await Promise.all(
      logs.map(async (log) => {
        const admin = await ctx.db.get(log.adminId);
        return {
          ...log,
          adminName: admin?.name ?? admin?.email ?? "Unknown",
        };
      })
    );

    return enriched.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
});


