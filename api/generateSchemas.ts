import * as schemas from "./src/lib/index";
import { zodToJsonSchema } from "zod-to-json-schema";
import fs from "node:fs";

if (!fs.existsSync("generated")) fs.mkdirSync("generated");

for (const [name, schema] of Object.entries(schemas)) {
	const filename = name
		.replace(/\.?([A-Z]+)/g, (_, val) => "_" + val.toLowerCase())
		.replace(/^_/, "");

	fs.writeFile(
		new URL(`./generated/${filename}.json`, import.meta.url),
		JSON.stringify(
			zodToJsonSchema(schema, {
				name: filename,
			}),
			null,
			2,
		),
		(e: NodeJS.ErrnoException | null) => {
			if (e) throw e;
		},
	);
}
