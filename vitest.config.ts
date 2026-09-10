import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./setup-tests.ts"],
    globals: true,
    exclude: [
      "e2e/**",
      "**/node_modules/**",
      ".opencode/**",
      ".specify/**",
      ".next/**",
      "out/**",
      "build/**",
    ],
  },
  resolve: {
    alias: {
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
