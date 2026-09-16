import {
  query,
  mutation,
  internalMutation,
} from "./_generated/server";
import { queueShipmentEmails } from "./notificationJobs";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/admin";
import { generateTrackingCode, trackingUrl, isValidTrackingCode } from "./lib/tracking";
import { logAudit } from "./lib/audit";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// ─── Status history helper ──────────────────────────────────────────────────

/**
 * Chronological status history for a shipment. Shipments created before the
 * statusEvents table existed have no rows here, so we fall back to a single
 * synthetic event derived from the shipment's current status.
 */
async function getStatusHistory(ctx: QueryCtx | MutationCtx, shipment: Doc<"shipments">) {
  const events = await ctx.db
    .query("statusEvents")
    .withIndex("by_shipment_created_at", (q) => q.eq("shipmentId", shipment._id))
    .collect();

  if (events.length === 0) {
    return [{ _id: shipment._id, status: shipment.status, createdAt: shipment.createdAt }];
  }

  return events.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ─── Sender / Receiver field validators (reused) ────────────────────────────
const partyFields = {
  fullName: v.string(),
  email: v.string(),
  phone: v.string(),
  address: v.string(),
  city: v.string(),
  state: v.string(),
  country: v.string(),
  postalCode: v.string(),
};

// ─── Queries ────────────────────────────────────────────────────────────────

export const getShipmentById = query({
  args: { id: v.id("shipments") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const shipment = await ctx.db.get(id);
    if (!shipment) return null;

    const [items, checkpoints, statusHistory] = await Promise.all([
      ctx.db
        .query("shipmentItems")
        .withIndex("by_shipment", (q) => q.eq("shipmentId", id))
        .collect(),
      ctx.db
        .query("routeCheckpoints")
        .withIndex("by_shipment_sequence", (q) => q.eq("shipmentId", id))
        .collect(),
      getStatusHistory(ctx, shipment),
    ]);

    return {
      ...shipment,
      items,
      checkpoints: checkpoints.sort((a, b) => a.sequence - b.sequence),
      statusHistory,
    };
  },
});

export const getShipmentByTrackingCode = query({
  args: { trackingCode: v.string() },
  handler: async (ctx, { trackingCode }) => {
    if (!isValidTrackingCode(trackingCode)) return null;
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("by_tracking_code", (q) =>
        q.eq("trackingCode", trackingCode)
      )
      .first();

    if (!shipment) return null;

    const [items, checkpoints, statusHistory] = await Promise.all([
      ctx.db
        .query("shipmentItems")
        .withIndex("by_shipment", (q) => q.eq("shipmentId", shipment._id))
        .collect(),
      ctx.db
        .query("routeCheckpoints")
        .withIndex("by_shipment_sequence", (q) =>
          q.eq("shipmentId", shipment._id)
        )
        .collect(),
      getStatusHistory(ctx, shipment),
    ]);

    return {
      ...shipment,
      items,
      checkpoints: checkpoints.sort((a, b) => a.sequence - b.sequence),
      statusHistory,
    };
  },
});

export const listShipments = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filters: v.optional(
      v.object({
        trackingCode: v.optional(v.string()),
        senderName: v.optional(v.string()),
        receiverName: v.optional(v.string()),
        status: v.optional(v.string()),
        shipmentType: v.optional(v.string()),
        dateFrom: v.optional(v.string()),
        dateTo: v.optional(v.string()),
        country: v.optional(v.string()),
        archived: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { paginationOpts, filters }) => {
    await requireAdmin(ctx);
    const archived = filters?.archived ?? false;

    const q = ctx.db
      .query("shipments")
      .withIndex("by_archived", (q) => q.eq("archived", archived));

    const page = await q.paginate(paginationOpts);

    const filtered = page.page.filter((s) => {
      if (
        filters?.trackingCode &&
        !s.trackingCode
          .toLowerCase()
          .includes(filters.trackingCode.toLowerCase())
      )
        return false;
      if (
        filters?.senderName &&
        !s.senderFullName
          .toLowerCase()
          .includes(filters.senderName.toLowerCase())
      )
        return false;
      if (
        filters?.receiverName &&
        !s.receiverFullName
          .toLowerCase()
          .includes(filters.receiverName.toLowerCase())
      )
        return false;
      if (
        filters?.status &&
        !s.status.toLowerCase().includes(filters.status.toLowerCase())
      )
        return false;
      if (filters?.shipmentType && s.shipmentType !== filters.shipmentType)
        return false;
      if (filters?.dateFrom && s.createdAt < filters.dateFrom) return false;
      if (filters?.dateTo && s.createdAt > filters.dateTo) return false;
      if (
        filters?.country &&
        s.senderCountry !== filters.country &&
        s.receiverCountry !== filters.country
      )
        return false;
      return true;
    });

    return { ...page, page: filtered };
  },
});

export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const all = await ctx.db.query("shipments").collect();

    return {
      totalShipments: all.length,
      archivedShipments: all.filter((s) => s.archived).length,
      registeredShipments: all.filter((s) => s.status === "Shipment Registered").length,
      inTransitShipments: all.filter((s) => s.status === "In Transit").length,
      heldAtAirportShipments: all.filter((s) => s.status === "Held at the Airport").length,
      totalRevenue: all.reduce((sum, s) => sum + s.totalCost, 0),
    };
  },
});

export const getRecentShipments = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireAdmin(ctx);
    return ctx.db
      .query("shipments")
      .withIndex("by_created_at")
      .order("desc")
      .take(limit);
  },
});

export const getAnalyticsData = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const all = await ctx.db.query("shipments").collect();

    // Last 12 months of monthly data
    const now = new Date();
    const monthly: {
      month: string;
      label: string;
      total: number;
      inTransit: number;
      heldAtAirport: number;
      revenue: number;
      heldAtAirportRate: number;
    }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const ms = all.filter((s) => s.createdAt.startsWith(monthStr));
      const heldCount = ms.filter((s) => s.status === "Held at the Airport").length;
      monthly.push({
        month: monthStr,
        label,
        total: ms.length,
        inTransit: ms.filter((s) => s.status === "In Transit").length,
        heldAtAirport: heldCount,
        revenue: Math.round(ms.reduce((sum, s) => sum + s.totalCost, 0) * 100) / 100,
        heldAtAirportRate: ms.length > 0 ? Math.round((heldCount / ms.length) * 100) : 0,
      });
    }

    // Status distribution
    const statusMap: Record<string, number> = {};
    for (const s of all) {
      statusMap[s.status] = (statusMap[s.status] ?? 0) + 1;
    }
    const statusDistribution = Object.entries(statusMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { monthly, statusDistribution, total: all.length };
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

const shipmentItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  weight: v.number(),
  declaredValue: v.number(),
});

const checkpointValidator = v.object({
  cityName: v.string(),
  country: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  sequence: v.number(),
  arrivalStatus: v.optional(v.string()),
});

export const createShipment = mutation({
  args: {
    // Sender
    senderFullName: v.string(),
    senderEmail: v.string(),
    senderPhone: v.string(),
    senderAddress: v.string(),
    senderCity: v.string(),
    senderState: v.string(),
    senderCountry: v.string(),
    senderPostalCode: v.string(),
    // Receiver
    receiverFullName: v.string(),
    receiverEmail: v.string(),
    receiverPhone: v.string(),
    receiverAddress: v.string(),
    receiverCity: v.string(),
    receiverState: v.string(),
    receiverCountry: v.string(),
    receiverPostalCode: v.string(),
    // Shipment details
    shipmentType: v.string(),
    status: v.optional(v.string()),
    dispatchDate: v.optional(v.string()),
    estimatedDeliveryDate: v.optional(v.string()),
    shippingCost: v.number(),
    tax: v.number(),
    insurance: v.number(),
    totalCost: v.number(),
    weight: v.number(),
    length: v.number(),
    width: v.number(),
    height: v.number(),
    // Related data
    items: v.array(shipmentItemValidator),
    checkpoints: v.optional(v.array(checkpointValidator)),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);

    const now = new Date().toISOString();
    const trackingCode = await generateTrackingCode(ctx);
    const qrCodeUrl = trackingUrl(trackingCode);

    const shipmentId = await ctx.db.insert("shipments", {
      trackingCode,
      qrCodeUrl,
      status: args.status ?? "Shipment Registered",
      shipmentType: args.shipmentType,
      dispatchDate: args.dispatchDate,
      estimatedDeliveryDate: args.estimatedDeliveryDate,
      shippingCost: args.shippingCost,
      tax: args.tax,
      insurance: args.insurance,
      totalCost: args.totalCost,
      weight: args.weight,
      length: args.length,
      width: args.width,
      height: args.height,
      senderFullName: args.senderFullName,
      senderEmail: args.senderEmail,
      senderPhone: args.senderPhone,
      senderAddress: args.senderAddress,
      senderCity: args.senderCity,
      senderState: args.senderState,
      senderCountry: args.senderCountry,
      senderPostalCode: args.senderPostalCode,
      receiverFullName: args.receiverFullName,
      receiverEmail: args.receiverEmail,
      receiverPhone: args.receiverPhone,
      receiverAddress: args.receiverAddress,
      receiverCity: args.receiverCity,
      receiverState: args.receiverState,
      receiverCountry: args.receiverCountry,
      receiverPostalCode: args.receiverPostalCode,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });

    // Insert items
    for (const item of args.items) {
      await ctx.db.insert("shipmentItems", { ...item, shipmentId });
    }

    // Insert checkpoints
    if (args.checkpoints?.length) {
      for (const cp of args.checkpoints) {
        await ctx.db.insert("routeCheckpoints", { ...cp, shipmentId });
      }
    }

    const initialStatus = args.status ?? "Shipment Registered";
    await ctx.db.insert("statusEvents", {
      shipmentId,
      status: initialStatus,
      createdAt: now,
    });

    await logAudit(ctx, "shipment.created", adminId, {
      shipmentId,
      newValue: { trackingCode, status: initialStatus },
    });

    await queueShipmentEmails(ctx, {
      shipmentId,
      trackingCode,
      status: initialStatus,
      statusHistory: [{ status: initialStatus, createdAt: now }],
      senderName: args.senderFullName,
      senderEmail: args.senderEmail,
      receiverName: args.receiverFullName,
      receiverEmail: args.receiverEmail,
      senderCity: args.senderCity,
      receiverCity: args.receiverCity,
      estimatedDeliveryDate: args.estimatedDeliveryDate,
    });

    return { shipmentId, trackingCode };
  },
});

export const updateShipment = mutation({
  args: {
    id: v.id("shipments"),
    // All fields optional for partial updates
    senderFullName: v.optional(v.string()),
    senderEmail: v.optional(v.string()),
    senderPhone: v.optional(v.string()),
    senderAddress: v.optional(v.string()),
    senderCity: v.optional(v.string()),
    senderState: v.optional(v.string()),
    senderCountry: v.optional(v.string()),
    senderPostalCode: v.optional(v.string()),
    receiverFullName: v.optional(v.string()),
    receiverEmail: v.optional(v.string()),
    receiverPhone: v.optional(v.string()),
    receiverAddress: v.optional(v.string()),
    receiverCity: v.optional(v.string()),
    receiverState: v.optional(v.string()),
    receiverCountry: v.optional(v.string()),
    receiverPostalCode: v.optional(v.string()),
    shipmentType: v.optional(v.string()),
    dispatchDate: v.optional(v.string()),
    estimatedDeliveryDate: v.optional(v.string()),
    shippingCost: v.optional(v.number()),
    tax: v.optional(v.number()),
    insurance: v.optional(v.number()),
    totalCost: v.optional(v.number()),
    weight: v.optional(v.number()),
    length: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const adminId = await requireAdmin(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Shipment not found");

    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(id, { ...updates, updatedAt: new Date().toISOString() });

    await logAudit(ctx, "shipment.updated", adminId, {
      shipmentId: id,
      previousValue: existing,
      newValue: updates,
    });
  },
});

/** Replaces all items for a shipment in one atomic operation */
export const replaceShipmentItems = mutation({
  args: {
    shipmentId: v.id("shipments"),
    items: v.array(shipmentItemValidator),
  },
  handler: async (ctx, { shipmentId, items }) => {
    const adminId = await requireAdmin(ctx);

    const existing = await ctx.db
      .query("shipmentItems")
      .withIndex("by_shipment", (q) => q.eq("shipmentId", shipmentId))
      .collect();

    for (const item of existing) await ctx.db.delete(item._id);
    for (const item of items) {
      await ctx.db.insert("shipmentItems", { ...item, shipmentId });
    }

    await logAudit(ctx, "shipment.items_updated", adminId, {
      shipmentId,
      newValue: { count: items.length },
    });
  },
});

export const updateShipmentStatus = mutation({
  args: {
    id: v.id("shipments"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const adminId = await requireAdmin(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Shipment not found");

    const now = new Date().toISOString();

    await ctx.db.patch(id, {
      status,
      updatedAt: now,
    });

    await ctx.db.insert("statusEvents", {
      shipmentId: id,
      status,
      createdAt: now,
    });

    await logAudit(ctx, "shipment.status_changed", adminId, {
      shipmentId: id,
      previousValue: { status: existing.status },
      newValue: { status },
      details: `Status changed from "${existing.status}" to "${status}"`,
    });

    const statusHistory = await getStatusHistory(ctx, existing);

    await queueShipmentEmails(ctx, {
      shipmentId: id,
      trackingCode: existing.trackingCode,
      status,
      statusHistory: statusHistory.map((e) => ({ status: e.status, createdAt: e.createdAt })),
      senderName: existing.senderFullName,
      senderEmail: existing.senderEmail,
      receiverName: existing.receiverFullName,
      receiverEmail: existing.receiverEmail,
      senderCity: existing.senderCity,
      receiverCity: existing.receiverCity,
      estimatedDeliveryDate: existing.estimatedDeliveryDate,
    });

    return { previousStatus: existing.status };
  },
});

export const archiveShipment = mutation({
  args: { id: v.id("shipments") },
  handler: async (ctx, { id }) => {
    const adminId = await requireAdmin(ctx);

    await ctx.db.patch(id, {
      archived: true,
      updatedAt: new Date().toISOString(),
    });

    await logAudit(ctx, "shipment.archived", adminId, { shipmentId: id });
  },
});

export const restoreShipment = mutation({
  args: { id: v.id("shipments") },
  handler: async (ctx, { id }) => {
    const adminId = await requireAdmin(ctx);

    await ctx.db.patch(id, {
      archived: false,
      updatedAt: new Date().toISOString(),
    });

    await logAudit(ctx, "shipment.restored", adminId, { shipmentId: id });
  },
});

export const deleteShipment = mutation({
  args: { id: v.id("shipments") },
  handler: async (ctx, { id }) => {
    const adminId = await requireAdmin(ctx);

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Shipment not found");

    // Cascade delete related records
    const [items, checkpoints, statusEvents] = await Promise.all([
      ctx.db.query("shipmentItems").withIndex("by_shipment", (q) => q.eq("shipmentId", id)).collect(),
      ctx.db.query("routeCheckpoints").withIndex("by_shipment", (q) => q.eq("shipmentId", id)).collect(),
      ctx.db.query("statusEvents").withIndex("by_shipment", (q) => q.eq("shipmentId", id)).collect(),
    ]);

    for (const item of [...items, ...checkpoints, ...statusEvents]) {
      await ctx.db.delete(item._id);
    }

    await logAudit(ctx, "shipment.deleted", adminId, {
      previousValue: { trackingCode: existing.trackingCode },
      details: `Deleted shipment ${existing.trackingCode}`,
    });

    await ctx.db.delete(id);
  },
});

// ─── Internal: Auto-archive cron target ─────────────────────────────────────

export const autoArchiveHeldAtAirport = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();

    const heldAtAirport = await ctx.db
      .query("shipments")
      .withIndex("by_status", (q) => q.eq("status", "Held at the Airport"))
      .collect();

    let archived = 0;
    for (const s of heldAtAirport) {
      if (!s.archived && s.updatedAt < ninetyDaysAgo) {
        await ctx.db.patch(s._id, {
          archived: true,
          updatedAt: new Date().toISOString(),
        });
        archived++;
      }
    }

    return { archived };
  },
});





