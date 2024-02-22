import pages from "@hono/vite-cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { getEnv } from "@hono/vite-dev-server/cloudflare-pages";
import { type UserConfigExport, defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";
import { exec } from "node:child_process";

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
		sourcemap: true,
		minify: true,
		outDir: "dist",
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
	plugins:
		mode === "lib"
			? [
					dts({
						include: "./src/lib/*.ts",
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
							assets: true
						})
					}),
				],
})) as UserConfigExport);
