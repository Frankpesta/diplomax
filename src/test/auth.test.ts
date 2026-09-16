import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Password rules shared across signup and reset forms ──────────────────────
const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

// ── Signup schema ────────────────────────────────────────────────────────────
const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

describe("Signup form validation", () => {
  it("accepts valid data", () => {
    const result = signUpSchema.safeParse({
      name: "Admin User",
      email: "admin@diplomaxdelivery.com",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = signUpSchema.safeParse({
      name: "A",
      email: "admin@diplomaxdelivery.com",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signUpSchema.safeParse({
      name: "Admin",
      email: "not-an-email",
      password: "SecurePass1",
      confirmPassword: "SecurePass1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = signUpSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "Abc1",
      confirmPassword: "Abc1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "lowercase1",
      confirmPassword: "lowercase1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signUpSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "NoNumbers!",
      confirmPassword: "NoNumbers!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = signUpSchema.safeParse({
      name: "Admin",
      email: "admin@test.com",
      password: "SecurePass1",
      confirmPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("confirmPassword");
    }
  });
});

// ── Middleware route matching logic ──────────────────────────────────────────
describe("Admin route protection logic", () => {
  const publicAdminRoutes = [
    "/admin/login",
    "/admin/signup",
    "/admin/reset-password",
    "/admin/reset-password/confirm",
  ];

  const protectedAdminRoutes = [
    "/admin/dashboard",
    "/admin/shipments",
    "/admin/shipments/new",
    "/admin/shipments/abc123",
    "/admin/analytics",
    "/admin/audit-log",
    "/admin/settings",
  ];

  function isPublicAdminRoute(path: string) {
    return (
      path === "/admin/login" ||
      path === "/admin/signup" ||
      path.startsWith("/admin/reset-password")
    );
  }

  it("correctly identifies public admin routes", () => {
    for (const route of publicAdminRoutes) {
      expect(isPublicAdminRoute(route)).toBe(true);
    }
  });

  it("correctly identifies protected admin routes", () => {
    for (const route of protectedAdminRoutes) {
      expect(isPublicAdminRoute(route)).toBe(false);
    }
  });
});
