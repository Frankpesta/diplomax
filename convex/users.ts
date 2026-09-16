import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAdmin, assertAdministrator } from "./lib/admin";

// Returns true if any admin account has been created already.
// Used by the one-time signup page to lock itself after first admin.
export const isSetupComplete = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("administrators").first();
    return users !== null;
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    await assertAdministrator(ctx, userId);
    return ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),

  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);
    await ctx.db.patch(userId, {
      ...(args.name !== undefined && { name: args.name }),

    });
  },
});

