import { z } from "zod/v4";
import { Book, Era, UsageCategory, WritingSystem, OptionalDate, Date, Score } from "./utils";

export type * from "./types";

// books which may have ku data
const CAN_HAVE_KU_DATA = ["pu", "ku suli", "ku lili"];
// words in pu but without dictionary entries
const NO_PU_VERBATIM = ["ali"];
// words in ku but without entries in https://tokipona.org/nimi_pi_pu_ala.txt
const NO_KU_DATA = ["wasoweli", "kulijo", "li", "e", "ku", "su"];

const Id = z
  .string()
  .min(1)
  .describe("A unique identifier for an object in Linku. Generally named after the object.");
const Ref = Id.describe("The ID of an object related to this one.");
const Refs = z.array(Id).describe("The IDs of one or more objects related to this one.");
const OptionalRef = Ref.optional();

const Author = z.string().min(1);
const Authors = z
  .array(Author)
  .describe("The name or names of those involved in authoring this object (if known)");

const Usage = z
  .record(Date, Score)
  .describe(
    "The percentage of respondents to an annual Linku survey who report to use this object.",
  );
// const Teachability = z
//   .number()
//   .min(1)
//   .max(4)
//   .describe(
//     "The tier of teachability for this object, as defined by the Sitelen Pona Publishers and Typographers Association.",
//   );

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
    author: Author.describe("The author of the audio file in `link`."),
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
      "A unique identifier for the word. May have an integer to distinguish words with the same spelling but distinct coinings.",
    ),
    word: z.string().min(1).describe(`The latin alphabet representation of the word.`),
    author_verbatim: z
      .string()
      .optional()
      .describe("The author's original definition, taken verbatim in their words"),
    author_source: Source.optional().describe("The source or origin of this glyph, often a URL."),
    book: Book.describe("Which official Toki Pona book was this word featured in, if any."),
    coined_era: Era.describe(
      "The period of time in which this word was coined, relative to the publication of the first two official Toki Pona books",
    ),
    creation_date: OptionalDate.describe("When this word was coined, to precision known."),
    author: Authors.describe("The name or names of those involved in creating this word."),
    ku_data: z
      .record(
        z
          .string()
          .min(1)
          .describe(
            "A possible translation of the word into English, as listed in the Toki Pona dictionary.",
          ),
        Score.describe(
          "The percentage of Toki Pona Dictionary survey respondents who report this translation as accurate to their usage.",
        ),
      )
      .optional()
      .describe("The usage data of this word, as described in the Toki Pona Dictionary."),
    parent_id: Ref.optional().describe(
      "The most widely used word which is considered to be an exact synonym for this word.",
    ),
    see_also: SeeAlso.describe("The IDs of words related to this one."),
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
      "The word's usage category, derived from the data of the annual Linku word survey.",
    ),
    // teachability: Teachability,
    deprecated: Deprecated.describe("Whether this word is considered deprecated by its author(s)."),
    audio: z.array(Audio),
    pu_verbatim: z
      .object({
        en: Definition.describe(
          "The word's definition in the English edition of Toki Pona: The Language of Good",
        ),
        fr: Definition.describe(
          "The word's definition in the French edition of Toki Pona: The Language of Good",
        ),
        de: Definition.describe(
          "The word's definition in the German edition of Toki Pona: The Language of Good",
        ),
        eo: Definition.describe(
          "The word's definition in the Esperanto edition of Toki Pona: The Language of Good",
        ),
      })
      .optional()
      .describe(
        "The definition of the word in specific language editions of Toki Pona: The Language of Good",
      ),
    usage: Usage.describe(
      "The percentage of respondents to the annual Linku word survey who report to use this word, by the date of the survey.",
    ),
    glyph_ids: Refs.describe(
      "The IDs of all sitelen pona glyphs which represent the word. The usage category of each fetched glyph may be used to show or hide glyphs.",
    ),
    // TODO: shouldn't be optional for most words, but some words have no glyphs
    // in linku, or have no "primary" glyph
    // see refinements later on
    primary_glyph_id: Ref.min(3)
      .optional()
      .describe("The ID of the glyph most commonly used to represent this word in sitelen pona."),
    translations: z.object({
      commentary: Commentary.describe(
        "Localized commentary on this word, such as history, clarifications, or trivia.",
      ),
      etymology: Etymology.describe("Localized etymology of this word."),
      definition: Definition.describe("Localized definition of this word."),
    }),
  })
  .describe("General info on a Toki Pona word")
  .refine(({ id, primary_glyph_id, glyph_ids, usage_category }) =>
    usage_category !== "sandbox"
      ? primary_glyph_id && primary_glyph_id.length >= 3 && glyph_ids.length >= 1
      : true,
  )
  .refine(({ id, book, pu_verbatim }) =>
    book === "pu" && !NO_PU_VERBATIM.includes(id) ? pu_verbatim !== undefined : true,
  )
  .refine(({ id, book, ku_data }) =>
    CAN_HAVE_KU_DATA.includes(book) && !NO_KU_DATA.includes(id) ? ku_data !== undefined : true,
  );

export const Glyph = z
  .object({
    id: Id.describe(
      "A unique identifier for the glyph. Named after its primary word and numbered in order of coining or attestation.",
    ), // word + dash + number
    word: z.string().min(1).describe("The toki pona word which is written with this glyph."),
    word_id: Id.describe("The Linku id of the toki pona word this glyph writes."),
    usage_category: UsageCategory.describe(
      "The glyph's usage category, derived from the data of the annual Linku glyph survey.",
    ),
    // teachability: Teachability,
    author: Authors.describe("The name or names of those involved in creating this glyph."),
    author_source: Source.optional().describe("The source or origin of this glyph, often a URL."),
    creation_date: OptionalDate.describe("When this glyph was created, to precision known"),
    see_also: SeeAlso.describe("A list of related glyphs by ID"),
    primary: z
      .boolean()
      .describe("Whether this glyph is the main glyph used to write the toki pona word in `word`"),
    parent_id: Ref.optional().describe(
      "The primary glyph which this glyph is considered to share its form with.",
    ),
    deprecated: Deprecated.describe(
      "Whether this glyph is considered deprecated by its author(s).",
    ),
    // NOTE: see refinements on image, svg
    image: Resource.optional().describe("A URL to an image of the sitelen pona glyph."),
    svg: Resource.optional().describe("A URL to an SVG of the sitelen pona glyph."),
    ligature: Ligature.optional().describe(
      "The specific numerical ligature used to render this sitelen pona glyph.",
    ),
    alias_ligatures: Ligatures.describe(
      "All non-numerical ligature used to render this sitelen pona glyph.",
    ),
    ucsur: UcsurCodepoint.describe(
      "The UCSUR codepoint used to render this specific sitelen pona glyph.",
    ),
    // unicode: UnicodeCodepoint,
    usage: Usage.describe(
      "The percentage of respondents to the annual Linku word survey who report to use this glyph, by the date of the survey.",
    ),
    translations: z.object({
      commentary: Commentary.describe(
        "Localized commentary on this glyph, such as history, clarifications, or trivia.",
      ),
      etymology: Etymology.describe("Localized etymology of this glyph."),
      names: Names,
    }),
  })
  .refine(({ image, svg, usage_category }) =>
    usage_category !== "sandbox" ? image && image.length > 0 && svg && svg.length > 0 : true,
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
    author: Authors.describe("a list of this font's authors"),
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
