import { createGenerator } from "ts-json-schema-generator";
import fs from "node:fs/promises";

const schema = createGenerator({
	path: "./src/types/index.ts",
	tsconfig: "./tsconfig.json",
	type: "*",
}).createSchema("*");

fs.writeFile("./schema.json", JSON.stringify(schema, null, 2));
