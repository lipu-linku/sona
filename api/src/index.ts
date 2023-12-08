import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import v1 from "./v1";

const app = new Hono();
app.use("*", prettyJSON());
app.use("*", logger());

app.route("/v1", v1);

serve(app);
