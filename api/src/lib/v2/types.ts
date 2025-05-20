import type { Font, Word, Parameters, SignData } from "./index";

export type WordRepresentations = Word["representations"];
export type WordAudio = Word["audio"];
export type WordUsage = Word["usage"];
export type WordPuVerbatim = Word["pu_verbatim"];
export type WordKuData = Word["ku_data"];
export type WordTranslations = Word["translations"];
export type WordTranslation = Word["translations"][string];
export type LocalizedWordDefinition = WordTranslation["definition"];
export type LocalizedWordEtymology = WordTranslation["etymology"];
export type LocalizedWordCommentary = WordTranslation["commentary"];
// export type LocalizedWordSitelenEtymology = WordTranslation["sp_etymology"];

export type SignEtymology = SignData["etymology"];
export type SignWriting = SignData["signwriting"];
export type SignVideo = SignData["video"];
// export type LocalizedSignParameters = ParametersTranslation[string];

export type FontLinks = Font["links"];
