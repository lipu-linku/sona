import { z } from "zod";
import { Book, CoinedEra, UsageCategory, WritingSystem, YearMonth } from "./utils";

// Word data

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
			.record(
				z.string().min(1).describe("A translation of the word into English proposed in ku"),
				z
					.number()
					.min(0)
					.max(100)
					.describe(
						"The percentage of ku survey respondents who report this translation as accurate to their usage.",
					),
			)
			.optional()
			.describe(
				"The usage data of the word as described in ku (the official Toki Pona dictionary)",
			),
		see_also: z.array(z.string()).describe("A list of related words"),
		sona_pona: z
			.string()
			.url()
			.optional()
			.describe(
				"A link to the word's page on sona.pona.la, a Toki Pona wiki. May redirect for words with references but no dedicated page.",
			),
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
		audio: z.array(
			z
				.object({
					author: z.string().describe("The author of the audio file in `link`."),
					link: z
						.string()
						.url()
						.describe("A link to the audio file for the word, pronounced by `author`."),
				})
				.describe("Audio files of the words pronounced out loud"),
		),
		pu_verbatim: z
			.object({
				en: z.string().describe("The original definition in the English version of pu"),
				fr: z.string().describe("The original definition in the French version of pu"),
				de: z.string().describe("The original definition in the German version of pu"),
				eo: z.string().describe("The original definition in the Esperanto version of pu"),
			})
			.optional()
			.describe("The original definition of the word in pu, the first official Toki Pona book"),
		usage: z
			.record(
				z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/g) as z.ZodType<
					`20${number}-${Month}`,
					z.ZodTypeDef,
					`20${number}-${Month}`
				>,
				z.number().min(0).max(100),
			)
			.describe(
				"The percentage of people in the Toki Pona community who use this word, according to surveys performed by the Linku Project",
			),
	})
	.describe("General info on a Toki Pona word");

export type Word = z.infer<typeof Word>;

export const CommentaryTranslation = z
	.record(z.string().min(1), z.string())
	.describe("Localized commentary regarding Toki Pona words");

export type CommentaryTranslation = z.infer<typeof CommentaryTranslation>;

export const DefinitionTranslation = z
	.record(z.string().min(1), z.string().min(1))
	.describe("Localized definitions of Toki Pona words");

export type DefinitionTranslation = z.infer<typeof DefinitionTranslation>;

export const SitelenPonaTranslation = z
	.record(z.string().min(1), z.string())
	.describe("Localized descriptions of the origins of the sitelen pona glyphs for Toki Pona words");

export type SitelenPonaTranslation = z.infer<typeof SitelenPonaTranslation>;

export const EtymologyTranslation = z
	.record(
		z.string().min(1),
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

export const Sign = z
	.object({
		definition: z.string().describe("The definition of the sign as a single toki pona word."),
		id: z.string().describe("A globally unique name for the sign which is also a gloss."),
		is_two_handed: z.boolean().describe("Whether the sign is two-handed or not."),
		new_gloss: z.string().describe("The more recent, preferred gloss for this sign."),
		old_gloss: z.string().describe("The older gloss for this sign, similar to `id`."),
		etymology: z
			.array(
				z.object({
					language: z.string().describe("The language of the sign."),
					sign: z
						.string()
						.optional()
						.describe(
							"The name of the sign such that it could be found in a sign language dictionary.",
						),
				}),
			)
			.describe("Unlocalized etymological values regarding this sign's origin"),
		signwriting: z
			.object({
				fsw: z
					.string()
					.describe(
						"The [Formal SignWriting](https://en.wikipedia.org/wiki/SignWriting) representation of the sign.",
					),
				swu: z
					.string()
					.describe(
						"The [SignWriting with Unicode](https://en.wikipedia.org/wiki/SignWriting) representation of the sign.",
					),
			})
			.describe("Scripts for representing a sign as characters."),
		video: z
			.object({
				gif: z.string().describe("A link to a gif of the sign being signed."),
				mp4: z.string().describe("a link to an mp4 of the sign being signed."),
			})
			.describe("Videos of the sign being performed, by format."),
	})
	.describe("Unlocalized info on a Luka Pona sign");

export type Sign = z.infer<typeof Sign>;

export const FingerspellingSign = z
	.object({
		id: z.string().describe("A globally unique name for the sign which is also a gloss."),
		is_two_handed: z.boolean().describe("Whether the sign is two-handed or not."),
		etymology: z
			.array(
				z.object({
					language: z.string().describe("The language of the sign."),
					sign: z
						.string()
						.describe(
							"The name of the sign such that it could be found in a sign language dictionary.",
						),
				}),
			)
			.describe("Unlocalized etymological values regarding this sign's origin"),
		signwriting: z
			.object({
				fsw: z.string().describe("The Formal Sign Writing representation of the sign."),
				swu: z.string().describe("The Sign Writing with Unicode representation of hte sign."),
			})
			.describe("Scripts for representing a sign as characters."),
		video: z
			.object({
				gif: z.string().optional().describe("A link to a gif of the sign being signed."),
				mp4: z.string().optional().describe("a link to an mp4 of the sign being signed."),
			})
			.describe("Videos of the sign being performed, by format."),
	})
	.describe("Unlocalized info on a fingerspelling sign.");

export type FingerspellingSign = z.infer<typeof FingerspellingSign>;

export const ParametersTranslation = z
	.record(
		z.string().min(1),
		z.object({
			handshape: z
				.string()
				.optional()
				.describe(
					"The shape of the hand when signing, identified by its name in ASL. Should not be translated in any language other than Toki Pona",
				),
			movement: z.string().optional().describe("The motion of the hand when signing."),
			placement: z.string().optional().describe("The placement of the hand when signing."),
			orientation: z.string().optional().describe("The orientation of the hand when signing."),
		}),
	)
	.describe("Partly localized descriptions of how a sign is signed.");

export type ParametersTranslation = z.infer<typeof ParametersTranslation>;

export const IconTranslation = z
	.record(z.string().min(1), z.string())
	.describe("Localized descriptions of the thing a sign represents.");

export type IconTranslation = z.infer<typeof IconTranslation>;

export const Font = z
	.object({
		creator: z.array(z.string()).describe("a list of this font's creators"),
		features: z.array(z.string()).describe("a list of features this font supports"),
		filename: z
			.string()
			.regex(/^(?:.+\.(ttf|otf|woff2|woff))?$/)
			.describe("the name of the file this font is stored in at https://github.com/lipu-linku/ijo"),
		last_updated: YearMonth.optional().describe("the rough date of this font's last update"),
		license: z
			.string()
			.describe("an SPDX expression describing this font's license: https://spdx.org/licenses/"),
		ligatures: z.boolean().describe("whether this font supports ligatures"),
		name: z.string().min(1).describe("this font's name"),
		style: z.string().min(1).describe("the general style of this font"),
		ucsur: z
			.boolean()
			.describe(
				"whether this font conforms to the UCSUR standard: https://www.kreativekorp.com/ucsur/charts/sitelen.html",
			),
		version: z.string().describe("the current version of this font"),
		writing_system: WritingSystem.describe("the writing system this font uses as its script"),
		links: z.object({
			fontfile: z
				.string()
				.url()
				.optional()
				.describe(
					"a link to the font file published by the original author (not the mirror on the Linku Project's GitHub)",
				),
			repo: z
				.string()
				.url()
				.optional()
				.describe(
					"a link to a web hosted repository of this font's source files (usually hosted on GitHub or GitLab)",
				),
			webpage: z
				.string()
				.url()
				.optional()
				.describe(
					"a link to this font's home page, usually showcasing its features and usage/installation",
				),
		}),
	})
	.describe("Info on a font for Toki Pona");
export type Font = z.infer<typeof Font>;

export const Words = z
	.record(
		z.string().min(1),
		Word.extend({
			translations: z.record(
				z.object({
					commentary: CommentaryTranslation.valueSchema,
					definitions: DefinitionTranslation.valueSchema,
					etymology: EtymologyTranslation.valueSchema,
					sp_etymology: SitelenPonaTranslation.valueSchema,
				}),
			),
		}),
	)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export type Words = z.infer<typeof Words>;

export const Sandbox = Words.describe(
	"A raw data object containing dictionary info about Toki Pona sandbox",
);
export type Sandbox = z.infer<typeof Sandbox>;

export const Signs = z
	.record(
		z.string().min(1),
		Sign.extend({
			translations: z.record(
				z.object({
					parameters: ParametersTranslation.valueSchema,
					icons: IconTranslation.valueSchema,
				}),
			),
		}),
	)
	.describe("A raw data object containing information about Luka Pona signs");
export type Signs = z.infer<typeof Signs>;

export const Fingerspelling = z
	.record(
		z.string().min(1),
		FingerspellingSign.extend({
			translations: z.record(z.object({ parameters: ParametersTranslation.valueSchema })),
		}),
	)
	.describe("A raw data object containing information about Luka Pona fingerspelling signs");
export type Fingerspelling = z.infer<typeof Fingerspelling>;

export const Fonts = z
	.record(Font)
	.describe("A raw data object containing all the fonts data in sona");
export type Fonts = z.infer<typeof Fonts>;

export const Languages = z.record(
	z
		.string()
		.min(2)
		.describe("The language code used by Crowdin. Approximates 2 letter code -> 3 letter code."),
	z
		.object({
			locale: z.string().describe("The locale code corresponding to the language."),
			name: z.object({
				en: z.string().describe("The name of the language in English."),
				// These are optional because we can add a language via Crowdin and Crowdin doesn't provide these.
				// Downstream projects should prefer endonym over name_en if both are available.
				tok: z.string().optional().describe("The name of the language in Toki Pona."),
				endonym: z.string().optional().describe("The name of the language in that language."),
			}),
			// TODO: completion percentage on a per-file basis?
			// we also care about completion within usage categories, since the most important words are core+widespread+common
		})
		.describe("The languages offered by sona Linku."),
);

export type Languages = z.infer<typeof Languages>;
