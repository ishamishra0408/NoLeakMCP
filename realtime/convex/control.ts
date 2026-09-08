// Live control switches. The dashboard flips these; the local guard polls the
// HTTP endpoint (see http.ts). Fail-safe lives in the guard: unreachable => ON.
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const setGuard = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    const row = await ctx.db.query("control").withIndex("by_name", (q) => q.eq("name", "guard")).unique();
    if (row) await ctx.db.patch(row._id, { enabled, updatedAt: Date.now() });
    else await ctx.db.insert("control", { name: "guard", enabled, updatedAt: Date.now() });
  },
});

export const guardState = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("control").withIndex("by_name", (q) => q.eq("name", "guard")).unique();
    return { enabled: row ? row.enabled : true, updatedAt: row?.updatedAt ?? 0 };
  },
});

export const setInvariant = mutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, { enabled }) => {
    const row = await ctx.db.query("control").withIndex("by_name", (q) => q.eq("name", "invariant")).unique();
    if (row) await ctx.db.patch(row._id, { enabled, updatedAt: Date.now() });
    else await ctx.db.insert("control", { name: "invariant", enabled, updatedAt: Date.now() });
  },
});

export const invariantState = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("control").withIndex("by_name", (q) => q.eq("name", "invariant")).unique();
    return { enabled: row ? row.enabled : false, updatedAt: row?.updatedAt ?? 0 };
  },
});
