import {
	CommentaryTranslation,
	Data,
	DefinitionTranslation,
	EtymologyTranslation,
	SitelenPonaTranslation,
	Word,
} from "@linku/sona";
import { HTTPException } from "hono/http-exception";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";

export const BASE_URL = "https://raw.githubusercontent.com/lipu-linku/sona";

export const versions = {
	v1: {
		branch: "api",
		schemas: {
			data: Data,
			word: Word,
			definition: DefinitionTranslation,
			commentary: CommentaryTranslation,
			etymology: EtymologyTranslation,
			sitelen_pona: SitelenPonaTranslation,
		},
	},
} as const;

export const getData = async <V extends keyof typeof versions>(
	version: V,
): Promise<z.infer<(typeof versions)[V]["schemas"]["data"]>> => {
	const data = await fetch(`${BASE_URL}/${versions[version].branch}/raw/data.json`).then((r) =>
		r.json(),
	);
	const parseRes = await versions[version].schemas.data.safeParseAsync(data);

	if (parseRes.success) return parseRes.data;
	else
		throw new HTTPException(500, {
			message: `Internal server error: ${fromZodError(parseRes.error)}`,
		});
};
