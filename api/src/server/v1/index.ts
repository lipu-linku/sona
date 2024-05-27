import { filterObject, keys, langIdCoalesce, langValidator } from "../utils";
import { fetchFile, versions, type FilesToVariables } from "../versioning";
import { zValidator } from "@hono/zod-validator";
import { Hono, type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import PLazy from "p-lazy";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const rawData = PLazy.from(async () => {
	const res: Record<string, unknown> = {};

	for (const key of keys(versions.v1.raw)) {
		const { filename, schema } = versions.v1.raw[key];
		const file = await fetchFile("v1", schema, filename);
		if (!file.success) throw new HTTPException(500, { message: fromZodError(file.error).message });

		res[key] = file.data;
	}

	return res as FilesToVariables<"v1">;
});

// this would be a util but is very tied to the behavior of v1
export const languagesFilter =
	(nested: boolean): MiddlewareHandler =>
	async (c, next) => {
		await next();
		const body = await c.res.clone().json();
		if ("ok" in body && body.ok === false) return body;

		const requestedLanguages = c.req.query("lang")?.split(",") ?? ["en"];
		if (requestedLanguages.length === 1 && requestedLanguages[0] === "*") return;

		const languages = (await rawData).languages;
		const mappedLangs = requestedLanguages.map((lang: string) => langIdCoalesce(lang, languages));
		if (mappedLangs.includes(undefined)) {
			throw new HTTPException(400, {
				message: `Cannot find one or more of the requested languages: ${requestedLanguages.join(", ")}`,
				// TODO: inform user which langs are missing
			});
		}

		if (nested) {
			c.res = new Response(
				JSON.stringify(
					Object.fromEntries(
						Object.entries(body)
							.filter(
								(e): e is [string, { translations: Record<string, any> }] =>
									typeof e[1] === "object" &&
									!!e[1] &&
									"translations" in e[1] &&
									typeof e[1]["translations"] === "object",
							)
							.map(([k, v]) => {
								return [
									k,
									{
										...v,
										translations: filterObject(v["translations"], ([k]) => mappedLangs.includes(k)),
									},
								];
							}),
					),
				),
				c.res,
			);
		} else {
			c.res = new Response(
				JSON.stringify({
					...body.data,
					translations: filterObject(body.data["translations"], ([k]) =>
						mappedLangs.includes(k.toString()),
					),
				}),
				c.res,
			);
		}
	};

const app = new Hono()
	.get("/", (c) => c.redirect("/v1/words"))

	.get("/words", langValidator, languagesFilter(true), async (c) => {
		const data = (await rawData).words;
		// FIXME: Remove when packaging script reworked
		const filteredWords = Object.fromEntries(
			Object.entries(data).filter(([, value]) => value.usage_category !== "sandbox"),
		);
		return c.json(filteredWords);
	})

	.get(
		"/words/:word",
		langValidator,
		zValidator("param", z.object({ word: z.string() })),
		languagesFilter(false),
		async (c) => {
			const word = (await rawData).words[c.req.param("word")];

			// FIXME: Remove when packaging script reworked
			return word && word.usage_category !== "sandbox"
				? c.json({ ok: true as const, data: word })
				: c.json(
						{ ok: false as const, message: `Could not find the word ${c.req.param("word")}` },
						400,
					);
		},
	)

	.get("/sandbox", langValidator, languagesFilter(true), async (c) => {
		const data = (await rawData).words;
		// FIXME: Remove when packaging script reworked
		const filteredWords = Object.fromEntries(
			Object.entries(data).filter(([, value]) => value.usage_category === "sandbox"),
		);
		return c.json(filteredWords);

		// return c.json((await rawData).sandbox);
	})

	.get(
		"/sandbox/:word",
		langValidator,
		zValidator("param", z.object({ word: z.string() })),
		languagesFilter(false),
		async (c) => {
			const word = (await rawData).words[c.req.param("word")];
			// FIXME: Remove when packaging script reworked
			return word && word.usage_category === "sandbox"
				? c.json({ ok: true as const, data: word })
				: c.json(
						{
							ok: false as const,
							message: `Could not find the sandbox word "${c.req.param("word")}"`,
						},
						400,
					);
		},
	)

	.get("/luka_pona/fingerspelling", langValidator, languagesFilter(true), async (c) => {
		return c.json((await rawData).fingerspelling);
	})

	.get(
		"/luka_pona/fingerspelling/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		languagesFilter(true),
		async (c) => {
			const sign = (await rawData).fingerspelling[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 400);
		},
	)

	.get("/luka_pona/signs", langValidator, languagesFilter(true), async (c) => {
		return c.json((await rawData).signs);
	})

	.get(
		"/luka_pona/signs/:sign",
		langValidator,
		zValidator("param", z.object({ sign: z.string() })),
		languagesFilter(true),
		async (c) => {
			const sign = (await rawData).signs[c.req.param("sign")];

			return sign
				? c.json({ ok: true as const, data: sign })
				: c.json({ ok: false as const, message: `Could not find a sign named ${sign}` }, 400);
		},
	)

	.get("/fonts", async (c) => {
		return c.json((await rawData).fonts);
	})

	.get("/fonts/:font", zValidator("param", z.object({ font: z.string() })), async (c) => {
		const font = (await rawData).fonts[c.req.param("font")];

		return font
			? c.json({ ok: true as const, data: font })
			: c.json({ ok: false as const, message: `Could not find a font named ${font}` }, 400);
	})

	.get("/languages", async (c) => {
		return c.json((await rawData).languages);
	})

	.get(
		"/languages/:language",
		zValidator("param", z.object({ language: z.string() })),
		async (c) => {
			const language = c.req.param("language");
			const languages = (await rawData).languages;
			const langId = langIdCoalesce(language, languages);

			return langId
				? c.json({ ok: true as const, data: languages[langId]! })
				: c.json(
						{ ok: false as const, message: `Could not find a language named ${language}` },
						400,
					);
		},
	);

export default app;
