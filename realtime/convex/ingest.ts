// Ingest mutations — the write side of the projection. The dsh→Convex bridge
// (realtime/bridge/tail-to-convex.mjs) calls these as it tails the harness JSONL
// logs. Writes are shared, subscribed state: every dashboard viewer is pushed.

import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Ingest one harness event (guard denial or scorer verdict) into the live feed.
 * `e` is the parsed JSONL row; we map its known fields and ignore the rest.
 */
export const ingestEvent = mutation({
  args: { e: v.any(), key: v.optional(v.string()) },
  handler: async (ctx, { e, key }) => {
    if (key) {
      const dup = await ctx.db.query("events").withIndex("by_key", (q) => q.eq("key", key)).first();
      if (dup) return; // idempotent: already ingested
    }
    const kind = e.event ?? e.kind ?? "unknown";
    await ctx.db.insert("events", {
      ts: e.ts ? Date.parse(e.ts) || Date.now() : Date.now(),
      kind,
      tool: e.tool ?? undefined,
      how: e.how ?? undefined,
      marker: e.marker ?? undefined,
      path: e.path ?? undefined,
      injection: typeof e.injection === "boolean" ? e.injection : undefined,
      score: typeof e.score === "number" ? e.score : undefined,
      labels: Array.isArray(e.labels) ? e.labels.map(String) : undefined,
      reason: e.reason ?? undefined,
      sample: e.sample ?? undefined,
      session: e.agent ?? e.session ?? undefined,
      callId: e.callId ?? undefined,
      key: key ?? undefined,
    });
  },
});

/**
 * Record one eval trial outcome and fold it into its ASR cell. This is what the
 * dashboard watches flip 1 -> 0 as the guard is toggled.
 */
export const ingestTrial = mutation({
  args: {
    model: v.string(),
    style: v.string(),
    guard: v.string(),
    delivered: v.boolean(),
    denied: v.boolean(),
    unevaluable: v.boolean(),
    ts: v.optional(v.number()),
    trialId: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    if (a.trialId) {
      const dup = await ctx.db.query("events").withIndex("by_key", (q) => q.eq("key", a.trialId)).first();
      if (dup) return; // idempotent: this trial already folded in
    }
    const ts = a.ts ?? Date.now();
    await ctx.db.insert("events", {
      ts,
      kind: "trial",
      model: a.model,
      style: a.style,
      guard: a.guard,
      delivered: a.delivered,
      unevaluable: a.unevaluable,
      key: a.trialId ?? undefined,
    });
    if (a.unevaluable) return; // adrs-nebius: excluded from the denominator

    const key = `${a.model}|${a.style}|${a.guard}`;
    const existing = await ctx.db
      .query("asrCells")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const cell = existing ?? {
      key, model: a.model, style: a.style, guard: a.guard,
      evaluable: 0, delivered: 0, denied: 0, unevaluable: 0, asr: 0, updatedAt: ts,
    };
    cell.evaluable += 1;
    cell.delivered += a.delivered ? 1 : 0;
    cell.denied += a.denied ? 1 : 0;
    cell.asr = cell.delivered / Math.max(1, cell.evaluable);
    cell.updatedAt = ts;
    if (existing) await ctx.db.patch(existing._id, cell);
    else await ctx.db.insert("asrCells", cell);
  },
});

/** Reset the projection (it is rebuildable from the log). Handy for demos. */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    for (const t of ["events", "asrCells"]) {
      const rows = await ctx.db.query(t).collect();
      for (const r of rows) await ctx.db.delete(r._id);
    }
  },
});
