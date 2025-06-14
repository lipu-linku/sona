import { z } from "zod/v4";
import * as schemas from "./src/lib/v2/index";
import fs from "node:fs";

// TODO: dynamic import from current api version?
export const CURRENT_API_VERSION = "v2";

if (!fs.existsSync(`generated/${CURRENT_API_VERSION}`)) {
  fs.mkdirSync(`generated/{${CURRENT_API_VERSION}`, { recursive: true });
}

for (const [name, schema] of Object.entries(schemas)) {
  const filename = name
    .replace(/\.?([A-Z]+)/g, (_, val) => "_" + val.toLowerCase())
    .replace(/^_/, "");

  fs.writeFile(
    // NOTE: we only support updating schemas for the latest api version
    new URL(`./generated/${CURRENT_API_VERSION}/${filename}.json`, import.meta.url),
    JSON.stringify(
      z.toJSONSchema(schema, {
        reused: "ref",
        cycles: "ref",
        unrepresentable: "throw",
      }),
      null,
      2,
    ),
    (e: NodeJS.ErrnoException | null) => {
      if (e) throw e;
    },
  );
}
