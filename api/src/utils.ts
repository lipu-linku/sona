import { Languages } from "@kulupu-linku/sona";
import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

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

export const languagesFilter =
	(nested: boolean): MiddlewareHandler =>
	async (c, next) => {
		const languages = c.req.query("lang")?.split(",") ?? ["en"];
		await next();

		if (languages.length === 1 && languages[0] === "*") return;

		const body = (await c.res.clone().json()) as any;
		if (nested) {
			c.res = new Response(
				JSON.stringify(
					Object.fromEntries(
						Object.entries(body)
							.filter(
								(e): e is [string, { translations: any }] =>
									typeof e[1] === "object" && !!e[1] && "translations" in e[1],
							)
							.map(([k, v]) => {
								const availableLangs = Object.keys(v.translations);
								if (languages.some((l) => !availableLangs.includes(l)))
									throw new HTTPException(400, {
										message: `Cannot find some of the requested languages: ${languages.join(", ")}`,
									});

								return [
									k,
									{
										...v,
										translations: filterObject(v["translations"], ([k]) =>
											languages.includes(k.toString()),
										),
									},
								];
							}),
					),
				),
				c.res,
			);
		} else {
			if ("translations" in body) {
				const availableLangs = Object.keys(body.translations);
				if (languages.some((l) => !availableLangs.includes(l)))
					throw new HTTPException(400, {
						message: `Cannot find some of the requested languages: ${languages.join(", ")}`,
					});

				c.res = new Response(
					JSON.stringify({
						...body,
						translations: filterObject(body["translations"], ([k]) =>
							languages.includes(k.toString()),
						),
					}),
					c.res,
				);
			}
		}
	};
