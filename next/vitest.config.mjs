import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Vitest config - kept narrow on purpose. We only run pure-logic tests
// (no Mongo, no Next request context), so no JSDOM, no setup files.
// JSX shows up inside plain .js files in this repo (e.g. pricing.js's
// displayFeatures), so we tell esbuild to use the JSX loader for .js
// outside node_modules.
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub `server-only` so we can import server modules from tests.
      // Real Next builds guarantee server-only files don't reach the
      // browser bundle; in test we just no-op it.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.js"),
    },
  },
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
  },
});
