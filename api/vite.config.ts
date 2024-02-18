import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		minify: true,
	},
	plugins: [
		pages({ entry: ["./src/index.ts"] }),
		devServer({
			entry: "src/index.ts",
		}),
	],
});
