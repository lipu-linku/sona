import { z } from "zod";
import { Book, CoinedEra, UsageCategory } from "./utils";

type Month = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";

export const Word = z
	.object({
		author_verbatim: z
			.string()
			.describe("The author's original definition, taken verbatim in their words"),
		author_verbatim_source: z
			.string()
			.describe("Where the author's original definition is located (usually Discord)"),
		book: Book.describe("Which official Toki Pona book was this word featured in, if any."),
		coined_era: CoinedEra.or(z.literal("")).describe(
			"When this word was coined (relative to the publication dates of the official Toki Pona books, if known)",
		),
		coined_year: z.string().describe("The year when this word was coined (if known)"),
		creator: z.array(z.string()).describe("The person who created this word (if known)"),
		ku_data: z
			.record(z.number().min(0).max(100))
			.optional()
			.describe(
				"The usage data of the word as described in ku (the official Toki Pona dictionary)",
			),
		see_also: z.array(z.string()).describe("A list of related words"),
		representations: z
			.object({
				sitelen_emosi: z
					.string()
					.emoji()
					.or(z.literal(""))
					.describe(
						"The sitelen emosi representation of this word, a script for writing Toki Pona using emoji",
					),
				sitelen_pona: z
					.array(z.string())
					.describe(
						"A list of sitelen Lasina representations of this word, to be converted into sitelen pona glyphs",
					),
				sitelen_sitelen: z
					.string()
					.url()
					.or(z.literal(""))
					.describe("A URL pointing to an image of this word's sitelen sitelen hieroglyphic block"),
				ucsur: z
					.string()
					.regex(/^U\+[\da-fA-F]{4,6}$/g)
					.or(z.literal(""))
					.describe(
						"The word's UCSUR codepoint, as defined in https://www.kreativekorp.com/ucsur/charts/sitelen.html",
					),
			})
			.describe("Ways of representing this word in the real world, via text/computers"),
		source_language: z.string().describe("The language this word originated from"),
		usage_category: UsageCategory.describe(
			"The word's usage category, according to a survey performed by the Linku Project",
		),
		word: z
			.string()
			.describe(`The word's actual text, in case of a word with multiple definitions (like "we")`),
		etymology: z
			.array(
				z.object({
					word: z
						.string()
						.optional()
						.describe(
							"One of the root words of this word, as written out in its language of origin",
						),
					alt: z.string().optional().describe(`A latinized representation of the "word" field`),
				}),
			)
			.describe("Unlocalized etymological values regarding this word's origin"),
		audio: z
			.object({
				jan_lakuse: z
					.string()
					.url()
					.optional()
					.describe(
						"jan Lakuse's pronounciation of the word, made for jan Sonja's Memrise course: https://archive.org/details/toki-pona-audio-by-jan-lakuse",
					),
				kala_asi: z
					.string()
					.url()
					.describe("kala Asi's pronounciation of the word, made for the Linku Project"),
			})
			.describe("Audio files of the words pronounced out loud"),
		pu_verbatim: z
			.object({
				en: z.string().describe("The original definition in the English version of pu"),
				fr: z.string().describe("The original definition in the French version of pu"),
				de: z.string().describe("The original definition in the German version of pu"),
				eo: z.string().describe("The original definition in the Esperanto version of pu"),
			})
			.optional()
			.describe("The original definition of the word in pu, the first official Toki Pona book"),
		recognition: z
			.record(
				z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/g) as z.ZodType<
					`20${number}-${Month}`,
					z.ZodTypeDef,
					`20${number}-${Month}`
				>,
				z.number().min(0).max(100),
			)
			.describe(
				"The percentage of people in the Toki Pona community who recognize this word, according to surveys performed by the Linku Project",
			),
	})
	.describe("General info on a Toki Pona word");

export type Word = z.infer<typeof Word>;

export const CommentaryTranslation = z
	.object({})
	.catchall(z.string())
	.describe("Localized commentary regarding Toki Pona words");

export type CommentaryTranslation = z.infer<typeof CommentaryTranslation>;

export const DefinitionTranslation = z
	.record(z.string())
	.describe("Localized definitions of Toki Pona words");

export type DefinitionTranslation = z.infer<typeof DefinitionTranslation>;

export const SitelenPonaTranslation = z
	.record(z.string())
	.describe("Localized descriptions of the origins of the sitelen pona glyphs for Toki Pona words");

export type SitelenPonaTranslation = z.infer<typeof SitelenPonaTranslation>;

export const EtymologyTranslation = z
	.record(
		z.array(
			z.object({
				definition: z
					.string()
					.optional()
					.describe("The localized definition of the root word in its origin language"),
				language: z
					.string()
					.describe("The localized name of the language this word originated from"),
			}),
		),
	)
	.describe("Localized etymological values for Toki Pona words");

export type EtymologyTranslation = z.infer<typeof EtymologyTranslation>;

export const Data = z
	.record(
		Word.extend({
			translations: z.record(
				z.object({
					commentary: CommentaryTranslation,
					definitions: DefinitionTranslation,
					etymology: EtymologyTranslation,
					sp_etymology: SitelenPonaTranslation,
				}),
			),
		}),
	)
	.describe("A raw data object containing all the sona data");
