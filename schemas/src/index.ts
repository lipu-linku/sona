export * from "./utils";

import { YearMonth, integer } from "./internal";
import type { Book, CoinedEra, UsageCategory } from "./utils";

/**
 * General info on a Toki Pona word
 *
 * @$id #word
 * @title sona word file
 */
export type Word = {
	/**
	 * The author's original definition, taken verbatim in their words
	 */
	author_verbatim?: string;
	/**
	 * Where the author's original definition is located (usually Discord)
	 */
	author_verbatim_source?: string;
	/**
	 * Which official Toki Pona book was this word featured in, if any.
	 */
	book: Book;
	/**
	 * When this word was coined (relative to the publication dates of the official Toki Pona books)
	 */
	coined_era: CoinedEra;
	/**
	 * The year when this word was coined (if known)
	 */
	coined_year?: string;
	/**
	 * The person who created this word (if known)
	 */
	creator?: string;
	/**
	 * The usage data of the word as described in ku (the official Toki Pona dictionary)
	 */
	ku_data?: {
		/**
		 * @minimum 0
		 * @maximum 100
		 */
		[meaning: string]: integer;
	};
	/**
	 * A list of related words
	 */
	see_also: string[];
	/**
	 * The sitelen emosi representation of this word, a script for writing Toki Pona using emoji
	 */
	sitelen_emosi?: string;
	/**
	 * A list of sitelen Lasina representations of this word, to be converted into sitelen pona glyphs
	 */
	sitelen_pona: string[];
	/**
	 * A URL pointing to an image of this word's sitelen sitelen hieroglyphic block
	 *
	 * @format uri
	 */
	sitelen_sitelen?: string;
	/**
	 * The language this word originated from
	 */
	source_language?: string;
	/**
	 * The word's UCSUR codepoint
	 *
	 * @pattern ^U\+[\da-fA-F]{4,6}$
	 */
	ucsur?: string;
	/**
	 * The word's usage category, according to a survey performed by the Linku Project
	 */
	usage_category: UsageCategory;
	/**
	 * The word's actual text, in case of a word with multiple definitions (like "we")
	 */
	word: string;
	/**
	 * Audio files of the words pronounced out loud
	 */
	audio?: {
		/**
		 * jan Lakuse's pronounciation of the word, made for jan Sonja's Memrise course: https://archive.org/details/toki-pona-audio-by-jan-lakuse
		 *
		 * @format uri
		 */
		jan_lakuse?: string;
		/**
		 * kala Asi's pronounciation of the word, made for the Linku Project
		 *
		 * @format uri
		 */
		kala_asi?: string;
	};
	/**
	 * Video clips of the word being signed in Luka Pona, a Toki Pona sign language
	 */
	luka_pona?: {
		/**
		 * The video clip in MP4 format
		 *
		 * @format uri
		 */
		mp4: string;
		/**
		 * The video clip as a GIF
		 *
		 * @format uri
		 */
		gif: string;
	};
	pu_verbatim?: {
		/**
		 * The original definition in the English version of pu
		 */
		en: string;
		/**
		 * The original definition in the French version of pu
		 */
		fr: string;
		/**
		 * The original definition in the German version of pu
		 */
		de: string;
		/**
		 * The original definition in the Esperanto version of pu
		 */
		eo: string;
	};
	/**
	 * The percentage of people in the Toki Pona community who recognize this word, according to surveys performed by the Linku Project
	 */
	recognition: Record<YearMonth, integer>;
};

/**
 * Localized metadata for a Toki Pona word
 *
 * @$id #translation
 * @title sona Translation file
 */
export type Translation = {
	[word: string]: {
		/**
		 * Extra information regarding the word
		 */
		commentary: string;
		/**
		 * The definition of the word
		 */
		def: string;
		/**
		 * The etymology of the word's sitelen pona glyph
		 */
		sitelen_pona_etymology: string;
		/**
		 * Information about the word's origin through other languages
		 */
		etymology: Array<{
			/**
			 * The "word" field transliterated in Latin characters
			 */
			word?: string;
			/**
			 * The definition of the word in its origin language
			 */
			language: string;
			/**
			 * The word's origin language
			 */
			definition?: string;
			/**
			 * The word written out in its original script
			 */
			alt?: string;
		}>;
	};
};
