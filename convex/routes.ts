import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/admin";
import { logAudit } from "./lib/audit";

export const getRouteCheckpoints = query({
  args: { shipmentId: v.id("shipments") },
  handler: async (ctx, { shipmentId }) => {
    await requireAdmin(ctx);
    const checkpoints = await ctx.db
      .query("routeCheckpoints")
      .withIndex("by_shipment_sequence", (q) => q.eq("shipmentId", shipmentId))
      .collect();
    return checkpoints.sort((a, b) => a.sequence - b.sequence);
  },
});

/** Replaces all checkpoints for a shipment in one atomic operation */
export const replaceRouteCheckpoints = mutation({
  args: {
    shipmentId: v.id("shipments"),
    checkpoints: v.array(
      v.object({
        cityName: v.string(),
        country: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        sequence: v.number(),
        arrivalStatus: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { shipmentId, checkpoints }) => {
    const adminId = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("routeCheckpoints")
      .withIndex("by_shipment", (q) => q.eq("shipmentId", shipmentId))
      .collect();

    for (const cp of existing) await ctx.db.delete(cp._id);
    for (const cp of checkpoints) {
      await ctx.db.insert("routeCheckpoints", { ...cp, shipmentId });
    }

    await logAudit(ctx, "route.checkpoints_updated", adminId, {
      shipmentId,
      newValue: { count: checkpoints.length },
    });
  },
});

/** Updates the arrival status of a single checkpoint */
export const updateCheckpointArrivalStatus = mutation({
  args: {
    id: v.id("routeCheckpoints"),
    arrivalStatus: v.string(),
  },
  handler: async (ctx, { id, arrivalStatus }) => {
    const adminId = await requireAdmin(ctx);

    const cp = await ctx.db.get(id);
    if (!cp) throw new Error("Checkpoint not found");

    await ctx.db.patch(id, { arrivalStatus });

    await logAudit(ctx, "route.checkpoint_arrival_updated", adminId, {
      shipmentId: cp.shipmentId,
      newValue: { cityName: cp.cityName, arrivalStatus },
    });
  },
});

