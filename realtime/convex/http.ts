import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, components } from "./_generated/api";
import { registerStaticRoutes } from "@convex-dev/static-hosting";

const http = httpRouter();

// GET /guard -> { enabled }  (the local guard plugin polls this)
http.route({
  path: "/guard",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const state = await ctx.runQuery(api.control.guardState, {});
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }),
});

http.route({
  path: "/invariant",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const state = await ctx.runQuery(api.control.invariantState, {});
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }),
});

// Everything else -> the dashboard, via Convex Static Hosting (see convex.config.ts).
// Registered LAST: exact routes win over the static catch-all, so /guard and
// /invariant keep answering the dsh plugins. Paths without an extension, such as
// /dashboard, fall back to index.html.
registerStaticRoutes(http, components.staticHosting);

export default http;
