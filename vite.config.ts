import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";
import preload from "vite-plugin-preload";

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ["process", "buffer"],
      globals: { process: true, Buffer: true },
    }),
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
    preload(),
  ],
});
