import { Hono } from "hono";
import { branches } from "../branches";
import { tomlMiddleware } from "../utils";

export const API_URL = `https://raw.githubusercontent.com/lipu-linku/sona/${branches.v1}`;

const app = new Hono().options();

app.get("/about", (c) =>
	c.json({
		api_url: API_URL,
		version: 1,
	}),
);

app.get("/word/:word", tomlMiddleware, async (c) => {
	const data = await fetch(`${API_URL}/words/${c.req.param("word")}.toml`)
		.then((r) => r.text())
});

export default app;
