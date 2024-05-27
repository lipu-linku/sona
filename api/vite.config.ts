import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { getEnv } from "@hono/vite-dev-server/cloudflare-pages";
import { exec } from "node:child_process";
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
	define: {
		__BRANCH__: await new Promise<string>((resolve, reject) =>
			exec("git branch --show-current", (e, stdout, stderr) => {
				if (e) reject(`Could not get current branch: ${stderr}`);
				else resolve(`"${stdout.trim()}"`);
			}),
		),
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
						env: getEnv({
							assets: true,
						}),
					}),
				],
})) as UserConfigExport);
