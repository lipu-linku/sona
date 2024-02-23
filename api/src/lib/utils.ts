import { z } from "zod";

export const Book = z.union([
	z.literal("pu"),
	z.literal("ku suli"),
	z.literal("ku lili"),
	z.literal("none"),
]);
export type Book = z.infer<typeof Book>;

export const CoinedEra = z.union([z.literal("pre-pu"), z.literal("post-pu"), z.literal("post-ku")]);
export type CoinedEra = z.infer<typeof CoinedEra>;

export const UsageCategory = z.union([
	z.literal("core"),
	z.literal("common"),
	z.literal("uncommon"),
	z.literal("obscure"),
	z.literal("sandbox"),
]);
export type UsageCategory = z.infer<typeof UsageCategory>;

export const WritingSystem = z.enum([
	"sitelen pona",
	"sitelen sitelen",
	"alphabet",
	"syllabary",
	"logography",
	"tokiponido alphabet",
	"tokiponido syllabary",
	"tokiponido logography",
]);
export type WritingSystem = z.infer<typeof WritingSystem>;

export type * from "./types";

export function getTranslatedData<
	Obj extends { translations: Record<string, object> },
	Key extends keyof Obj["translations"][string],
>(data: Obj, key: Key, language: string): Obj["translations"][string][Key] {
	return ((data.translations[language] ?? data.translations["en"]!) as Obj["translations"][string])[
		key
	];
}
