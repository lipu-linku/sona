import { Hono } from "hono";
import type { z } from "zod/v4";
import apiV1 from "./v1";
import apiV2 from "./v2";
import { config as v1config } from "./v1/index";
import { config as v2config } from "./v2/index";
import { mergeToKey, joinPath as join } from "./utils";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";
export type ApiVersion = "v1" | "v2";
export type Versions = {
  [version in ApiVersion]: Record<
    string,
    {
      root: string | undefined;
      filename: string; // `${string}.${string}`;
      schema: z.ZodType;
      translations: boolean | undefined;
    }
  >;
};

export const versions = {
  v1: v1config,
  v2: v2config,
} as const;

export type FilesToVariables<
  V extends ApiVersion,
  T extends Versions[ApiVersion] = (typeof versions)[V],
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
  config: Versions[ApiVersion][string],
  langcode: string = "en",
): Promise<z.SafeParseReturnType<z.input<S>, z.output<S>>> => {
  const imports = import.meta.glob(`../../raw/**/*.json`);
  const { root = "/", filename, schema, translations = false } = config;

  let path = join("../../raw", version, root, filename);
  let file = await imports[path]?.();
  file = file.default;

  // TODO: better way for caller to insert api specific behavior
  if (version === "v2" && translations === true) {
    let path = join("../../raw", version, root, "translations", langcode, filename);
    let translationData = await imports[path]?.();
    translationData = translationData.default;
    file = mergeToKey(file, "translations", translationData);
  }

  const parsed = schema.safeParse(file); // TODO: type of file is unknown?
  return parsed;
};
