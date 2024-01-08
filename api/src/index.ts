import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { stringify as toYaml } from "yaml";
import v1 from "./v1";
import { createZodFetcher } from "zod-fetch";

export const fetchWithZod = createZodFetcher();

const app = new Hono();
app.use("*", prettyJSON());
app.use("*", logger());

app.use("*", async (c, next) => {
	const format = c.req.query("format") ?? "json";

	await next();

	switch (format) {
		case "yaml":
			c.header("Content-Type", "application/x-yaml");
			c.res = new Response(toYaml(await c.res.json()), c.res);
			break;

		case "json":
			break;

		default:
			throw new HTTPException(400, { message: `Invalid output format: ${format}` });
	}
});

app.route("/v1", v1);

serve(app);
