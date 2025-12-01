import type { Font, Word, SignData } from "./index";

export type WordRepresentations = Word["representations"];
export type WordAudio = Word["audio"];
export type WordUsage = Word["usage"];
export type WordPuVerbatim = Word["pu_verbatim"];
export type WordKuData = Word["ku_data"];
export type WordTranslations = Word["translations"];
export type LocalizedWordDefinition = WordTranslations["definition"];
export type LocalizedWordEtymology = WordTranslations["etymology"];
export type LocalizedWordCommentary = WordTranslations["commentary"];
// export type LocalizedWordSitelenEtymology = WordTranslations["sp_etymology"];

export type SignEtymology = SignData["etymology"];
export type SignWriting = SignData["signwriting"];
export type SignVideo = SignData["video"];
// export type LocalizedSignParameters = ParametersTranslation[string];

export type FontLinks = Font["links"];
