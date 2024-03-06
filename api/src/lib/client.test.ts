// @ts-ignore 6196
import type {
	Fingerspelling,
	Font,
	Fonts,
	Language,
	Languages,
	LocalizedFingerspellingSign,
	LocalizedSign,
	LocalizedWord,
	Signs,
	Words,
} from "$lib";
import { client } from "$lib/client";
import type { ClientResponse } from "hono/client";
import type { Equal, Expect } from "hono/utils/types";

type ResponseType<F> = F extends { $get: (...args: any[]) => Promise<ClientResponse<infer O>> }
	? O
	: never;
type ClientType = typeof client;
type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export type WordsTest = Expect<Equal<ResponseType<ClientType["v1"]["words"]>, Words>>;
export type WordTest = Expect<
	Equal<ResponseType<ClientType["v1"]["words"][":word"]>, Result<LocalizedWord>>
>;

export type SignsTest = Expect<Equal<ResponseType<ClientType["v1"]["luka_pona"]["signs"]>, Signs>>;
export type SignTest = Expect<
	Equal<ResponseType<ClientType["v1"]["luka_pona"]["signs"][":sign"]>, Result<LocalizedSign>>
>;

export type FingerspellingsTest = Expect<
	Equal<ResponseType<ClientType["v1"]["luka_pona"]["fingerspelling"]>, Fingerspelling>
>;
export type FingerspellingTest = Expect<
	Equal<
		ResponseType<ClientType["v1"]["luka_pona"]["fingerspelling"][":sign"]>,
		Result<LocalizedFingerspellingSign>
	>
>;

export type SandboxTest = Expect<Equal<ResponseType<ClientType["v1"]["sandbox"]>, Words>>;

export type FontsTest = Expect<Equal<ResponseType<ClientType["v1"]["fonts"]>, Fonts>>;
export type FontTest = Expect<
	Equal<ResponseType<ClientType["v1"]["fonts"][":font"]>, Result<Font>>
>;

export type LanguagesTest = Expect<Equal<ResponseType<ClientType["v1"]["languages"]>, Languages>>;
export type LanguageTest = Expect<
	Equal<ResponseType<ClientType["v1"]["languages"][":language"]>, Result<Language>>
>;
