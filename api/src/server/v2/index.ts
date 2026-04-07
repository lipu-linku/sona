import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod/v4";
import {
  Fingerspellings,
  Fonts,
  Glyphs,
  Languages,
  Signs,
  Words,
} from "../../lib/v2/";
import { langIdCoalesce, langValidator } from "../utils";
import { fetchFile, type ApiVersion } from "../versioning";

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
  [K in keyof typeof config]?: Record<
    string,
    z.output<(typeof config)[K]["schema"]>
  >;
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

const app = new Hono()
  .get("/", (c) => c.redirect("/v2/words"))
  .get("/words", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("words", langcode);
    return c.json(data, 200);
  })
  .get(
    "/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("words", langcode);
      const id = c.req.param("word");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the word ${id}`,
            },
            400,
          );
    },
  )

  .get("/glyphs", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("glyphs", langcode);
    return c.json(data, 200);
  })
  .get(
    "/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("glyphs", langcode);
      const id = c.req.param("glyph");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the glyph ${id}`,
            },
            400,
          );
    },
  )
  .get("/sandbox", (c) => c.redirect("/v2/sandbox/words"))
  .get("/sandbox/words", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("sandbox_words", langcode);
    return c.json(data, 200);
  })
  .get(
    "/sandbox/words/:word",
    langValidator,
    zValidator("param", z.object({ word: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("sandbox_words", langcode);
      const id = c.req.param("word");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the sandbox word ${id}`,
            },
            400,
          );
    },
  )
  .get("/sandbox/glyphs", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("sandbox_glyphs", langcode);
    return c.json(data, 200);
  })
  .get(
    "/sandbox/glyphs/:glyph",
    langValidator,
    zValidator("param", z.object({ glyph: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("sandbox_glyphs", langcode);
      const id = c.req.param("glyph");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the sandbox glyph ${id}`,
            },
            400,
          );
    },
  )

  .get("/luka_pona/signs", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("signs", langcode);
    return c.json(data, 200);
  })
  .get(
    "/luka_pona/signs/:sign",
    langValidator,
    zValidator("param", z.object({ sign: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("signs", langcode);
      const id = c.req.param("sign");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the sign ${id}`,
            },
            400,
          );
    },
  )
  .get("/luka_pona/fingerspellings", langValidator, async (c) => {
    const langcode = await langParamtoLangcode(c.req.query("lang"));
    const data = await fetchData("fingerspellings", langcode);
    return c.json(data, 200);
  })
  .get(
    "/luka_pona/fingerspellings/:fingerspelling",
    langValidator,
    zValidator("param", z.object({ fingerspelling: z.string() })),
    async (c) => {
      const langcode = await langParamtoLangcode(c.req.query("lang"));
      const data = await fetchData("fingerspellings", langcode);
      const id = c.req.param("fingerspelling");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the fingerspelling ${id}`,
            },
            400,
          );
    },
  )

  .get("/fonts", async (c) => {
    const data = await fetchData("fonts");
    return c.json(data, 200);
  })
  .get(
    "/fonts/:font",
    zValidator("param", z.object({ font: z.string() })),
    async (c) => {
      const data = await fetchData("fonts");
      const id = c.req.param("font");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the font ${id}`,
            },
            400,
          );
    },
  )

  .get("/languages", async (c) => {
    const data = await fetchData("languages");
    return c.json(data, 200);
  })
  .get(
    "/languages/:language",
    zValidator("param", z.object({ language: z.string() })),
    async (c) => {
      const data = await fetchData("languages");
      const id = c.req.param("language");
      const itemData = data[id];
      return itemData
        ? c.json({ success: true as const, data: itemData }, 200)
        : c.json(
            {
              success: false as const,
              message: `Could not find the language ${id}`,
            },
            400,
          );
    },
  );

export default app;
