import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Contact / Person schema (mirrors contact-form.tsx) ──────────────────────
const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(3, "Postal code is required"),
});

const VALID_CONTACT = {
  fullName: "Jane Smith",
  email: "jane@example.com",
  phone: "+1 555 000 0000",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  country: "United States",
  postalCode: "10001",
};

describe("Contact schema validation", () => {
  it("accepts a valid contact", () => {
    const result = contactSchema.safeParse(VALID_CONTACT);
    expect(result.success).toBe(true);
  });

  it("rejects short full name", () => {
    const result = contactSchema.safeParse({ ...VALID_CONTACT, fullName: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({ ...VALID_CONTACT, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short phone", () => {
    const result = contactSchema.safeParse({ ...VALID_CONTACT, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty city", () => {
    const result = contactSchema.safeParse({ ...VALID_CONTACT, city: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects short postal code", () => {
    const result = contactSchema.safeParse({ ...VALID_CONTACT, postalCode: "12" });
    expect(result.success).toBe(false);
  });
});

// ── Item schema ──────────────────────────────────────────────────────────────
const itemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Describe what's in this item"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  declaredValue: z.number().min(0, "Value must be 0 or more"),
});

const VALID_ITEM = {
  id: "abc123",
  description: "Laptop",
  quantity: 2,
  weight: 1.5,
  declaredValue: 999,
};

describe("Item schema validation", () => {
  it("accepts a valid item", () => {
    expect(itemSchema.safeParse(VALID_ITEM).success).toBe(true);
  });

  it("rejects empty description", () => {
    expect(itemSchema.safeParse({ ...VALID_ITEM, description: "" }).success).toBe(false);
  });

  it("rejects zero quantity", () => {
    expect(itemSchema.safeParse({ ...VALID_ITEM, quantity: 0 }).success).toBe(false);
  });

  it("rejects zero weight", () => {
    expect(itemSchema.safeParse({ ...VALID_ITEM, weight: 0 }).success).toBe(false);
  });

  it("allows zero declared value", () => {
    expect(itemSchema.safeParse({ ...VALID_ITEM, declaredValue: 0 }).success).toBe(true);
  });

  it("rejects negative declared value", () => {
    expect(itemSchema.safeParse({ ...VALID_ITEM, declaredValue: -1 }).success).toBe(false);
  });
});

// ── Pricing schema ───────────────────────────────────────────────────────────
const pricingSchema = z.object({
  shipmentType: z.string().min(1, "Select a shipment type"),
  status: z.string().min(1, "Select a status"),
  dispatchDate: z.string(),
  estimatedDeliveryDate: z.string(),
  weight: z.number().min(0.01, "Total weight required"),
  length: z.number().min(0.01, "Length required"),
  width: z.number().min(0.01, "Width required"),
  height: z.number().min(0.01, "Height required"),
  shippingCost: z.number().min(0),
  tax: z.number().min(0),
  insurance: z.number().min(0),
  totalCost: z.number().min(0),
});

const VALID_PRICING = {
  shipmentType: "Express",
  status: "Shipment Registered",
  dispatchDate: "2026-07-01",
  estimatedDeliveryDate: "2026-07-05",
  weight: 2.5,
  length: 30,
  width: 20,
  height: 15,
  shippingCost: 100,
  tax: 10,
  insurance: 5,
  totalCost: 115,
};

describe("Pricing schema validation", () => {
  it("accepts valid pricing data", () => {
    expect(pricingSchema.safeParse(VALID_PRICING).success).toBe(true);
  });

  it("rejects missing shipment type", () => {
    expect(pricingSchema.safeParse({ ...VALID_PRICING, shipmentType: "" }).success).toBe(false);
  });

  it("rejects zero weight", () => {
    expect(pricingSchema.safeParse({ ...VALID_PRICING, weight: 0 }).success).toBe(false);
  });

  it("rejects zero dimensions", () => {
    expect(pricingSchema.safeParse({ ...VALID_PRICING, length: 0 }).success).toBe(false);
    expect(pricingSchema.safeParse({ ...VALID_PRICING, width: 0 }).success).toBe(false);
    expect(pricingSchema.safeParse({ ...VALID_PRICING, height: 0 }).success).toBe(false);
  });

  it("allows zero shipping cost (free shipping)", () => {
    expect(pricingSchema.safeParse({ ...VALID_PRICING, shippingCost: 0, totalCost: 0 }).success).toBe(true);
  });

  it("rejects negative costs", () => {
    expect(pricingSchema.safeParse({ ...VALID_PRICING, shippingCost: -1 }).success).toBe(false);
    expect(pricingSchema.safeParse({ ...VALID_PRICING, tax: -1 }).success).toBe(false);
    expect(pricingSchema.safeParse({ ...VALID_PRICING, insurance: -1 }).success).toBe(false);
  });

  it("accepts empty dates (optional)", () => {
    expect(
      pricingSchema.safeParse({ ...VALID_PRICING, dispatchDate: "", estimatedDeliveryDate: "" }).success
    ).toBe(true);
  });
});
