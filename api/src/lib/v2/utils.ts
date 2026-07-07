import { z } from "zod/v4";

export const Date = z
  .string()
  .regex(/^(?<year>20\d{2})(?:-(?<month>0[1-9]|1[0-2])(?:-(?<day>0[1-9]|[12]\d|3[01]))?)?$/);
// YYYY or YYYY-MM or YYYY-MM-DD

export const OptionalDate = z
  .string()
  .regex(
    /^(?:|(?<year>20\d{2})(?:-(?<month>0[1-9]|1[0-2])(?:-(?<day>0[1-9]|[12]\d|3[01]))?)?|(?<startYear>20\d{2})-(?<endYear>20\d{2}))$/,
  );
// (empty string) or YYYY-YYYY or YYYY or YYYY-MM or YYYY-MM-DD

export const Score = z.number().min(0).max(100);

export const Book = z.enum([
  "pu",
  "ku suli",
  "ku lili",
  "none", // mu
]);
export type Book = z.infer<typeof Book>;

export const Era = z.enum([
  "pre-pu",
  "post-pu",
  "post-ku", // mu
]);
export type Era = z.infer<typeof Era>;

export const UsageCategory = z.enum([
  "core",
  "common",
  "uncommon",
  "obscure",
  "sandbox", // mu
]);
export type UsageCategory = z.infer<typeof UsageCategory>;

export const WritingSystem = z.enum([
  "sitelen pona",
  "sitelen sitelen",
  "alphabet",
  "syllabary",
  "logography",
  "tokiponido alphabet",
  "tokiponido syllabary",
  "tokiponido logography",
]);
export type WritingSystem = z.infer<typeof WritingSystem>;

export type * from "./types";

export function getTranslatedData<
  Obj extends { translations: Record<string, object> },
  Key extends keyof Obj["translations"][string],
>(data: Obj, key: Key, language: string): Obj["translations"][string][Key] {
  return ((data.translations[language] ?? data.translations["en"]!) as Obj["translations"][string])[
    key
  ];
}
