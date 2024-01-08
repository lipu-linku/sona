import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchWithZod } from "..";
import { rawFile, schemaMiddleware, versions } from "../versioning";

const app = new Hono<{ Variables: (typeof versions)["v1"] }>().use(schemaMiddleware("v1"));

app.get("/words", async (c) => {
	const data = await fetchWithZod(c.var.schemas.data, rawFile("v1", "data.json"));
	const lang = c.req.query("lang")?.split(",") ?? ["en"];
	const orderBy = c.req.query("order") ?? "alphabetical";

	if (orderBy !== "alphabetical" && orderBy !== "usage" && orderBy !== "category")
		throw new HTTPException(400, {
			message: "Invalid order method: must be one of 'alphabetical', 'usage', or 'category'.",
		});

	const reordered = Object.fromEntries(
		Object.entries(data).sort(([key1, value1], [key2, value2]) => {
			if (typeof value1 === "string") return Infinity;
			if (typeof value2 === "string") return -Infinity;

			switch (orderBy) {
				case "alphabetical":
					return key1.localeCompare(key2);
				case "usage":
					return value1.recognition;
				case "category":
			}
		}),
	);

	return c.json();
});

app.get("/word/:word", async (c) => {
	const data = await getData("v1");
	const word = data[c.req.param("word")];
	if (!word) return c.notFound();

	const languages = c.req.query("lang")?.split(",") ?? ["en"];

	return c.json({
		...word,
		translations:
			languages.length === 1 && languages[0] === "*"
				? word.translations
				: Object.fromEntries(
						Object.entries(word.translations).filter(([key, _]) => languages.includes(key)),
				  ),
	});
});

export default app;
