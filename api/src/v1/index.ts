import { Hono } from "hono";
import { getData } from "../versioning";

const app = new Hono();

app.get("/words", async (c) => {
	return c.json(await getData("v1"));
});

app.get("/word/:word", async (c) => {
	const data = await getData("v1");
	const word = data[c.req.param("word")];
	if (!word) return c.notFound();

	const languages = c.req.query("lang")?.split(",") ?? ["en"];

	if (languages.length === 1 && languages[0] === "*") return c.json(word);

	return c.json({
		...word,
		translations: Object.fromEntries(
			Object.entries(word.translations).filter(([key, _]) => languages.includes(key)),
		),
	});
});

export default app;
