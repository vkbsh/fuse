import { loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  return {
    test: {
      reporters: ["verbose"],
      projects: [
        {
          plugins: [tsconfigPaths()],
          test: {
            name: "program",
            environment: "node",
            include: ["**/tests/program/**/*.test.ts"],
          },
        },
        {
          plugins: [
            nodePolyfills({
              include: ["process", "buffer"],
              globals: { process: true, Buffer: true },
            }),
            tsconfigPaths(),
            tailwindcss(),
          ],
          test: {
            env: loadEnv(mode, process.cwd(), ""),
            name: "browser",
            include: ["**/tests/browser/**/*.test.tsx"],
            screenshots: {
              enabled: false,
            },
            browser: {
              provider: "playwright",
              enabled: true,
              // headless: true,
              instances: [
                {
                  browser: "chromium",
                },
              ],
            },
          },
        },
      ],
    },
  };
});
