if (typeof fetch === "undefined") { console.error("This suite requires Node 18+ (found " + process.version + "). Run: nvm use 20"); process.exit(2); }
// No-Leak-MCP collector tests — the durable log's read side.
//
// The worker advances its checkpoint only AFTER a whole batch is durable, so the size
// of a batch decides whether a backlog drains or deadlocks: one unbounded read of a
// large log is all-or-nothing, re-read from the same offset on every failure, and it
// never checkpoints. These tests pin the bound and, more importantly, pin that bounding
// it loses nothing — `next` must walk the log exactly, byte for byte, to EOF.
//
// The collector is spawned as a real process against a temp DATA_DIR. Nothing is
// mocked: real HTTP, real file, real byte offsets.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TOKEN = "test-token";
const PORT = 10711;
const BASE = `http://127.0.0.1:${PORT}`;
const hdr = { "x-noleak-token": TOKEN, "content-type": "application/json" };

let child, DATA_DIR;

before(async () => {
  DATA_DIR = mkdtempSync(join(tmpdir(), "noleak-collector-"));
  child = spawn(process.execPath, [join(REPO_ROOT, "render/collector/server.mjs")], {
    env: { ...process.env, DATA_DIR, PORT: String(PORT), INGEST_TOKEN: TOKEN },
    stdio: "ignore",
  });
  const deadline = Date.now() + 10000;
  for (;;) {
    try { if ((await fetch(`${BASE}/health`)).ok) break; } catch {}
    if (Date.now() > deadline) throw new Error("collector did not start");
    await new Promise((r) => setTimeout(r, 100));
  }
});

after(() => { child?.kill(); rmSync(DATA_DIR, { recursive: true, force: true }); });

async function ingest(n) {
  const events = Array.from({ length: n }, (_, i) => ({ kind: "guard/deny", tool: "bash", how: "base64", n: i }));
  const r = await fetch(`${BASE}/ingest`, { method: "POST", headers: hdr, body: JSON.stringify({ events }) });
  assert.equal(r.status, 200);
  return (await r.json()).offset;
}
const readFrom = (since) => fetch(`${BASE}/events?since=${since}`, { headers: hdr }).then((r) => r.json());

test("the log is not public", async () => {
  for (const p of ["/events?since=0", "/checkpoint"]) {
    assert.equal((await fetch(BASE + p)).status, 401, `${p} must require the token`);
  }
});

test("one request is capped, and `next` walks the log to EOF losing nothing", async () => {
  const total = 1200;                       // more than twice the 500 cap
  const eof = await ingest(total);
  assert.equal(eof, statSync(join(DATA_DIR, "events.jsonl")).size);

  const seen = [];
  let offset = 0, passes = 0;
  for (;;) {
    const { events, next } = await readFrom(offset);
    if (!events.length) break;
    assert.ok(events.length <= 500, `batch of ${events.length} broke the cap`);
    assert.ok(next > offset, "next must advance or the worker spins forever");
    seen.push(...events.map((e) => e.n));
    offset = next;
    if (++passes > 20) assert.fail("did not drain in a sane number of passes");
  }

  assert.equal(passes, 3, "1200 events at a 500 cap is 500 + 500 + 200");
  assert.equal(offset, eof, "the walk must land exactly on EOF, not near it");
  // The real requirement: every event exactly once, in order. A cap that dropped or
  // duplicated an event would still "drain", which is why this is asserted and not the
  // count alone.
  assert.deepEqual(seen, Array.from({ length: total }, (_, i) => i));
});

test("a checkpoint at EOF yields an empty batch that does not move", async () => {
  const eof = statSync(join(DATA_DIR, "events.jsonl")).size;
  const { events, next } = await readFrom(eof);
  assert.deepEqual(events, []);
  assert.equal(next, eof);
});

test("an offset past EOF rewinds to 0 rather than reading garbage", async () => {
  // The disk can be replaced or the log rotated; a stale checkpoint must not wedge it.
  const { events, next } = await readFrom(statSync(join(DATA_DIR, "events.jsonl")).size + 999999);
  assert.ok(events.length > 0, "a stale offset should restart the walk");
  assert.ok(next > 0);
});
