import { Fonts, Languages, Words, Glyphs, Signs, Fingerspellings } from "../../lib/v2/";
import { langIdCoalesce, langValidator } from "../utils";
import { type ApiVersion, fetchFile, type ApiConfig } from "../versioning";
import { zValidator } from "@hono/zod-validator";
import { Hono, type Context, type Env, type Input } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";

const API_VERSION: ApiVersion = "v2";
export const config = {
  words: {
    root: "/",
    filename: "words.json",
    schema: Words,
    translations: true,
  },
  glyphs: {
    root: "/",
    filename: "glyphs.json",
    schema: Glyphs,
    translations: true,
  },
  sandbox_words: {
    root: "sandbox/",
    filename: "words.json",
    schema: Words,
    translations: true,
  },
  sandbox_glyphs: {
    root: "sandbox/",
    filename: "glyphs.json",
    schema: Glyphs,
    translations: true,
  },
  signs: {
    root: "luka_pona/",
    filename: "signs.json",
    schema: Signs,
    translations: true,
  },
  fingerspellings: {
    root: "luka_pona/",
    filename: "fingerspellings.json",
    schema: Fingerspellings,
    translations: true,
  },
  fonts: {
    root: "/",
    filename: "fonts.json",
    schema: Fonts,
    translations: false,
  },
  languages: {
    root: "/",
    filename: "languages.json",
    schema: Languages,
    translations: false,
  },
} as const;

let CACHE: {
  [K in keyof typeof config]?: Record<string, z.output<(typeof config)[K]["schema"]>>;
} = {};
export const fetchData = async <K extends keyof typeof config>(
  key: K,
  langcode: string = "en",
): Promise<z.output<(typeof config)[K]["schema"]>> => {
  // NOTE: if langcode is not provided, data goes under "en" despite having no translations
  if (CACHE && CACHE[key] && CACHE[key][langcode]) {
    return CACHE[key][langcode];
  }

  const file = await fetchFile(API_VERSION, config[key], langcode);
  if (!file.success) {
    throw new HTTPException(500, { message: z.prettifyError(file.error) });
  }

  CACHE[key] ??= {};
  CACHE[key][langcode] = file.data;
  return file.data;
};

const langParamtoLangcode = async (langParam: string | undefined) => {
  if (!langParam) return "en";
  const languages = await fetchData("languages");
  const langcode = langIdCoalesce(langParam, languages);
  return langcode;
};

const datasetEndpoint = <K extends keyof typeof config>(key: K) => {
  return async <C extends Context>(c: C) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData(key, langcode);
    return c.json(data, 200);
  };
};

const singleItemEndpoint = <const K extends keyof typeof config, const P extends string>(
  key: K,
  param: P,
  descriptor: string,
) => {
  return async <
    C extends Context<
      any,
      `:${P}`,
      { in: { param: { [key in P]: string } }; out: { param: { [key in P]: string } } }
    >,
  >(
    c: C,
  ) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData(key, langcode);
    const id = c.req.param(param)!; // hono doesn't know if P ends in a ?, so it defaults to optional
    const itemData = data[id];
    return itemData
      ? c.json(
          {
            success: true as const,
            data: itemData as z.output<(typeof config)[K]["schema"]>[string],
          },
          200,
        )
      : c.json({ success: false as const, message: `Could not find the ${descriptor} ${id}` }, 400);
  };
};

const app = new Hono()
  .get("/", (c) => c.redirect("/v2/words"))
  .get("/words", langValidator, datasetEndpoint("words"))
  .get(
    "/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    singleItemEndpoint("words", "word", "word"),
  )

  .get("/glyphs", langValidator, datasetEndpoint("glyphs"))
  .get(
    "/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    singleItemEndpoint("glyphs", "glyph", "glyph"),
  )
  .get("/sandbox", (c) => c.redirect("/v2/sandbox/words"))
  .get("/sandbox/words", langValidator, datasetEndpoint("sandbox_words"))
  .get(
    "/sandbox/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    singleItemEndpoint("sandbox_words", "word", "sandbox word"),
  )
  .get("/sandbox/glyphs", langValidator, datasetEndpoint("sandbox_glyphs"))
  .get(
    "/sandbox/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    singleItemEndpoint("sandbox_glyphs", "glyph", "sandbox glyph"),
  )

  .get("/luka_pona/signs", langValidator, datasetEndpoint("signs"))
  .get(
    "/luka_pona/signs/:sign",
    langValidator,
    zValidator("param", z.object({ sign: z.string() })),
    singleItemEndpoint("signs", "sign", "sign"),
  )
  .get("/luka_pona/fingerspellings", langValidator, datasetEndpoint("fingerspellings"))
  .get(
    "/luka_pona/fingerspellings/:fingerspelling",
    langValidator,
    zValidator("param", z.object({ sign: z.string() })),
    singleItemEndpoint("fingerspellings", "fingerspelling", "fingerspelling"),
  )

  .get("/fonts", datasetEndpoint("fonts"))
  .get(
    "/fonts/:font",
    zValidator("param", z.object({ font: z.string() })),
    singleItemEndpoint("fonts", "font", "font"),
  )

  .get("/languages", datasetEndpoint("languages"))
  .get(
    "/languages/:language",
    zValidator("param", z.object({ language: z.string() })),
    singleItemEndpoint("languages", "language", "language"),
  );

export default app;
