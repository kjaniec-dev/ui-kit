import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  // Barrel entry — emits one ESM + one CJS bundle plus a single .d.ts.
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // React (and the token package) are provided by the consuming app — never bundle them.
  external: ["react", "react-dom", "react/jsx-runtime", "@kjaniec-dev/design"],
  async onSuccess() {
    const files = ["dist/index.js", "dist/index.cjs"];
    for (const file of files) {
      const filePath = path.resolve(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (!content.startsWith('"use client";')) {
          fs.writeFileSync(filePath, `"use client";\n${content}`);
        }
      }
    }
  },
});
