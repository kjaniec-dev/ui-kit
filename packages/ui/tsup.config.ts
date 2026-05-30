import { defineConfig } from "tsup";

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
});
