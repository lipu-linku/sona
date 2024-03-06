import { Hono } from "hono";

import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";

import v1 from "./v1";

const twentyFourHours = 24 * 60 * 60;

const app = new Hono({ strict: false })
	.use("*", secureHeaders())
	.use("*", prettyJSON())
	.use("*", logger())
	.use(
		"*",
		cors({
			origin: "*",
			maxAge: twentyFourHours,
		}),
	)
	.use(
		"*",
		import.meta.env.MODE === "production"
			? cache({
					cacheName: "sona-api",
					cacheControl: `max-age=${twentyFourHours}`,
				})
			: async (c, next) => await next(),
	)
	.use("*", etag())
	.notFound((c) => c.json({ message: "Not Found", ok: false as const }, 404))
	.onError((err, c) => {
		console.error(err);
		return c.json(
			{
				ok: false as const,
				message: err.message,
			},
			{ status: "status" in err && typeof err.status === "number" ? err.status : 500 },
		);
	})
	.get("/", (c) => {
		return c.redirect("/v1");
	})
	.route("/v1", v1);

export default app;

export type AppType = typeof app;
