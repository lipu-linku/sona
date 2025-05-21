import { z } from "zod";
import { Book, CoinedEra, UsageCategory, WritingSystem, OptionalDate } from "./utils";

export type * from "./types";

// Word data
const Id = z
	.string()
	.min(1)
	.describe("A globally unique identifier for a given object. Generally named after the object.");

export const WordData = z
	.object({
		id: Id.describe(
			"A unique identifier for the word. Generally the word, but may have an integer distinguish words with distinct coinings.",
		),
		author_verbatim: z
			.string()
			.describe("The author's original definition, taken verbatim in their words"),
		author_verbatim_source: z
			.string()
			.describe("Where the author's original definition is located, often a URL."),
		book: Book.describe("Which official Toki Pona book was this word featured in, if any."),
		coined_era: CoinedEra.describe(
			"When this word was coined (relative to the publication dates of the official Toki Pona books, if known)",
		),
		coined_year: z.string().describe("The year when this word was coined (if known)"),
		creator: z.array(z.string().min(1)).describe("The person who created this word (if known)"),
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
		see_also: z.array(z.string().min(1)).describe("A list of related words"),
		resources: z
			.object({
				sona_pona: z
					.string()
					.url()
					.optional()
					.describe(
						"A link to the word's page on sona.pona.la, a Toki Pona wiki. May redirect for words with references but no dedicated page.",
					),
				lipamanka_semantic: z
					.string()
					.url()
					.optional()
					.describe("A link to lipamanka's description of the word's semantic space."),
			})
			.describe("Non-Linku resources related to the specific word, such as wiki links."),
		representations: z
			.object({
				sitelen_emosi: z
					.string()
					.emoji()
					.optional()
					.describe(
						"The sitelen emosi representation of this word, a script for writing Toki Pona using emoji",
					),
				sitelen_jelo: z
					.array(z.string().emoji())
					.min(1)
					.optional()
					.describe("One or more example emojis for how the word can be written in sitelen jelo"),
				ligatures: z
					.array(z.string().min(1))
					.optional()
					.describe(
						"A list of sitelen Lasina representations of the word, used by ligature fonts to visually convert latin characters into sitelen pona",
					),
				sitelen_sitelen: z
					.string()
					.url()
					.optional()
					.describe("A URL pointing to an image of this word's sitelen sitelen hieroglyphic block"),
				ucsur: z
					.string()
					.regex(/^U\+[\da-fA-F]{4,6}$/g)
					.optional()
					.describe(
						"The word's UCSUR codepoint, as defined in https://www.kreativekorp.com/ucsur/charts/sitelen.html",
					),
			})
			.describe("Ways of representing this word via text/computers"),
		source_language: z.string().describe("The language this word originated from"),
		usage_category: UsageCategory.describe(
			"The word's usage category, according to a survey performed by the Linku Project",
		),
		word: z
			.string()
			.describe(`The word's actual text, in case of a word with multiple definitions (like "we")`),
		deprecated: z
			.boolean()
			.describe("Whether or not the word is considered deprecated by its author."),
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
			.record(z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/g), z.number().min(0).max(100))
			.describe(
				"The percentage of people in the Toki Pona community who use this word, according to surveys performed by the Linku Project",
			),
		glyph_ids: z
			.array(Id)
			.describe("A list of ids for sitelen pona glyphs which represent the word."),
		primary_glyph_id: z
			.string()
			// .min(3) # TODO: this is required above sandbox
			.describe("The id of the glyph most often used to represent this word in sitelen pona."),
		synonym_glyph_ids: z
			.array(Id)
			.describe(
				"A list of ids for sitelen pona glyphs which primarily represent another word, but may be used to represent this word.",
			),
	})
	.describe("General info on a Toki Pona word");

// TODO: this is a Record, and therefore suits the toml
// but it does not suit the json or api, and cannot be reused from the toml
// because the toml is reorganized when it is packaged to json
const Commentary = z
	.string()
	.describe("Localized commentary on the parent, such as a word or glyph");

const Definition = z
	.string()
	.min(1)
	.describe("Localized definition on the parent, such as a word or luka pona sign");

const Etymology = z
	.string()
	.describe("Localized etymology information for the parent, such as a word or glyph");

const WordTranslation = z.object({
	commentary: Commentary,
	definition: Definition,
	etymology: Etymology,
});

export const Word = WordData.extend({
	translations: WordTranslation,
});

export const GlyphData = z.object({
	id: Id, // word + dash + number
	word: z.string().min(1),
	word_id: Id,
	usage_category: UsageCategory,
	creator_source: z.string().optional(),
	creator: z.array(z.string().min(1)),
	creation_date: OptionalDate,
	primary: z.boolean(),
	deprecated: z.boolean(),
	image: z.string(), // expected to be URLs but are nullable in sandbox
	svg: z.string(), // can't use || in json schema
	ligature: z.string().min(1).optional(),
	ucsur: z
		.string()
		.regex(/^U\+[\da-fA-F]{4,6}$/g)
		.optional(),
	usage: z.record(z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/g), z.number().min(0).max(100)),
});

const Names = z
	.array(z.string().describe("A name this sitelen pona glyph is known by."))
	.describe("A list of names used to refer to this sitelen pona glyph");

const GlyphTranslation = z.object({ commentary: Commentary, etymology: Etymology, names: Names });

export const Glyph = GlyphData.extend({
	translations: GlyphTranslation,
});

export const SignData = z
	.object({
		id: Id,
		definition: z.string().describe("The definition of the sign as a single toki pona word."),
		is_two_handed: z.boolean().describe("Whether the sign is two-handed or not."),
		new_gloss: z.string().describe("The more recent, preferred gloss for this sign."),
		old_gloss: z.string().describe("The older gloss for this sign, similar to `id`."),
		old_id: z.string().describe("Previous, malformed id for the sign."),
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
				gif: z.string().optional().describe("A link to a gif of the sign being signed."),
				mp4: z.string().optional().describe("a link to an mp4 of the sign being signed."),
			})
			.describe("Videos of the sign being performed, by format."),
	})
	.describe("Unlocalized info on a Luka Pona sign");

const Icons = z.string().describe("Localized descriptions of the thing a sign represents.");

const Parameters = z
	.object({
		handshape: z
			.string()
			.optional()
			.describe(
				"The shape of the hand when signing, identified by its name in ASL. Should not be translated in any language other than Toki Pona",
			),
		movement: z.string().optional().describe("The motion of the hand when signing."),
		placement: z.string().optional().describe("The placement of the hand when signing."),
		orientation: z.string().optional().describe("The orientation of the hand when signing."),
	})
	.describe("Partly localized descriptions of how a sign is signed.");

const SignTranslation = z.object({
	icons: Icons,
	parameters: Parameters,
});

export const Sign = SignData.extend({
	translations: SignTranslation,
});

export const FingerspellingData = z
	.object({
		id: Id.describe("A globally unique name for the fingerspelling which is also a gloss."),
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

const FingerspellingTranslation = z.object({ parameters: Parameters });

export const Fingerspelling = FingerspellingData.extend({
	translations: FingerspellingTranslation,
});

export const Font = z
	.object({
		id: Id.describe("The font's unique ID, identifying it among other fonts"),
		creator: z.array(z.string()).describe("a list of this font's creators"),
		features: z.array(z.string()).describe("a list of features this font supports"),
		filename: z
			.string()
			.regex(/^(?:.+\.(ttf|otf|woff2|woff))?$/)
			.describe("the name of the file this font is stored in at https://github.com/lipu-linku/ijo"),
		last_updated: OptionalDate.describe("the rough date of this font's last update"),
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

const LanguageId = z
	.string()
	.min(2)
	.describe("The language code used by Crowdin. Approximates 2 letter code -> 3 letter code.");

export const Language = z.object({
	id: LanguageId,
	locale: z.string().describe("The locale code corresponding to the language."),
	direction: z
		.union([z.literal("ltr"), z.literal("rtl")])
		.describe("The direction of the language's script."),
	name: z.object({
		// Downstream projects should prefer endonym over name_en
		en: z.string().describe("The name of the language in English."),
		endonym: z.string().describe("The name of the language in that language."),
		// must be added post-hoc
		tok: z.string().optional().describe("The name of the language in Toki Pona."),
	}),
	// TODO: completion percentage on a per-file basis?
	// we also care about completion within usage categories, since the most important words are core+widespread+common
});

export const Languages = z
	.record(LanguageId, Language)
	.describe("The languages offered by sona Linku.");
export const Fonts = z
	.record(Id, Font)
	.describe("A raw data object containing all the fonts data in sona");

// for TOML
export const CommentaryData = z
	.record(Id, Commentary)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const DefinitionData = z
	.record(Id, Definition)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const EtymologyData = z
	.record(Id, Commentary)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const NamesData = z
	.record(Id, Names)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const IconsData = z
	.record(Id, Icons)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const ParametersData = z
	.record(Id, Parameters)
	.describe("A raw data object containing dictionary info about Toki Pona words");

// for JSON
export const WordsData = z
	.record(Id, WordData)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const GlyphsData = z
	.record(Id, GlyphData)
	.describe("A raw data object containing metadata about Sitelen Pona glyphs");
export const SignsData = z
	.record(Id, SignData)
	.describe("A raw data object containing information about Luka Pona signs");
export const FingerspellingsData = z
	.record(Id, FingerspellingData)
	.describe("A raw data object containing information about Luka Pona fingerspelling signs");

// for JSON
export const WordTranslations = z
	.record(Id, WordTranslation)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const GlyphTranslations = z
	.record(Id, GlyphTranslation)
	.describe("A raw data object containing metadata about Sitelen Pona glyphs");
export const SignTranslations = z
	.record(Id, SignTranslation)
	.describe("A raw data object containing information about Luka Pona signs");
export const FingerspellingTranslations = z
	.record(Id, FingerspellingTranslation)
	.describe("A raw data object containing information about Luka Pona fingerspelling signs");

// for API
export const Words = z
	.record(Id, Word)
	.describe("A raw data object containing dictionary info about Toki Pona words");
export const Glyphs = z
	.record(Id, Glyph)
	.describe("A raw data object containing metadata about Sitelen Pona glyphs");
export const Signs = z
	.record(Id, Sign)
	.describe("A raw data object containing information about Luka Pona signs");
export const Fingerspellings = z
	.record(Id, Fingerspelling)
	.describe("A raw data object containing information about Luka Pona fingerspelling signs");

export type WordData = z.infer<typeof WordData>;
export type WordsData = z.infer<typeof WordsData>;

export type Word = z.infer<typeof Word>;
export type Words = z.infer<typeof Words>;

export type GlyphData = z.infer<typeof GlyphData>;
export type GlyphsData = z.infer<typeof GlyphsData>;

export type Glyph = z.infer<typeof Glyph>;
export type Glyphs = z.infer<typeof Glyphs>;

export type SignData = z.infer<typeof SignData>;
export type SignsData = z.infer<typeof SignsData>;

export type Sign = z.infer<typeof Sign>;
export type Signs = z.infer<typeof Signs>;

export type FingerspellingData = z.infer<typeof FingerspellingData>;
export type FingerspellingsData = z.infer<typeof FingerspellingsData>;

export type Fingerspelling = z.infer<typeof Fingerspelling>;
export type Fingerspellings = z.infer<typeof Fingerspellings>;

export type Font = z.infer<typeof Font>;
export type Fonts = z.infer<typeof Fonts>;

export type Language = z.infer<typeof Language>;
export type Languages = z.infer<typeof Languages>;

export type WordTranslations = z.infer<typeof WordTranslations>;
export type GlyphTranslations = z.infer<typeof GlyphTranslations>;
export type SignTranslations = z.infer<typeof SignTranslations>;
export type FingerspellingTranslations = z.infer<typeof FingerspellingTranslations>;
