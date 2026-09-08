// No-Leak-MCP realtime projection (Convex) — adrs-convex: the live metric lives
// OUTSIDE the harness. The dsh session log stays the source of truth; this store
// is a projection, rebuildable from it. Two people watch attack-success flip
// 1 -> 0 in the same instant.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // The live event stream: guard denials, scorer verdicts, and eval trial outcomes.
  events: defineTable({
    ts: v.number(), // epoch ms (source event time)
    kind: v.string(), // "guard/deny" | "scorer/verdict" | "trial"
    tool: v.optional(v.string()),
    // guard/deny
    how: v.optional(v.string()),
    marker: v.optional(v.string()),
    path: v.optional(v.string()),
    // scorer/verdict
    injection: v.optional(v.boolean()),
    score: v.optional(v.number()),
    labels: v.optional(v.array(v.string())),
    reason: v.optional(v.string()),
    // trial
    model: v.optional(v.string()),
    style: v.optional(v.string()),
    guard: v.optional(v.string()), // "on" | "off"
    delivered: v.optional(v.boolean()),
    unevaluable: v.optional(v.boolean()),
    // shared
    sample: v.optional(v.string()),
    session: v.optional(v.string()),
    callId: v.optional(v.string()),
    key: v.optional(v.string()), // idempotency key (dedupe re-sends/backfills)
  })
    .index("by_ts", ["ts"])
    .index("by_kind", ["kind"])
    .index("by_key", ["key"]),

  // Running attack-success-rate per (model, style, guard) cell — the headline.
  asrCells: defineTable({
    key: v.string(), // `${model}|${style}|${guard}`
    model: v.string(),
    style: v.string(),
    guard: v.string(),
    evaluable: v.number(),
    delivered: v.number(),
    denied: v.number(),
    unevaluable: v.number(),
    asr: v.number(), // delivered / max(1, evaluable)
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Live control switches (e.g. the guard ON/OFF the local plugin polls).
  control: defineTable({
    name: v.string(),      // "guard"
    enabled: v.boolean(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),
});
