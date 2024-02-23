import type { Font, LocalizedWord, ParametersTranslation, Sign } from ".";

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
