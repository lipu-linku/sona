import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import PLazy from "p-lazy";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { keys, languagesFilter } from "../utils";
import { rawFile, versions, type FilesToVariables } from "../versioning";

const langValidator = zValidator(
	"query",
	z.object({
		lang: z
			.string()
			.regex(/^([^,]+,)*[^,]+/)
			.optional(),
	}),
);

const rawData = PLazy.from(async () => {
	const res: Record<string, unknown> = {};

	for (const key of keys(versions.v1.raw)) {
		const { filename, schema } = versions.v1.raw[key];
		const file = await fetch(rawFile("v1", filename)).then((r) => r.json());
		const data = schema.safeParse(file);

		if (!data.success)
			throw new HTTPException(500, { message: fromZodError(data.error).toString() });

		res[key] = data.data;
	}

	return res as FilesToVariables<"v1">;
});

const app = new Hono()
	.get("/", (c) => c.redirect("/v1/words"))

	.use("/words", languagesFilter(true))
	.get("/words", langValidator, async (c) => {
		return c.json((await rawData).words);
	})

	.use("/words/:word", languagesFilter(false))
	.get(
		"/words/:word",
		langValidator,
		zValidator("param", z.object({ word: z.string() })),
		async (c) => {
			const word = (await rawData).words[c.req.param("word")];

			return word
				? c.json({ ok: true as const, data: word })
				: c.json({ ok: false as const, message: `Could not find a word named ${c.req.param("word")}` }, 404);
		},
	)

	.use("/luka_pona/fingerspelling", languagesFilter(true))
	.get("/luka_pona/fingerspelling", langValidator, async (c) => {
		return c.json((await rawData).fingerspelling);
	})

	.use("/luka_pona/fingerspelling/:sign", languagesFilter(true))
	.get(
		"/luka_pona/fingerspelling/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const sign = (await rawData).fingerspelling[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 404);
		},
	)

	.use("/luka_pona/signs", languagesFilter(true))
	.get("/luka_pona/signs", langValidator, async (c) => {
		return c.json((await rawData).signs);
	})

	.use("/luka_pona/signs/:sign", languagesFilter(true))
	.get(
		"/luka_pona/signs/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		async (c) => {
			const sign = (await rawData).signs[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 404);
		},
	)

	.get("/fonts", async (c) => {
		return c.json((await rawData).fonts);
	})

	.get("/fonts/:font", zValidator("param", z.object({ font: z.string() })), async (c) => {
		const font = (await rawData).fonts[c.req.param("font")];

		return font
			? c.json({ ok: true as const, data: font })
			: c.json({ ok: false as const, message: `Could not find a font named ${font}` }, 404);
	})
	.get("/languages", async (c) => {
		return c.json((await rawData).languages);
	});

export default app;
