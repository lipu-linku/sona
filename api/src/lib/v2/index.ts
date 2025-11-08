import { z } from "zod/v4";
import { Book, Era, UsageCategory, WritingSystem, OptionalDate, Date, Score } from "./utils";

export type * from "./types";

const Id = z
  .string()
  .min(1)
  .describe("A unique identifier for an object in Linku. Generally named after the object.");
const Ref = Id.describe("The ID of an object related to this one.");
const Refs = z.array(Id).describe("The IDs of other objects related to this one.");

const Creators = z
  .array(z.string().min(1))
  .describe("The name or names of those involved in creating this object (if known)");

const Usage = z
  .record(Date, Score)
  .describe(
    "The percentage of respondents to an annual Linku survey who report to use this object.",
  );
const Teachability = z
  .number()
  .min(1)
  .max(4)
  .describe(
    "The tier of teachability for this object, as defined by the Sitelen Pona Publishers and Typographers Association.",
  );

const Ligature = z.string().min(1);
const Ligatures = z.array(Ligature).optional();

const UcsurCodepoint = z
  .string()
  .regex(/^U\+[\da-fA-F]{4,6}$/g)
  .optional()
  .describe(
    "A UCSUR codepoint, as defined in https://www.kreativekorp.com/ucsur/charts/sitelen.html",
  );
const UnicodeCodepoint = z
  .string()
  // .regex(/^U\+[\da-fA-F]{4,6}$/g)
  .optional()
  .describe("A Unicode codepoint, yet to be defined.");

const SeeAlso = Refs.describe("A list of object IDs of objects related to this one.");
const Source = z.string().describe("The source or origin of this object, often a URL.");
const Resource = z.url().describe("A URL pointing to some external resource.");
const Deprecated = z
  .boolean()
  .describe("Whether the object is considered deprecated by its author(s).");

const Audio = z
  .object({
    author: z.string().describe("The author of the audio file in `link`."),
    link: Resource.describe("A link to the audio file for the word, pronounced by `author`."),
  })
  .describe("Audio files of the words pronounced out loud");

const Video = z
  .object({
    gif: Resource.describe("A link to a gif of the sign being signed."),
    mp4: Resource.describe("a link to an mp4 of the sign being signed."),
  })
  .describe("Videos of the sign being performed, by format.");

const SignWriting = z
  .object({
    fsw: z
      .string()
      .min(1)
      .describe(
        "The [Formal SignWriting](https://en.wikipedia.org/wiki/SignWriting) representation of the sign.",
      ),
    swu: z
      .string()
      .min(1)
      .describe(
        "The [SignWriting with Unicode](https://en.wikipedia.org/wiki/SignWriting) representation of the sign.",
      ),
  })
  .describe("Scripts for representing a sign as characters.");

// translatables
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

const Names = z
  .array(z.string().describe("A name this sitelen pona glyph is known by."))
  .describe("A list of names used to refer to this sitelen pona glyph");

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

// Word data
export const Word = z
  .object({
    id: Id.describe(
      "A unique identifier for the word. Almost always the word, but may have an integer distinguish words with distinct coinings.",
    ),
    word: z
      .string()
      .min(1)
      .describe(`The word's actual text, in case of a word with multiple definitions (like "we")`),
    creator_verbatim: z
      .string()
      .optional()
      .describe("The author's original definition, taken verbatim in their words"),
    creator_source: Source.optional(),
    book: Book.describe("Which official Toki Pona book was this word featured in, if any."),
    era: Era.describe(
      "The period of time in which this word was coined, relative to the publication of the first two official Toki Pona books",
    ),
    creation_date: OptionalDate.describe("When this word was coined, to precision known."),
    creator: Creators,
    ku_data: z
      .record(
        z.string().min(1).describe("A translation of the word into English proposed in ku"),
        Score.describe(
          "The percentage of ku survey respondents who report this translation as accurate to their usage.",
        ),
      )
      .optional()
      .describe(
        "The usage data of the word as described in ku (the official Toki Pona dictionary)",
      ),
    parent_id: Ref.optional().describe(
      "The most widely used word which is considered to be an exact synonym for this word.",
    ),
    see_also: SeeAlso.describe("A list of related words by ID"),
    resources: z
      .object({
        sona_pona: Resource.optional().describe(
          "A link to the word's page on sona.pona.la, a Toki Pona wiki. May redirect for words with references but no dedicated page.",
        ),
        lipamanka_semantic: Resource.optional().describe(
          "A link to lipamanka's description of the word's semantic space.",
        ),
      })
      .describe("Non-Linku resources related to the specific word, such as wiki links."),
    representations: z
      .object({
        sitelen_emosi: z
          .emoji()
          .min(1)
          .optional()
          .describe(
            "The sitelen emosi representation of this word, a script for writing Toki Pona using emoji",
          ),
        sitelen_jelo: z
          .array(z.emoji().min(1))
          .min(1)
          .optional()
          .describe("One or more example emojis for how the word can be written in sitelen jelo"),
        ligatures: Ligatures.describe(
          "A list of sitelen Lasina representations of the word, used by ligature fonts to visually convert latin characters into sitelen pona",
        ),
        sitelen_sitelen: Resource.optional().describe(
          "A URL pointing to an image of this word's sitelen sitelen hieroglyphic block",
        ),
        ucsur: UcsurCodepoint.describe("The UCSUR codepoint for this word."),
        // unicode: UnicodeCodepoint,
      })
      .describe("Ways of representing this word via text/computers"),
    source_language: z.string().min(1).describe("The language this word originated from"),
    usage_category: UsageCategory.describe(
      "The word's usage category, according to a survey performed by Linku",
    ),
    teachability: Teachability,
    deprecated: Deprecated,
    audio: z.array(Audio),
    pu_verbatim: z
      .object({
        en: Definition.describe("The word's original definition in the English edition of pu"),
        fr: Definition.describe("The word's original definition in the French edition of pu"),
        de: Definition.describe("The word's original definition in the German edition of pu"),
        eo: Definition.describe("The word's original definition in the Esperanto edition of pu"),
      })
      .optional()
      .describe("The original definition of the word in pu, the first official Toki Pona book"),
    usage: Usage.describe(
      "The percentage of respondents to the annual Linku word survey who report to use this word",
    ),
    glyph_ids: Refs.describe(
      "The IDs of all sitelen pona glyphs which represent the word. The usage category of each fetched glyph may be used to show or hide glyphs.",
    ),
    // TODO: should be ref but some words have no glyphs in Linku or are not
    // considered to have a primary glyph
    primary_glyph_id: z
      .string()
      .describe("The id of the glyph most used for this word in sitelen pona."),
    synonym_glyph_ids: Refs.describe(
      "A list of ids for sitelen pona glyphs which primarily represent another word, but may be used to represent this word.",
    ),
    translations: z.object({
      commentary: Commentary,
      etymology: Etymology,
      definition: Definition,
    }),
  })
  .describe("General info on a Toki Pona word")
  .refine(({ primary_glyph_id, glyph_ids, usage_category }) =>
    usage_category !== "sandbox" ? primary_glyph_id.length >= 3 && glyph_ids.length >= 1 : true,
  )
  .refine(({ book, pu_verbatim }) => (book === "pu" ? pu_verbatim !== undefined : true))
  .refine(({ book, ku_data }) =>
    ["pu", "ku suli", "ku lili"].includes(book) ? ku_data !== undefined : true,
  );

export const Glyph = z
  .object({
    id: Id.describe(
      "A unique identifier for the glyph, generally formed as its corresponding word with a dash and a number in the order the glyphs were coined.",
    ), // word + dash + number
    word: z.string().min(1).describe("The toki pona word which is written with this glyph."),
    word_id: Id.describe("The Linku id of the toki pona word this glyph writes."),
    usage_category: UsageCategory,
    teachability: Teachability,
    creator: Creators,
    creator_source: Source.optional(),
    creation_date: OptionalDate.describe("When this glyph was created, to precision known"),
    see_also: SeeAlso.describe("A list of related glyphs by ID"),
    primary: z
      .boolean()
      .describe("Whether this glyph is the main glyph used to write the toki pona word in `word`"),
    parent_id: Ref.optional().describe(
      "The primary glyph which this glyph is considered to share its form with.",
    ),
    deprecated: Deprecated,
    image: Resource.describe("A URL to an image of the sitelen pona glyph."),
    // TODO: should be Resource, but this is empty for some glyphs.
    svg: z.string().describe("A URL to an SVG of the sitelen pona glyph."),
    ligature: Ligature.optional().describe(
      "The single numerical ligature used to access this specific sitelen pona glyph.",
    ),
    alias_ligatures: Ligatures.describe(
      "All non-numerical ligature used to access this specific sitelen pona glyph.",
    ),
    ucsur: UcsurCodepoint.describe(
      "The UCSUR codepoint used to access this specific sitelen pona glyph.",
    ),
    // unicode: UnicodeCodepoint,
    usage: Usage.describe(
      "The percentage of respondents to the annual Linku word survey who report to use this glyph.",
    ),
    translations: z.object({
      commentary: Commentary,
      etymology: Etymology,
      names: Names,
    }),
  })
  .refine(({ image, svg, usage_category }) =>
    usage_category !== "sandbox" ? image.length > 0 && svg.length > 0 : true,
  );

export const Fingerspelling = z
  .object({
    id: Id.describe("A unique name for the fingerspelling which is also a gloss."),
    is_two_handed: z.boolean().describe("Whether the sign is two-handed or not."),
    etymology: z
      .array(
        z.object({
          language: z.string().describe("The language of the sign."),
          sign: z
            .string()
            .optional() // if lang is a priori
            .describe(
              "The name of the sign such that it could be found in a sign language dictionary.",
            ),
        }),
      )
      .describe("Unlocalized etymological values regarding this sign's origin"),
    signwriting: SignWriting,
    video: Video.optional(),
    translations: z.object({ parameters: Parameters }),
  })
  .describe("Info on a fingerspelling sign.");

export const Sign = Fingerspelling.extend({
  definition: z.string().describe("The definition of the sign as a single toki pona word."),
  new_gloss: z.string().describe("The more recent, preferred gloss for this sign."),
  old_gloss: z.string().describe("The older gloss for this sign, similar to `id`."),
  old_id: z.string().describe("Previous, malformed id for the sign."),
  translations: z.object({
    icons: Icons,
    parameters: Parameters,
  }),
}).describe("Info on a Luka Pona sign");

export const Font = z
  .object({
    id: Id.describe("The font's unique ID, identifying it among other fonts"),
    creator: Creators.describe("a list of this font's creators"),
    features: z.array(z.string().min(1)).describe("a list of features this font supports"),
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
      fontfile: Resource.optional().describe(
        "a link to the font file published by the original author (not the mirror on the Linku Project's GitHub)",
      ),
      repo: Resource.optional().describe(
        "a link to a web hosted repository of this font's source files (usually hosted on GitHub or GitLab)",
      ),
      webpage: Resource.optional().describe(
        "a link to this font's home page, usually showcasing its features and usage/installation",
      ),
    }),
  })
  .describe("Info on a font for Toki Pona");

export const Language = z.object({
  id: Id.min(2).describe("The language's code in Crowdin. Usually its 2 or 3 letter code."),
  locale: Id.min(2).describe("The locale code corresponding to the language."),
  direction: z
    .union([z.literal("ltr"), z.literal("rtl")])
    .describe("The direction of the language's script."),
  name: z.object({
    // Downstream projects should prefer endonym over name_en
    en: z.string().describe("The name of the language in English."),
    endonym: z.string().describe("The name of the language in that language. Prefer if available."),
    // must be added post-hoc
    tok: z.string().optional().describe("The name of the language in Toki Pona."),
  }),
  // TODO: completion percentage on a per-file basis?
  // we also care about completion within usage categories, since the most important words are core+widespread+common
});

export const Languages = z.record(Id, Language).describe("The languages offered by sona Linku.");
export const Fonts = z
  .record(Id, Font)
  .describe("A raw data object containing all fonts data in Linku");
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

export type Word = z.infer<typeof Word>;
export type Words = z.infer<typeof Words>;
export type Glyph = z.infer<typeof Glyph>;
export type Glyphs = z.infer<typeof Glyphs>;
export type Sign = z.infer<typeof Sign>;
export type Signs = z.infer<typeof Signs>;
export type Fingerspelling = z.infer<typeof Fingerspelling>;
export type Fingerspellings = z.infer<typeof Fingerspellings>;
export type Font = z.infer<typeof Font>;
export type Fonts = z.infer<typeof Fonts>;
export type Language = z.infer<typeof Language>;
export type Languages = z.infer<typeof Languages>;
