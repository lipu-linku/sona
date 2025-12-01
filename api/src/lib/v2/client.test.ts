import type { ClientResponse } from "hono/client";
import type { Equal, Expect } from "hono/utils/types";
import { client } from "./client";
import type {
  Fingerspelling,
  Fingerspellings,
  Font,
  Fonts,
  Glyph,
  Glyphs,
  Language,
  Languages,
  Sign,
  Signs,
  Word,
  Words,
} from "./index";

type ResponseType<F> = F extends { $get: (...args: any[]) => Promise<ClientResponse<infer O>> }
  ? O
  : never;
type ClientType = ReturnType<typeof client>;
type Result<T> = { success: true; data: T } | { success: false; message: string };

export type WordsTest = Expect<Equal<ResponseType<ClientType["v2"]["words"]>, Words>>;
export type WordTest = Expect<
  Equal<ResponseType<ClientType["v2"]["words"][":word"]>, Result<Word>>
>;

export type GlyphsTest = Expect<Equal<ResponseType<ClientType["v2"]["glyphs"]>, Glyphs>>;
export type GlyphTest = Expect<
  Equal<ResponseType<ClientType["v2"]["glyphs"][":glyph"]>, Result<Glyph>>
>;

export type SignsTest = Expect<Equal<ResponseType<ClientType["v2"]["luka_pona"]["signs"]>, Signs>>;
export type SignTest = Expect<
  Equal<ResponseType<ClientType["v2"]["luka_pona"]["signs"][":sign"]>, Result<Sign>>
>;

export type FingerspellingsTest = Expect<
  Equal<ResponseType<ClientType["v2"]["luka_pona"]["fingerspellings"]>, Fingerspellings>
>;
export type FingerspellingTest = Expect<
  Equal<
    ResponseType<ClientType["v2"]["luka_pona"]["fingerspellings"][":fingerspelling"]>,
    Result<Fingerspelling>
  >
>;

export type SandboxWordsTest = Expect<
  Equal<ResponseType<ClientType["v2"]["sandbox"]["words"]>, Words>
>;
export type SandboxWordTest = Expect<
  Equal<ResponseType<ClientType["v2"]["sandbox"]["words"][":word"]>, Result<Word>>
>;
export type SandboxGlyphsTest = Expect<
  Equal<ResponseType<ClientType["v2"]["sandbox"]["glyphs"]>, Glyphs>
>;
export type SandboxGlyphTest = Expect<
  Equal<ResponseType<ClientType["v2"]["sandbox"]["glyphs"][":glyph"]>, Result<Glyph>>
>;

export type FontsTest = Expect<Equal<ResponseType<ClientType["v2"]["fonts"]>, Fonts>>;
export type FontTest = Expect<
  Equal<ResponseType<ClientType["v2"]["fonts"][":font"]>, Result<Font>>
>;

export type LanguagesTest = Expect<Equal<ResponseType<ClientType["v2"]["languages"]>, Languages>>;
export type LanguageTest = Expect<
  Equal<ResponseType<ClientType["v2"]["languages"][":language"]>, Result<Language>>
>;
