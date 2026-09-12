// Read side — reactive queries the dashboard subscribes to. Convex pushes an
// update to every subscriber on each write, with no polling.

import { query } from "./_generated/server";
import { v } from "convex/values";

/** Most recent events for the live feed (newest first). */
export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db.query("events").withIndex("by_ts").order("desc").take(limit ?? 50);
    return rows;
  },
});

/** All ASR cells — the headline matrix (model × style × guard). */
export const cells = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("asrCells").collect();
    return rows.sort((a, b) => a.key.localeCompare(b.key));
  },
});

/** Recent exposure investigations for the dashboard (newest first). */
export const findings = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db.query("findings").withIndex("by_createdAt").order("desc").take(Math.min(limit ?? 12, 50));
  },
});

/**
 * The investigation's memory: the newest finding for a host whose identity was
 * sourced. Freshness is judged by the caller (no Date.now() in a query), so this
 * only returns what is stored.
 */
export const latestFindingForHost = query({
  args: { host: v.string() },
  handler: async (ctx, { host }) => {
    const recent = await ctx.db
      .query("findings")
      .withIndex("by_host_and_createdAt", (q) => q.eq("host", host))
      .order("desc")
      .take(5);
    const f = recent.find((r) => r.identityConfidence !== "unverified");
    if (!f) return null;
    return {
      serviceType: f.serviceType, operator: f.operator ?? null, identitySummary: f.identitySummary,
      identityConfidence: f.identityConfidence, createdAt: f.createdAt,
    };
  },
});

/** Rollup counters for the header tiles. */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    let denies = 0, verdicts = 0, injections = 0, trials = 0, delivered = 0;
    for (const e of events) {
      if (e.kind === "guard/deny") denies++;
      else if (e.kind === "scorer/verdict") { verdicts++; if (e.injection) injections++; }
      else if (e.kind === "trial") { trials++; if (e.delivered) delivered++; }
    }
    return { total: events.length, denies, verdicts, injections, trials, delivered };
  },
});
