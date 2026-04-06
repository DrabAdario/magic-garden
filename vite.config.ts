import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  /** Relative paths so the built app works on GitHub Pages (`/repo/`) and locally. */
  base: "./",
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
