import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function assertAdministrator(ctx: Pick<QueryCtx, "db">, userId: Id<"users">) {
  const membership = await ctx.db.query("administrators")
    .withIndex("by_user", (q) => q.eq("userId", userId)).unique();
  if (!membership || !(await ctx.db.get(userId))) throw new Error("Administrator access required");
  return userId;
}

export async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Authentication required");
  return assertAdministrator(ctx, userId);
}

export async function provisionFirstAdmin(ctx: MutationCtx, userId: Id<"users">) {
  if (await ctx.db.query("administrators").first()) throw new Error("Admin registration is closed");
  await ctx.db.insert("administrators", { userId, createdAt: Date.now() });
}
