import { Static, Type } from "@sinclair/typebox";
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
