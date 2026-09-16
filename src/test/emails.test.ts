import { describe, it, expect } from "vitest";
import { getStatusEmailContent } from "../../convex/emails";

const CODE = "DMD-2026-839201";
const NAME = "Alice Smith";
const OPTS = { senderCity: "London", receiverCity: "New York", estimatedDeliveryDate: "2026-07-05" };

describe("getStatusEmailContent — subject lines", () => {
  it("Shipment Registered", () => {
    const { subject } = getStatusEmailContent("Shipment Registered", NAME, CODE);
    expect(subject).toBe(`Shipment Registered — ${CODE}`);
  });

  it("In Transit", () => {
    const { subject } = getStatusEmailContent("In Transit", NAME, CODE);
    expect(subject).toBe(`In Transit — ${CODE}`);
  });

  it("Held at the Airport", () => {
    const { subject } = getStatusEmailContent("Held at the Airport", NAME, CODE);
    expect(subject).toBe(`Held at the Airport — ${CODE}`);
  });

  it("unknown status falls back gracefully", () => {
    const { subject } = getStatusEmailContent("CustomStatus", NAME, CODE);
    expect(subject).toBe(`Shipment Update — ${CODE}`);
  });
});

describe("getStatusEmailContent — heading", () => {
  it("Shipment Registered heading is correct", () => {
    const { heading } = getStatusEmailContent("Shipment Registered", NAME, CODE);
    expect(heading).toBe("Your shipment has been registered");
  });

  it("Held at the Airport heading is correct", () => {
    const { heading } = getStatusEmailContent("Held at the Airport", NAME, CODE);
    expect(heading).toBe("Your shipment is being held at the airport");
  });

  it("unknown status heading mentions the status", () => {
    const { heading } = getStatusEmailContent("WeirdStatus", NAME, CODE);
    expect(heading).toContain("WeirdStatus");
  });
});

describe("getStatusEmailContent — bodyHtml", () => {
  it("includes recipient name in greeting", () => {
    const { bodyHtml } = getStatusEmailContent("Shipment Registered", "Bob Jones", CODE);
    expect(bodyHtml).toContain("Bob Jones");
  });

  it("includes route cities when provided", () => {
    const { bodyHtml } = getStatusEmailContent("In Transit", NAME, CODE, OPTS);
    expect(bodyHtml).toContain("London");
    expect(bodyHtml).toContain("New York");
  });

  it("includes estimated delivery date when provided", () => {
    const { bodyHtml } = getStatusEmailContent("In Transit", NAME, CODE, OPTS);
    expect(bodyHtml).toContain("2026-07-05");
  });

  it("omits route line when cities not provided", () => {
    const { bodyHtml } = getStatusEmailContent("Shipment Registered", NAME, CODE);
    expect(bodyHtml).not.toContain("&rarr;");
  });

  it("omits delivery line when estimatedDeliveryDate not provided", () => {
    const { bodyHtml } = getStatusEmailContent("Shipment Registered", NAME, CODE);
    expect(bodyHtml).not.toContain("Estimated delivery:");
  });
});

describe("getStatusEmailContent — trigger conditions", () => {
  const statuses = ["Shipment Registered", "In Transit", "Held at the Airport"];

  it.each(statuses)("produces a non-empty subject for '%s'", (status) => {
    const { subject } = getStatusEmailContent(status, NAME, CODE);
    expect(subject.length).toBeGreaterThan(0);
    expect(subject).toContain(CODE);
  });

  it.each(statuses)("produces non-empty bodyHtml for '%s'", (status) => {
    const { bodyHtml } = getStatusEmailContent(status, NAME, CODE, OPTS);
    expect(bodyHtml.length).toBeGreaterThan(50);
  });
});
