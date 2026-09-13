import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@kjaniec-dev\/ui\/ui\.css$/,
        replacement: path.resolve(__dirname, "../packages/ui/src/ui.css"),
      },
      {
        find: /^@kjaniec-dev\/ui$/,
        replacement: path.resolve(__dirname, "../packages/ui/src/index.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
  },
});
