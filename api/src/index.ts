import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { createZodFetcher } from "zod-fetch";
import v1 from "./v1";
import { cors } from "hono/cors";
import { cache } from "hono/cache";
import type { StatusCode } from "hono/utils/http-status";

export const fetchWithZod = createZodFetcher();

const twentyFourHours = 24 * 60 * 60;

const app = new Hono({ strict: false })
	.use(prettyJSON())
	.use(logger())
	.use(
		cors({
			origin: "*",
			maxAge: twentyFourHours,
		}),
	)
	.use(
		"*",
		import.meta.env.PROD
			? cache({
					cacheName: "sona-api",
					cacheControl: `max-age=${twentyFourHours}`,
				})
			: async (c, next) => await next(),
	)
	.notFound((c) => c.json({ message: "Not Found", ok: false }, 404))
	.onError((err, c) => {
		return c.json(
			{
				ok: false,
				message: err.message,
			},
			"status" in err && typeof err.status === "number" ? (err.status as StatusCode) : 500,
		);
	})
	.get("/", (c) => {
		return c.redirect("/v1");
	})
	.route("/v1", v1);

export default app;

export type AppType = typeof app;
