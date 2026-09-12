import { defineApp } from "convex/server";
import staticHosting from "@convex-dev/static-hosting/convex.config";

// Convex Static Hosting serves dashboard/ at https://<deployment>.convex.site.
//
// Mounted WITHOUT an httpPrefix on purpose ("app-owned root routing"). The default
// mode moves this app's own HTTP routes under /api, and the guard and invariant
// plugins already poll /guard and /invariant at the root of .convex.site from every
// running dsh session. Moving them would silently switch those sessions to their
// fail-safe instead of following the dashboard. So the app keeps the root, and
// convex/http.ts registers the static catch-all after its exact routes.
const app = defineApp();
app.use(staticHosting);

export default app;
