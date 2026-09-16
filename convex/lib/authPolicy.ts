import type { Value } from "convex/values";

export function passwordProfile(params: Record<string, Value | undefined>) {
  if (typeof params.email !== "string") throw new Error("Enter a valid email address");
  const email = params.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address");
  }
  if (params.flow !== "signUp") return { email };
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey || setupKey.length < 32 || params.setupKey !== setupKey) {
    throw new Error("Admin setup is unavailable or the setup key is invalid");
  }
  const name = typeof params.name === "string" ? params.name.trim() : "";
  if (name.length < 2 || name.length > 100) throw new Error("Enter a name between 2 and 100 characters");
  return { email, name };
}

export function validatePassword(password: string) {
  if (typeof password !== "string" || password.length < 8 || password.length > 128 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Password must have 8–128 characters, an uppercase letter, and a number");
  }
}
