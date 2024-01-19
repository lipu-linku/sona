import {
	CommentaryTranslation,
	Words,
	DefinitionTranslation,
	EtymologyTranslation,
	SitelenPonaTranslation,
	Word,
} from "@linku/sona";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import type { z } from "zod";
import apiV1 from "./v1";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";

export type ApiVersion = "v1";

export type Versions = {
	[version in ApiVersion]: {
		branch: string;
		schemas: {
			words: z.ZodType;
			word: z.ZodType;
			definition: z.ZodType;
			commentary: z.ZodType;
			etymology: z.ZodType;
			sitelen_pona: z.ZodType;
		};
	};
};

export const versions = {
	v1: {
		branch: "api",
		schemas: {
			words: Words,
			word: Word,
			definition: DefinitionTranslation,
			commentary: CommentaryTranslation,
			etymology: EtymologyTranslation,
			sitelen_pona: SitelenPonaTranslation,
		},
	},
} as const satisfies Versions;

type Apps = {
	[version in keyof typeof versions]: Hono<
		{ Variables: (typeof versions)[version] },
		any,
		`/${version}`
	>;
};

export const apps = {
	v1: apiV1,
} as const satisfies Apps;

export const schemaMiddleware = <V extends ApiVersion>(version: V) =>
	createMiddleware<{ Variables: (typeof versions)[V] }>(async (c, next) => {
		c.set("branch", versions[version].branch);
		c.set("schemas", versions[version].schemas);
		await next();
	});

export const rawFile = (version: ApiVersion, filename: string) =>
	`${BASE_URL}/${versions[version].branch}/raw/${filename}`;
