import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [cloudflare()],
  resolve: {
    alias: {
      "@raw": path.resolve(import.meta.dirname, "src/raw"),
    },
  },
});
