import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { createZodFetcher } from "zod-fetch";
import v1 from "./v1";

export const fetchWithZod = createZodFetcher();

const app = new Hono();
app.use("*", prettyJSON());
app.use("*", logger());

app.get("/", (c) => {
	return c.redirect("https://beta.linku.la/");
});
app.route("/v1", v1);

export default app;
