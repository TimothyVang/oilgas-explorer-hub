/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}", "src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".git", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "*.config.*",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
