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
    source: v.optional(v.string()), // "arena" | "dsh" — where the event originated
    runId: v.optional(v.string()),  // arena run / dsh session correlator
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

  // Exposure investigations (render/arena/investigate.mjs): where a credential was
  // headed, who can read it there, how sure we are, what to do. Written by the arena
  // after each run; read back as MEMORY (a fresh, sourced identity skips a search)
  // and by the dashboard. Arrays are capped at write time.
  findings: defineTable({
    host: v.string(),
    outcome: v.optional(v.string()),        // run outcome; absent = "what if" lookup
    runId: v.optional(v.string()),
    serviceType: v.string(),
    operator: v.optional(v.string()),
    identitySummary: v.string(),
    identityConfidence: v.string(),         // "sourced" | "unverified"
    claimKind: v.string(),                  // "exposure" | "abuse" | "gap"
    verdict: v.string(),
    severity: v.string(),
    confidence: v.string(),                 // "confirmed" | "likely" | "unverified"
    action: v.string(),
    couldNotConfirm: v.array(v.string()),   // <= 6
    steps: v.array(v.object({               // <= 4
      kind: v.string(),
      query: v.string(),
      why: v.string(),
      result: v.string(),
      sourceCount: v.number(),
      error: v.optional(v.string()),
    })),
    sources: v.array(v.object({ name: v.string(), url: v.string() })), // <= 6
    calls: v.number(),
    reused: v.boolean(),
    key: v.string(),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_host_and_createdAt", ["host", "createdAt"])
    .index("by_key", ["key"]),
});
