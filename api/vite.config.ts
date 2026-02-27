import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";
import { defineConfig, type UserConfigExport } from "vite";

export default defineConfig((async ({ mode }) => ({
  build: {
    lib: mode === "lib" && {
      entry: {
        index: "src/lib/v1/index.ts",
        utils: "src/lib/v1/utils.ts",
        client: "src/lib/v1/client.ts",

        "v1/index": "src/lib/v1/index.ts",
        "v1/utils": "src/lib/v1/utils.ts",
        "v1/client": "src/lib/v1/client.ts",

        "v2/index": "src/lib/v2/index.ts",
        "v2/utils": "src/lib/v2/utils.ts",
        "v2/client": "src/lib/v2/client.ts",
      },
      formats: ["es"],
    },
    sourcemap: "inline",
    minify: true,
    outDir: "dist",
  },
  resolve: {
    alias: {
      "@raw": path.resolve(__dirname, "src/raw"),
    },
  },
  plugins: [cloudflare()],
})) as UserConfigExport);
