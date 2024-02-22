import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import v1 from "./v1";
import { cors } from "hono/cors";
import { cache } from "hono/cache";
import { etag } from "hono/etag";
import { EventContext, serveStatic } from "hono/cloudflare-pages";

const twentyFourHours = 24 * 60 * 60;

const app = new Hono({ strict: false })
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
	.use("/raw/*", async (ctx) => {
		return ctx.env.ASSETS.fetch(ctx.req.raw.clone());
	})
	.route("/v1", v1);

export default app;

export type AppType = typeof app;
