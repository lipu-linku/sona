import { z } from "zod";

export const OptionalDate = z
	.string()
	.regex(/^(20\d{2}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/);

export const Book = z.enum([
	"pu",
	"ku suli",
	"ku lili",
	"none", // mu
]);
export type Book = z.infer<typeof Book>;

export const CoinedEra = z.enum([
	"pre-pu",
	"post-pu",
	"post-ku", // mu
]);
export type CoinedEra = z.infer<typeof CoinedEra>;

export const UsageCategory = z.enum([
	"core",
	"common",
	"uncommon",
	"obscure",
	"sandbox", // mu
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
