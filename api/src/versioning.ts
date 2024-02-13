import {
	CommentaryTranslation,
	DefinitionTranslation,
	EtymologyTranslation,
	Fingerspelling,
	FingerspellingSign,
	Font,
	Fonts,
	Languages,
	IconTranslation,
	ParametersTranslation,
	Sandbox,
	Sign,
	Signs,
	SitelenPonaTranslation,
	Word,
	Words,
} from "@kulupu-linku/sona";
import { Hono } from "hono";
import type { z } from "zod";
import apiV1 from "./v1";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";

export type ApiVersion = "v1";

export type Versions = {
	[version in ApiVersion]: {
		branch: string;
		schemas: {
			words: z.ZodType;
			sandbox: z.ZodType;
			word: z.ZodType;
			definition: z.ZodType;
			commentary: z.ZodType;
			etymology: z.ZodType;
			sitelen_pona: z.ZodType;
			signs: z.ZodType;
			sign: z.ZodType;
			fingerspelling: z.ZodType;
			fingerspelling_sign: z.ZodType;
			sign_parameters: z.ZodType;
			sign_icons: z.ZodType;
			fonts: z.ZodType;
			font: z.ZodType;
			languages: z.ZodType;
		};
	};
};

export const versions = {
	v1: {
		branch: "main",
		schemas: {
			words: Words,
			sandbox: Sandbox,
			word: Word,
			definition: DefinitionTranslation,
			commentary: CommentaryTranslation,
			etymology: EtymologyTranslation,
			sitelen_pona: SitelenPonaTranslation,
			signs: Signs,
			sign: Sign,
			fingerspelling: Fingerspelling,
			fingerspelling_sign: FingerspellingSign,
			sign_parameters: ParametersTranslation,
			sign_icons: IconTranslation,
			fonts: Fonts,
			font: Font,
			languages: Languages,
		},
	},
} as const satisfies Versions;

type Apps = {
	[version in keyof typeof versions]: Hono<any, any, `/${version}`>;
};

export const apps = {
	v1: apiV1,
} as const satisfies Apps;

export const rawFile = (version: ApiVersion, filename: string) =>
	`${BASE_URL}/${versions[version].branch}/raw/${filename}`;
