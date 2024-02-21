import {
	CommentaryTranslation,
	DefinitionTranslation,
	EtymologyTranslation,
	Fingerspelling,
	FingerspellingSign,
	Font,
	Fonts,
	IconTranslation,
	Languages,
	ParametersTranslation,
	Sandbox,
	Sign,
	Signs,
	SitelenPonaTranslation,
	Word,
	Words,
} from "$lib";
import { Hono } from "hono";
import type { z } from "zod";
import apiV1 from "./v1";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";

export type ApiVersion = "v1";

export type Versions = {
	[version in ApiVersion]: {
		branch: string;
		schemas: Record<string, z.ZodType>;
		raw: Record<string, { filename: `${string}.${string}`; schema: z.ZodType }>;
	};
};

export const versions = {
	v1: {
		branch: __BRANCH__,
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
		raw: {
			words: {
				filename: "words.json",
				schema: Words,
			},
			fingerspelling: {
				filename: "fingerspelling.json",
				schema: Fingerspelling,
			},
			signs: {
				filename: "signs.json",
				schema: Signs,
			},
			fonts: {
				filename: "fonts.json",
				schema: Fonts,
			},
			sandbox: {
				filename: "sandbox.json",
				schema: Sandbox,
			},
			languages: {
				filename: "languages.json",
				schema: Languages,
			},
		},
	},
} as const satisfies Versions;

export type FilesToVariables<
	V extends ApiVersion,
	T extends Versions[ApiVersion]["raw"] = (typeof versions)[V]["raw"],
> = {
	[K in keyof T]: T[K]["schema"] extends z.ZodType ? T[K]["schema"]["_output"] : never;
};

type Apps = {
	[version in keyof typeof versions]: Hono<any, any, `/${version}`>;
};

export const apps = {
	v1: apiV1,
} as const satisfies Apps;

export const fetchFile = async <S extends z.ZodType>(
	version: ApiVersion,
	schema: S,
	filename: string,
): Promise<z.SafeParseReturnType<z.input<S>, z.output<S>>> =>
	schema.safeParse(
		__BRANCH__ === versions[version].branch
			? await import(/* @vite-ignore */ `../../raw/${filename}`, { with: { type: "json" } }).then(
					(r) => r.default,
				)
			: await fetch(`${BASE_URL}/${versions[version].branch}/api/raw/${filename}`).then((r) =>
					r.json(),
				),
	);
