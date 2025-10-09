import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
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
      ],
    },
  };
});
