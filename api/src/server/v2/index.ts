import { Fonts, Languages, Words, Glyphs, Signs, Fingerspellings } from "../../lib/v2/";
import { langIdCoalesce, langValidator } from "../utils";
import { fetchFile, type ApiVersion } from "../versioning";
import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import { fromZodError } from "zod-validation-error";

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
};

let CACHE: Record<keyof typeof config, Record<string, any>> = {};
export const fetchData = async (key: keyof typeof config, langcode: string = "en") => {
  // NOTE: if langcode is not provided, data goes under "en" despite having no translations
  if (CACHE && CACHE[key] && CACHE[key][langcode]) {
    return CACHE[key][langcode];
  }

  const file = await fetchFile(API_VERSION, config[key], langcode);
  if (!file.success) {
    throw new HTTPException(500, { message: fromZodError(file.error).message });
  }

  CACHE[key] = CACHE[key] || {};
  CACHE[key][langcode] = file;
  return file;
};

const langParamtoLangcode = async (langParam: string | undefined) => {
  if (!langParam) return "en";
  const languages = await fetchData("languages");
  const langcode = langIdCoalesce(langParam, languages.data);
  return langcode;
};

const datasetEndpoint = async (c: Context, key: keyof typeof config) => {
  const langcode = await langParamtoLangcode(c.req.query("lang"));
  const data = await fetchData(key, langcode);
  return c.json(data, 200);
};

const singleItemEndpoint = async (
  c: Context,
  key: keyof typeof config,
  param: string,
  descriptor: string,
) => {
  const langcode = await langParamtoLangcode(c.req.query("lang"));
  const data = await fetchData(key, langcode);
  const id = c.req.param(param);
  const itemData = data.data[id];
  return itemData
    ? c.json({ success: true as const, data: itemData }, 200)
    : c.json({ success: false as const, message: `Could not find the ${descriptor} ${id}` }, 400);
};

const app = new Hono()
  .get("/", (c) => c.redirect("/v2/words"))
  .get("/words", langValidator, async (c) => {
    return datasetEndpoint(c, "words");
  })
  .get(
    "/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "words", "word", "word");
    },
  )

  .get("/glyphs", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    return datasetEndpoint(c, "glyphs");
  })
  .get(
    "/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "glyphs", "glyph", "glyph");
    },
  )
  .get("/sandbox", (c) => c.redirect("/v2/sandbox/words"))
  .get("/sandbox/words", langValidator, async (c) => {
    return datasetEndpoint(c, "sandbox_words");
  })
  .get(
    "/sandbox/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "sandbox_words", "word", "sandbox word");
    },
  )
  .get("/sandbox/glyphs", langValidator, async (c) => {
    return datasetEndpoint(c, "sandbox_glyphs");
  })
  .get(
    "/sandbox/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "sandbox_glyphs", "glyph", "sandbox glyph");
    },
  )

  .get("/luka_pona/signs", langValidator, async (c) => {
    return datasetEndpoint(c, "signs");
  })
  .get(
    "/luka_pona/signs/:sign",
    langValidator,
    zValidator("param", z.object({ sign: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "signs", "sign", "sign");
    },
  )
  .get("/luka_pona/fingerspellings", langValidator, async (c) => {
    return datasetEndpoint(c, "fingerspellings");
  })
  .get(
    "/luka_pona/fingerspellings/:fingerspelling",
    langValidator,
    zValidator("param", z.object({ sign: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "fingerspellings", "fingerspelling", "fingerspelling");
    },
  )

  .get("/fonts", async (c) => {
    return datasetEndpoint(c, "fonts");
  })
  .get("/fonts/:font", zValidator("param", z.object({ font: z.string() })), async (c) => {
    return singleItemEndpoint(c, "fonts", "font", "font");
  })

  .get("/languages", async (c) => {
    return datasetEndpoint(c, "languages");
  })
  .get(
    "/languages/:language",
    zValidator("param", z.object({ language: z.string() })),
    async (c) => {
      return singleItemEndpoint(c, "languages", "language", "language");
    },
  );

export default app;
