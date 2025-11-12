import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "@orca-so/whirlpools-core",
      "vite-plugin-node-polyfills/shims/buffer",
      "vite-plugin-node-polyfills/shims/global",
      "vite-plugin-node-polyfills/shims/process",
    ],
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["process", "buffer"],
      globals: { process: true, Buffer: true },
    }),
    tsconfigPaths(),
    tailwindcss(),
    topLevelAwait(),
    wasm(),
  ],
});
