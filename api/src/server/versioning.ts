import { Hono } from "hono";
import type { z } from "zod/v4";
import apiV1 from "./v1";
import apiV2 from "./v2";
import { config as v1config } from "./v1/index";
import { config as v2config } from "./v2/index";
import { mergeToKey, joinPath as join } from "./utils";

export type ApiVersion = "v1" | "v2";

const IMPORT_ROOT = "/src/raw/";
const DATA = import.meta.glob<object>("@raw/**/*.json", {
  import: "default",
  eager: true,
});

export type Versions<V extends Record<ApiVersion, Record<string, EndpointConfig>>> = {
  [version in ApiVersion]: ApiConfig<V[version]>;
};

export type ApiConfig<Endpoints extends Record<string, EndpointConfig>> = {
  [K in keyof Endpoints]: Endpoints[K];
};

export type EndpointConfig<Schema extends z.ZodType = z.ZodType> = {
  root?: string;
  filename: string;
  schema: Schema;
  translations?: boolean;
};

export const versions = {
  v1: v1config,
  v2: v2config,
} as const;

export type FilesToVariables<
  Version extends ApiVersion,
  Endpoints extends (typeof versions)[Version] = (typeof versions)[Version],
> = {
  // I cannot figure out how to make this type safe
  // @ts-expect-error
  [K in keyof Endpoints]: z.output<Endpoints[K]["schema"]>;
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

const assertImport = async (
  imports: Record<string, object>,
  file: any | undefined,
  path: string,
): Promise<void> => {
  if (!file) {
    throw new Error(`Missing file: ${path}. Available: [${Object.keys(imports).slice(0, 10)}]`);
  }
  if (typeof file !== "object") {
    console.error(`Unexpected file type for ${path}:`, typeof file, file);
  }
};

export const fetchFile = async <Endpoint extends EndpointConfig>(
  version: ApiVersion,
  config: Endpoint,
  langcode: string = "en",
): Promise<z.ZodSafeParseResult<z.output<Endpoint["schema"]>>> => {
  const { root = "/", filename, schema, translations = false } = config;

  let path = "/" + join(IMPORT_ROOT, version, root, filename);
  let file = DATA[path]!;
  await assertImport(DATA, file, path);

  // TODO: better way for caller to insert api specific behavior
  if (version === "v2" && translations === true) {
    let translationPath =
      "/" + join(IMPORT_ROOT, version, root, "translations", langcode, filename);
    let translationFile = DATA[translationPath]!;
    await assertImport(DATA, translationFile, translationPath);
    file = mergeToKey(file, "translations", translationFile);
  }

  const parsed = await schema.safeParseAsync(file);
  if (!parsed.success) {
    throw new Error(`Invalid input in ${filename}: ${parsed.error.message}`);
  }

  // TODO: I cannot figure out how to make this type safe
  // @ts-expect-error
  return parsed;
};
