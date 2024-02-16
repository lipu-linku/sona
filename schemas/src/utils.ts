import { z } from "zod";
import type {
	Font,
	IconTranslation,
	Language,
	LocalizedWord,
	ParametersTranslation,
	Sign,
} from ".";

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
	z.literal("widespread"),
	z.literal("common"),
	z.literal("uncommon"),
	z.literal("rare"),
	z.literal("obscure"),
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

export type WordRepresentations = LocalizedWord["representations"];
export type WordAudio = LocalizedWord["audio"];
export type WordUsage = LocalizedWord["usage"];
export type WordPuVerbatim = LocalizedWord["pu_verbatim"];
export type WordKuData = LocalizedWord["ku_data"];
export type WordTranslations = LocalizedWord["translations"];
export type WordTranslation = LocalizedWord["translations"][string];
export type LocalizedWordDefinition = WordTranslation["definition"];
export type LocalizedWordEtymology = WordTranslation["etymology"];
export type LocalizedWordCommentary = WordTranslation["commentary"];
export type LocalizedWordSitelenEtymology = WordTranslation["sp_etymology"];

export type SignEtymology = Sign["etymology"];
export type SignWriting = Sign["signwriting"];
export type SignVideo = Sign["video"];
export type LocalizedSignParameters = ParametersTranslation[string];

export type FontLinks = Font["links"];

export function getTranslatedData<
	L extends object,
	K extends keyof L,
	T extends { translations: { en: L } & Record<string, L> },
>(data: T, key: K, language: string): L[K] {
	return (data.translations[language] ?? data.translations["en"])[key];
}
