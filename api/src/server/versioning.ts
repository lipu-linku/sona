import { Hono } from "hono";
import type { z } from "zod/v4";
import apiV1 from "./v1";
import apiV2 from "./v2";
import { config as v1config } from "./v1/index";
import { config as v2config } from "./v2/index";
import { mergeToKey, joinPath as join } from "./utils";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";
export type ApiVersion = "v1" | "v2";

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

export const fetchFile = async <Endpoint extends EndpointConfig>(
  version: ApiVersion,
  config: Endpoint,
  langcode: string = "en",
): Promise<z.ZodSafeParseResult<z.output<Endpoint["schema"]>>> => {
  const imports = import.meta.glob<object>(`../../raw/**/*.json`, {
    import: "default",
    eager: false,
  });
  const { root = "/", filename, schema, translations = false } = config;

  let path = join("../../raw", version, root, filename);
  let file = (await imports[path]?.())!;

  // TODO: better way for caller to insert api specific behavior
  if (version === "v2" && translations === true) {
    let path = join("../../raw", version, root, "translations", langcode, filename);
    let translationData = (await imports[path]?.()) as object;
    file = mergeToKey(file, "translations", translationData);
  }

  console.log({ schema, file });

  // TODO: I cannot figure out how to make this type safe
  // @ts-expect-error
  return await schema.safeParseAsync(file); // TODO: type of file is unknown?
};
