import { Languages } from "@kulupu-linku/sona";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

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
	return Object.fromEntries(entries(o).filter(([key, value]) => predicate([key, value])));
};

export const langIdCoalesce = (lang: string, langs: Languages) => {
	if (lang in langs) {
		return lang; // most common case
	}
	for (const [id, metadata] of Object.entries(langs)) {
		if (lang === metadata.locale) {
			return id;
		}

		for (const [key, name] of Object.entries(metadata.name)) {
			if (lang.toLowerCase() === name.toLowerCase()) {
				return id;
			}
		}
	}
	return null;
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
