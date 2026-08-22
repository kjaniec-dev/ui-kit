import { defineConfig } from "tsup";
import { generate } from "./src/extractor";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  outExtension: () => ({ js: ".js" }),
  dts: true,
  sourcemap: true,
  clean: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  onSuccess: async () => {
    // Generate the metadata JSON files during build
    try {
      generate();
      console.log("TSX extraction and data generation completed successfully.");
    } catch (e: any) {
      console.error("Data generation failed during build:", e);
      process.exit(1);
    }
  },
});
