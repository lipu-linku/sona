import { Hono } from "hono";
import { fetchWithZod } from "..";
import { rawFile, schemaMiddleware, versions } from "../versioning";

const app = new Hono<{ Variables: (typeof versions)["v1"] }>().use(schemaMiddleware("v1"));

app.get("/words", async (c) => {
	const words = await fetchWithZod(c.var.schemas.words, rawFile("v1", "words.json"));
	const languages = c.req.query("lang")?.split(",") ?? ["en"];

	return c.json(
		Object.fromEntries(
			Object.entries(words).map(([key, val]) => [
				key,
				{
					...val,
					translations:
						languages.length === 1 && languages[0] === "*"
							? val.translations
							: Object.fromEntries(
									Object.entries(val.translations).filter(([key, _]) => languages.includes(key)),
								),
				},
			]),
		),
	);
});

app.get("/word/:word", async (c) => {
	const data = await fetchWithZod(c.var.schemas.words, rawFile("v1", "words.json"));
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
