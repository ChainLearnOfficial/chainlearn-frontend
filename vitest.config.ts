import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/tests/setup.tsx"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    coverage: {
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/**",
        "src/tests/**",
        "**/*.d.ts",
        "src/app/**", // pages are integration territory; unit-test components
        "src/types/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
