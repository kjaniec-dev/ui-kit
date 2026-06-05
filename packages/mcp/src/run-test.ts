import { parseComponents, parseTokens } from "./extractor";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../..");
const uiSrcDir = path.join(projectRoot, "packages/ui/src");

function runTest() {
  console.error("Running extractor verification tests...");

  // 1. Verify parseTokens runs without throwing
  let tokens: any[] = [];
  try {
    tokens = parseTokens();
    if (tokens.length === 0) {
      throw new Error("Tokens parsing returned 0 tokens.");
    }
    console.error(`✓ parseTokens succeeded, found ${tokens.length} tokens.`);
  } catch (e: any) {
    console.error("✗ parseTokens failed!");
    console.error(e);
    process.exit(1);
  }

  // 2. Verify parseComponents runs without throwing
  let components: any[] = [];
  try {
    components = parseComponents();
    if (components.length === 0) {
      throw new Error("Components parsing returned 0 components.");
    }
    console.error(`✓ parseComponents succeeded, found ${components.length} components.`);
  } catch (e: any) {
    console.error("✗ parseComponents failed!");
    console.error(e);
    process.exit(1);
  }

  // 3. Resolve all exports in index.ts to verify extractor coverage
  const indexFile = path.join(uiSrcDir, "index.ts");
  const indexCode = fs.readFileSync(indexFile, "utf8");
  const indexSource = ts.createSourceFile("index.ts", indexCode, ts.ScriptTarget.Latest, true);

  const expectedExports: string[] = [];

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const exportName = element.name.getText();
          // Filter only capitalized exports (React components)
          if (/^[A-Z]/.test(exportName)) {
            expectedExports.push(exportName);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(indexSource);

  // 4. Assert that every expected exported component exists in the parsed component output
  const parsedNames = new Set(components.map(c => c.name));
  const missing: string[] = [];

  for (const exp of expectedExports) {
    if (!parsedNames.has(exp)) {
      missing.push(exp);
    }
  }

  if (missing.length > 0) {
    console.error(`✗ Test failed! The following exported components were not parsed by the extractor: ${missing.join(", ")}`);
    process.exit(1);
  }

  // 5. Check if some props are extracted correctly
  const button = components.find(c => c.name === "Button");
  if (!button) {
    console.error("✗ Test failed! Button component not found in parsed output.");
    process.exit(1);
  }

  if (!button.props || button.props.length === 0) {
    console.error("✗ Test failed! No props extracted for Button component.");
    process.exit(1);
  }

  const hasLoading = button.props.some((p: any) => p.name === "loading");
  if (!hasLoading) {
    console.error("✗ Test failed! Button component is missing the 'loading' prop in parsed props list.");
    process.exit(1);
  }

  console.error("✓ Extractor successfully parsed all expected component exports and props.");
  console.error("ALL TESTS PASSED!");
  process.exit(0);
}

runTest();
