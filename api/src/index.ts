import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { createZodFetcher } from "zod-fetch";
import v1 from "./v1";

export const fetchWithZod = createZodFetcher();

const app = new Hono({ strict: false });
app.use("*", prettyJSON());
app.use("*", logger());
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/", (c) => {
	return c.redirect("/v1");
});
app.route("/v1", v1);

export default app;
