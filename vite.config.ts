import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as remix } from "@remix-run/dev";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "~",
        replacement: "./app",
      },
    ],
  },
  plugins: [
    nodePolyfills({
      include: ["process", "buffer"],
      globals: { process: true, Buffer: true },
    }),
    remix({
      ssr: false,
      future: {
        v3_singleFetch: true,
        v3_fetcherPersist: true,
        v3_throwAbortReason: true,
        v3_relativeSplatPath: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
