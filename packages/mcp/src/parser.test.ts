import { describe, it, expect } from "vitest";
import { parseComponents, parseTokens, isComponentExport } from "./extractor.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../..");
const uiSrcDir = path.join(projectRoot, "packages/ui/src");

describe("extractor parser tests", () => {
  it("parseTokens returns tokens", () => {
    const tokens = parseTokens();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("parseComponents returns components", () => {
    const components = parseComponents();
    expect(components.length).toBeGreaterThan(0);
  });

  it("parses all expected component exports from UI index.ts", () => {
    const components = parseComponents();
    const indexFile = path.join(uiSrcDir, "index.ts");
    const indexCode = fs.readFileSync(indexFile, "utf8");
    const indexSource = ts.createSourceFile("index.ts", indexCode, ts.ScriptTarget.Latest, true);

    const expectedExports: string[] = [];

    function visit(node: ts.Node) {
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) {
            const exportName = element.name.getText();
            if (isComponentExport(node, element)) {
              expectedExports.push(exportName);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(indexSource);

    const parsedNames = new Set(components.map((c) => c.name));
    const missing = expectedExports.filter((exp) => !parsedNames.has(exp));

    expect(missing).toEqual([]);
  });

  it("extracts props correctly for Button component", () => {
    const components = parseComponents();
    const button = components.find((c) => c.name === "Button");
    expect(button).toBeDefined();
    expect(button?.props.length).toBeGreaterThan(0);

    const hasLoading = button?.props.some((p: any) => p.name === "loading");
    expect(hasLoading).toBe(true);
  });
});
