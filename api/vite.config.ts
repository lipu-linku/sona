import pages from "@hono/vite-build/cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    pages({
      entry: "src/server/index.ts",
    }),
    devServer({
      entry: "src/server/index.ts",
    }),
  ],
  experimental: {
    enableNativePlugin: true,
  },
});
