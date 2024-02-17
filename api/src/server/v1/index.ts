import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { fetchWithZod } from "..";
import { languagesFilter } from "../utils";
import { fetchFile, versions } from "../versioning";

const langValidator = zValidator(
	"query",
	z.object({
		lang: z
			.string()
			.regex(/^([^,]+,)*[^,]+/)
			.optional(),
	}),
);

const app = new Hono()
	.get("/", (c) => c.redirect("/v1/words"))

	.use("/words", languagesFilter(true))
	.get("/words", langValidator, async (c) => {
		return c.json(await fetchFile("v1", versions.v1.schemas.words, "words.json"));
	})

	.use("/words/:word", languagesFilter(false))
	.get(
		"/words/:word",
		langValidator,
		zValidator("param", z.object({ word: z.string() })),
		async (c) => {
			const data = await fetchFile("v1", versions.v1.schemas.words, "words.json");
			const word = data[c.req.param("word")];

			return word
				? c.json({ ok: true as const, data: word })
				: c.json(
						{ ok: false as const, message: `Could not find a word named ${c.req.param("word")}` },
						404,
					);
		},
	)

	.use("/luka_pona/fingerspelling", languagesFilter(true))
	.get("/luka_pona/fingerspelling", langValidator, async (c) => {
		return c.json(await fetchFile("v1", versions.v1.schemas.fingerspelling, "fingerspelling.json"));
	})

	.use("/luka_pona/fingerspelling/:sign", languagesFilter(true))
	.get(
		"/luka_pona/fingerspelling/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const data = await fetchFile("v1", versions.v1.schemas.fingerspelling, "fingerspelling.json");
			const sign = data[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 404);
		},
	)

	.use("/luka_pona/signs", languagesFilter(true))
	.get("/luka_pona/signs", langValidator, async (c) => {
		return c.json(await fetchFile("v1", versions.v1.schemas.signs, "signs.json"));
	})

	.use("/luka_pona/signs/:sign", languagesFilter(true))
	.get(
		"/luka_pona/signs/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const data = await fetchFile("v1", versions.v1.schemas.signs, "signs.json");
			const sign = data[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 404);
		},
	)

	.get("/fonts", async (c) => {
		return c.json(await fetchFile("v1", versions.v1.schemas.fonts, "fonts.json"));
	})

	.get("/fonts/:font", zValidator("param", z.object({ font: z.string() })), async (c) => {
		const data = await fetchFile("v1", versions.v1.schemas.fonts, "fonts.json");
		const font = data[c.req.param("font")];

		return font
			? c.json({ ok: true as const, data: font })
			: c.json({ ok: false as const, message: `Could not find a font named ${font}` }, 404);
	})
	.get("/languages", async (c) => {
		return c.json(await fetchFile("v1", versions.v1.schemas.languages, "languages.json"));
	});

export default app;
