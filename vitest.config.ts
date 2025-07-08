import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      reporters: ["verbose"],
      includeSource: ["app/**/*.{ts,tsx}"],
      browser: {
        name: "chrome",
      },
    },
  }),
);
