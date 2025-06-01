import type { Languages } from "../lib/v2";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const entries = <const T extends object>(
  o: T,
): {
  [K in keyof T]: [K, T[K]];
}[keyof T][] => {
  return Object.entries(o) as [keyof T, T[keyof T]][];
};

export const keys = <const K extends PropertyKey>(o: Record<K, any>): K[] => {
  return Object.keys(o) as K[];
};

export const filterObject = <const T extends object>(
  o: T,
  predicate: (o: [keyof T, T[keyof T]]) => boolean,
) => {
  return Object.fromEntries(
    entries(o).filter(([key, value]) => predicate([key, value])),
  );
};

export const langIdCoalesce = (lang: string, langs: Languages): string | undefined => {
  //  lang is the langcode
  if (lang in langs) {
    return lang;
  }

  for (const [id, metadata] of Object.entries(langs)) {
    // lang is the locale e.g. ca-ES, fr-FR, zh-CN
    if (lang === metadata.locale) {
      return id;
    }

    for (const [key, name] of Object.entries(metadata.name)) {
      if (lang.toLowerCase() === name.toLowerCase()) {
        return id;
      }
    }
  }

  return undefined;
};

export const langValidator = zValidator(
  "query",
  z.object({
    lang: z
      .string()
      .regex(/^([^,]+,)*[^,]+/)
      .optional(),
  }),
);

export function mergeToKey(target, tkey: string, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  for (const key in source) {
    // no safety check for whether the key is on the target
    // zod will catch
    target[key][tkey] = source[key];
  }
  return target;
}
