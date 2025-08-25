import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    reporters: ["verbose"],
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "program",
          include: ["tests/program/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "browser",
          include: ["tests/browser/**/*.{test,spec}.tsx"],
          browser: {
            provider: "playwright",
            enabled: true,
            headless: true,
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
});
