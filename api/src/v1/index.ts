import { Hono } from "hono";
import { fetchWithZod } from "..";
import { languagesFilter } from "../utils";
import { rawFile, versions } from "../versioning";

const app = new Hono();

app.get("/", (c) => c.redirect("/v1/words"));

app.use("/words", languagesFilter(true));
app.use("/words/:word", languagesFilter(false));
app.use("/luka_pona/fingerspelling", languagesFilter(true));
app.use("/luka_pona/fingerspelling/:sign", languagesFilter(true));
app.use("/luka_pona/signs", languagesFilter(true));
app.use("/luka_pona/signs/:sign", languagesFilter(true));

app.get("/words", async (c) => {
	return c.json(await fetchWithZod(versions.v1.schemas.words, rawFile("v1", "words.json")));
});

app.get("/words/:word", async (c) => {
	const data = await fetchWithZod(versions.v1.schemas.words, rawFile("v1", "words.json"));
	const word = data[c.req.param("word")];
	if (!word) return c.notFound();

	return c.json(word);
});

app.get("/luka_pona/fingerspelling", async (c) => {
	return c.json(
		await fetchWithZod(versions.v1.schemas.fingerspelling, rawFile("v1", "fingerspelling.json")),
	);
});

app.get("/luka_pona/fingerspelling/:sign", async (c) => {
	const data = await fetchWithZod(
		versions.v1.schemas.fingerspelling,
		rawFile("v1", "fingerspelling.json"),
	);
	const sign = data[c.req.param("sign")];
	if (!sign) return c.notFound();
	return c.json(sign);
});

app.get("/luka_pona/signs", async (c) => {
	return c.json(await fetchWithZod(versions.v1.schemas.signs, rawFile("v1", "signs.json")));
});

app.get("/luka_pona/signs/:sign", async (c) => {
	const data = await fetchWithZod(versions.v1.schemas.signs, rawFile("v1", "signs.json"));
	const sign = data[c.req.param("sign")];
	if (!sign) return c.notFound();
	return c.json(sign);
});

app.get("/fonts", async (c) => {
	return c.json(await fetchWithZod(versions.v1.schemas.fonts, rawFile("v1", "fonts.json")));
});

app.get("/fonts/:font", async (c) => {
	const data = await fetchWithZod(versions.v1.schemas.fonts, rawFile("v1", "fonts.json"));
	const sign = data[c.req.param("font")];
	if (!sign) return c.notFound();
	return c.json(sign);
});

export default app;
