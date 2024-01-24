import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { fetchWithZod } from "..";
import { languagesFilter } from "../utils";
import { rawFile, versions } from "../versioning";

const langValidator = zValidator(
	"query",
	z.object({
		lang: z
			.string()
			.regex(/^([^,]+,)[^,]+*/)
			.optional(),
	}),
);

const app = new Hono()
	.get("/", (c) => c.redirect("/v1/words"))

	.use("/words", languagesFilter(true))
	.get("/words", langValidator, async (c) => {
		return c.json(await fetchWithZod(versions.v1.schemas.words, rawFile("v1", "words.json")));
	})

	.use("/words/:word", languagesFilter(false))
	.get(
		"/words/:word",
		langValidator,
		zValidator("param", z.object({ word: z.string() })),
		async (c) => {
			const data = await fetchWithZod(versions.v1.schemas.words, rawFile("v1", "words.json"));
			const word = data[c.req.param("word")];
			if (!word) return c.notFound();

			return c.json(word);
		},
	)

	.use("/luka_pona/fingerspelling", languagesFilter(true))
	.get("/luka_pona/fingerspelling", langValidator, async (c) => {
		return c.json(
			await fetchWithZod(versions.v1.schemas.fingerspelling, rawFile("v1", "fingerspelling.json")),
		);
	})

	.use("/luka_pona/fingerspelling/:sign", languagesFilter(true))
	.get(
		"/luka_pona/fingerspelling/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const data = await fetchWithZod(
				versions.v1.schemas.fingerspelling,
				rawFile("v1", "fingerspelling.json"),
			);
			const sign = data[c.req.param("sign")];
			if (!sign) return c.notFound();
			return c.json(sign);
		},
	)

	.use("/luka_pona/signs", languagesFilter(true))
	.get("/luka_pona/signs", langValidator, async (c) => {
		return c.json(await fetchWithZod(versions.v1.schemas.signs, rawFile("v1", "signs.json")));
	})

	.use("/luka_pona/signs/:sign", languagesFilter(true))
	.get(
		"/luka_pona/signs/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const data = await fetchWithZod(versions.v1.schemas.signs, rawFile("v1", "signs.json"));
			const sign = data[c.req.param("sign")];
			if (!sign) return c.notFound();
			return c.json(sign);
		},
	)

	.get("/fonts", async (c) => {
		return c.json(await fetchWithZod(versions.v1.schemas.fonts, rawFile("v1", "fonts.json")));
	})

	.get("/fonts/:font", zValidator("param", z.object({ font: z.string() })), async (c) => {
		const data = await fetchWithZod(versions.v1.schemas.fonts, rawFile("v1", "fonts.json"));
		const sign = data[c.req.param("font")];
		if (!sign) return c.notFound();
		return c.json(sign);
	});

export default app;
