import cloudflare from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare()
  ],
  experimental: {
    enableNativePlugin: true,
  },
});
