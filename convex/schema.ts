import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  administrators: defineTable({
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  contactQuotas: defineTable({ key: v.string(), count: v.number(), expiresAt: v.number() })
    .index("by_key", ["key"]).index("by_expiry", ["expiresAt"]),

  notificationJobs: defineTable({
    shipmentId: v.id("shipments"),
    recipient: v.string(),
    recipientName: v.string(),
    isReceiver: v.boolean(),
    trackingCode: v.string(),
    shipmentStatus: v.string(),
    senderCity: v.optional(v.string()),
    receiverCity: v.optional(v.string()),
    estimatedDeliveryDate: v.optional(v.string()),
    statusHistory: v.optional(v.array(v.object({ status: v.string(), createdAt: v.string() }))),
    from: v.optional(v.string()),
    publicUrl: v.string(),
    state: v.union(v.literal("queued"), v.literal("sending"), v.literal("accepted"), v.literal("retrying"), v.literal("failed")),
    attempts: v.number(),
    createdAt: v.number(),
    dueAt: v.number(),
    leaseUntil: v.optional(v.number()),
    providerId: v.optional(v.string()),
    lastError: v.optional(v.string()),
  }).index("by_shipment", ["shipmentId"]).index("by_created", ["createdAt"])
    .index("by_state_due", ["state", "dueAt"]).index("by_state_lease", ["state", "leaseUntil"]),

  shipments: defineTable({
    trackingCode: v.string(),
    qrCodeUrl: v.optional(v.string()),
    status: v.string(),
    shipmentType: v.string(),
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
    // Sender (embedded object)
    senderFullName: v.string(),
    senderEmail: v.string(),
    senderPhone: v.string(),
    senderAddress: v.string(),
    senderCity: v.string(),
    senderState: v.string(),
    senderCountry: v.string(),
    senderPostalCode: v.string(),
    // Receiver (embedded object)
    receiverFullName: v.string(),
    receiverEmail: v.string(),
    receiverPhone: v.string(),
    receiverAddress: v.string(),
    receiverCity: v.string(),
    receiverState: v.string(),
    receiverCountry: v.string(),
    receiverPostalCode: v.string(),
    // Meta
    archived: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_tracking_code", ["trackingCode"])
    .index("by_status", ["status"])
    .index("by_archived", ["archived"])
    .index("by_created_at", ["createdAt"]),

  shipmentItems: defineTable({
    shipmentId: v.id("shipments"),
    description: v.string(),
    quantity: v.number(),
    weight: v.number(),
    declaredValue: v.number(),
  }).index("by_shipment", ["shipmentId"]),

  statusEvents: defineTable({
    shipmentId: v.id("shipments"),
    status: v.string(),
    createdAt: v.string(),
  })
    .index("by_shipment", ["shipmentId"])
    .index("by_shipment_created_at", ["shipmentId", "createdAt"]),

  routeCheckpoints: defineTable({
    shipmentId: v.id("shipments"),
    cityName: v.string(),
    country: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    sequence: v.number(),
    arrivalStatus: v.optional(v.string()),
  })
    .index("by_shipment", ["shipmentId"])
    .index("by_shipment_sequence", ["shipmentId", "sequence"]),

  auditLogs: defineTable({
    action: v.string(),
    adminId: v.id("users"),
    shipmentId: v.optional(v.id("shipments")),
    timestamp: v.string(),
    previousValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    details: v.optional(v.string()),
  })
    .index("by_shipment", ["shipmentId"])
    .index("by_admin", ["adminId"])
    .index("by_timestamp", ["timestamp"]),
});
