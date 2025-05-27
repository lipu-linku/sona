import { Hono } from "hono";
import type { z } from "zod";
import apiV1 from "./v1";
import apiV2 from "./v2";
import { config as v1config } from "./v1/index";
import { config as v2config } from "./v2/index";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";

export type ApiVersion = "v1" | "v2";

export type Versions = {
	[version in ApiVersion]: {
		branch: string;
		schemas: Record<string, z.ZodType>;
		raw: Record<
			string,
			{
				filename: `${string}.${string}`;
				schema: z.ZodType;
				file_schema: z.ZodType;
				api_schema: z.ZodType; // bc of v2
			}
		>;
	};
};

export const versions = {
	v1: v1config,
	v2: v2config,
} as const;

export type FilesToVariables<
	V extends ApiVersion,
	T extends Versions[ApiVersion]["raw"] = (typeof versions)[V]["raw"],
> = {
	[K in keyof T]: T[K]["schema"] extends z.ZodType ? T[K]["schema"]["_output"] : never;
};

type Apps = {
	[version in keyof typeof versions]: Hono<any, any, `/${version}`>;
};

// v1 just grabs the files and sends them, since the translations are packed in
// v2 has to traverse some dirs and grab the translations separately
export const apps = {
	v1: apiV1,
	v2: apiV2,
} as const satisfies Apps;

export const fetchFile = async <S extends z.ZodType>(
	version: ApiVersion,
	filename: string,
	schema: S,
	langcode: string = "en",
): Promise<z.SafeParseReturnType<z.input<S>, z.output<S>>> => {
	const imports = import.meta.glob(`../../raw/**/*.json`);
	let file = await imports[`../../raw/${version}/${filename}`]?.();
	file = file.default;

	// TODO: better way to determine path
	// this doesn't work for sandbox or lp
	let translations = await imports[`../../raw/${version}/translations/${langcode}/${filename}`]?.();

	if (version === "v2" && translations !== undefined) {
		translations = translations.default;
	}

	// TODO: safe-fetch from raw/version/translations/langcode/filename
	// merge into file if it exists

	const parsed = schema.safeParse(file); // TODO: type of file is unknown?
	return parsed;
};
