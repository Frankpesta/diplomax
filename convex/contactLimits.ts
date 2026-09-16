import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
export const consume = internalMutation({
  args: { emailHash: v.string() },
  handler: async (ctx, { emailHash }) => {
    const now = Date.now();
    const hour = Math.floor(now / 3_600_000);
    const rules = [{ key: `contact:global:${hour}`, limit: 100 }, { key: `contact:email:${emailHash}:${hour}`, limit: 3 }];
    const rows = await Promise.all(rules.map(rule => ctx.db.query("contactQuotas").withIndex("by_key", q => q.eq("key", rule.key)).unique()));
    if (rules.some((rule, i) => (rows[i]?.count ?? 0) >= rule.limit)) return false;
    for (let i = 0; i < rules.length; i++) {
      const row = rows[i];
      if (row) await ctx.db.patch(row._id, { count: row.count + 1 });
      else await ctx.db.insert("contactQuotas", { key: rules[i].key, count: 1, expiresAt: (hour + 1) * 3_600_000 });
    }
    return true;
  },
});
export const cleanup = internalMutation({
  args: {},
  handler: async ctx => {
    const rows = await ctx.db.query("contactQuotas").withIndex("by_expiry", q => q.lt("expiresAt", Date.now())).take(500);
    for (const row of rows) await ctx.db.delete(row._id);
  },
});
