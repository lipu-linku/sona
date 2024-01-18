import { z } from "zod";

export const Book = z.union([
	z.literal("pu"),
	z.literal("ku suli"),
	z.literal("ku lili"),
	z.literal("none"),
]);
export type Book = z.infer<typeof Book>;

export const CoinedEra = z.union([z.literal("pre-pu"), z.literal("post-pu"), z.literal("post-ku")]);
export type CoinedEra = z.infer<typeof CoinedEra>;

export const UsageCategory = z.union([
	z.literal("core"),
	z.literal("widespread"),
	z.literal("common"),
	z.literal("uncommon"),
	z.literal("rare"),
	z.literal("obscure"),
]);
export type UsageCategory = z.infer<typeof UsageCategory>;

type Month = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";
export const YearMonth = z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/g) as z.ZodType<
	`20${number}-${Month}`,
	z.ZodTypeDef,
	`20${number}-${Month}`
>;

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
