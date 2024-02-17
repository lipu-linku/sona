import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { exec } from "node:child_process";

export default defineConfig({
	build: {
		lib: {
			formats: ["es"],
			entry: {
				index: resolve(__dirname, "src/lib/index.ts"),
				utils: resolve(__dirname, "src/lib/utils.ts"),
				client: resolve(__dirname, "src/lib/client.ts"),
			},
			fileName: "index",
		},
		sourcemap: true,
		minify: true,
	},
	resolve: {
		alias: {
			$lib: resolve(__dirname, "src/lib"),
			$server: resolve(__dirname, "src/server"),
		},
	},
	define: {
		__BRANCH__: await new Promise<string>((resolve, reject) =>
			exec("git branch --show-current", (e, stdout, stderr) => {
				if (e) reject(`Could not get current branch: ${stderr}`);
				else resolve(`"${stdout.trim()}"`);
			}),
		),
	},
	plugins: [
		pages({
			entry: "src/server/index.ts",
		}),
		devServer({
			entry: "src/server/index.ts",
		}),
		dts({
			insertTypesEntry: true,
		}),
	],
});
