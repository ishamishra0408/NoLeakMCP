import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

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

export default http;
