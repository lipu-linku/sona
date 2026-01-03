import { cloudflare } from "@cloudflare/vite-plugin";
import { exec } from "node:child_process";
import { defineConfig, type UserConfigExport } from "vite";

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
	plugins: [cloudflare()],
})) as UserConfigExport);
