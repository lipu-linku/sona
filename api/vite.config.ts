import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig, type UserConfigExport } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig((async ({ mode }) => ({
  build: {
    lib: mode === "lib" && {
      entry: {
        index: "src/lib/index.ts",
        utils: "src/lib/utils.ts",
        client: "src/lib/client.ts",
      },
      formats: ["es"],
    },
    sourcemap: "inline",
    minify: true,
    outDir: "dist",
  },
  plugins:
    mode === "lib"
      ? [
          dts({
            include: "./src/**/*.ts",
            insertTypesEntry: true,
          }),
        ]
      : [
          pages({
            entry: "src/server/index.ts",
          }),
          devServer({
            entry: "src/server/index.ts",
          }),
        ],
})) as UserConfigExport);
