import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import v1 from "./v1/routes";

const app = new Hono();

app.use("*", prettyJSON());
app.notFound((c) => c.json({ message: "Not found", ok: false }, 404));

app.route("/v1", v1);

serve(app);
