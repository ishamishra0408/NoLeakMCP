// The dashboard is served from two origins out of ONE file, realtime/dashboard/index.html:
// the Render service, and the Convex deployment's own .convex.site through Convex
// Static Hosting, which uploads that folder unchanged. These tests pin the failure
// that arrangement invites — something that works on Render but is dead on
// .convex.site, where there is no site, no arena and no /assets.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const html = readFileSync(join(ROOT, "realtime", "dashboard", "index.html"), "utf8");

test("every root-relative link can be re-pointed off-origin", () => {
  // A relative link without data-home would 404 on .convex.site while looking fine
  // on Render, so nothing catches it by eye.
  const links = [...html.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"[^>]*>/g)];
  assert.ok(links.length > 0, "expected nav links");
  for (const [tag, path] of links) {
    assert.ok(tag.includes(`data-home="${path}"`), `link to ${path} has no data-home: ${tag.slice(0, 80)}`);
  }
});

test("no asset is loaded from a root-relative path", () => {
  // Same failure for things that are not links: a favicon or script at /… is a 404
  // on .convex.site. They must be inline or absolute.
  assert.doesNotMatch(html, /<(link|script|img)\b[^>]*\b(href|src)="\/(?!\/)/);
});

test("on a .convex.site origin the page reads its own deployment, not a hardcoded one", () => {
  const re = /\.convex\.site$/;
  const own = (host) => (re.test(host) ? "https://" + host.replace(re, ".convex.cloud") : "");
  assert.equal(own("wary-herring-602.convex.site"), "https://wary-herring-602.convex.cloud");
  assert.equal(own("good-firefly-220.convex.site"), "https://good-firefly-220.convex.cloud");
  assert.equal(own("noleak-arena-n14r.onrender.com"), "");
  // And the page really uses that expression, in that precedence: ?url wins, then the
  // hosting deployment, then what the viewer saved, then the production default.
  assert.match(html, /location\.hostname\.replace\(\/\\\.convex\\\.site\$\/, "\.convex\.cloud"\)/);
  assert.match(html, /q\.get\("url"\) \|\| ownDeployment \|\| ls\.get\("convexUrl"\) \|\| "https:\/\/wary-herring-602\.convex\.cloud"/);
});

test("the guard's control routes stay at the root, ahead of the static catch-all", () => {
  // dsh sessions poll /guard and /invariant on .convex.site. Static Hosting's default
  // mode would move app routes under /api and silently break that.
  const cfg = readFileSync(join(ROOT, "realtime", "convex", "convex.config.ts"), "utf8");
  assert.match(cfg, /app\.use\(staticHosting\);/, "component must be mounted without an httpPrefix");
  const httpTs = readFileSync(join(ROOT, "realtime", "convex", "http.ts"), "utf8");
  const guard = httpTs.indexOf('path: "/guard"'), inv = httpTs.indexOf('path: "/invariant"');
  const statics = httpTs.indexOf("registerStaticRoutes(http");
  assert.ok(guard > 0 && inv > 0 && statics > 0);
  assert.ok(statics > guard && statics > inv, "static catch-all must be registered after the exact routes");
});
