# Refactor MCP Component Export Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deduplicate and clean up the component export filtering logic in the AST extractor and test runner by extracting `isComponentExport` helper function.

**Architecture:** Export `isComponentExport` from `extractor.ts` and use it in both `extractor.ts`'s `visitIndex` function and `run-test.ts`'s `visit` function. This ensures the filter rules are identical in testing and extraction.

**Tech Stack:** TypeScript, Node.js

---

### Task 1: Refactor `packages/mcp/src/extractor.ts`

**Files:**
- Modify: `packages/mcp/src/extractor.ts`

- [ ] **Step 1: Implement and export `isComponentExport` helper function**
Add the following helper function at the appropriate place in `extractor.ts`:
```typescript
export function isComponentExport(node: ts.ExportDeclaration, element: ts.ExportSpecifier): boolean {
  if (node.isTypeOnly || element.isTypeOnly) return false;
  const name = element.name.getText();
  return /^[A-Z]/.test(name) && !/(Props|Variants|Options|Tone|Option|Align|Size|Variant|Style)$/.test(name);
}
```

- [ ] **Step 2: Update `visitIndex` function to use `isComponentExport`**
Modify `visitIndex` in `parseComponents` to:
```typescript
  function visitIndex(node: ts.Node) {
    if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const relPath = node.moduleSpecifier.getText().replace(/['"]/g, "");
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const exportName = element.name.getText();
          if (isComponentExport(node, element)) {
            exports.push({
              name: exportName,
              fileRelativePath: relPath
            });
          }
        }
      }
    }
    ts.forEachChild(node, visitIndex);
  }
```

---

### Task 2: Refactor `packages/mcp/src/run-test.ts`

**Files:**
- Modify: `packages/mcp/src/run-test.ts`

- [ ] **Step 1: Import `isComponentExport` from `./extractor.js`**
Update the imports in `run-test.ts` to include `isComponentExport`.
```typescript
import { parseComponents, parseTokens, isComponentExport } from "./extractor.js";
```

- [ ] **Step 2: Update `visit` function in `runTest` to use `isComponentExport`**
Modify `visit` in `run-test.ts` to:
```typescript
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
```

---

### Task 3: Build & Verification

**Files:**
- None

- [ ] **Step 1: Build the packages**
Run build to regenerate compiled JavaScript files:
`npm run build`

- [ ] **Step 2: Run extractor tests to verify**
Run: `npm run test --workspace @kjaniec-dev/ui-mcp`
Expected: PASS with "✓ Extractor successfully parsed all expected component exports and props." and "ALL TESTS PASSED!"

- [ ] **Step 3: Commit changes**
Run:
`git add packages/mcp/src/extractor.ts packages/mcp/src/run-test.ts`
`git commit -m "refactor(mcp): share component export helper and add parent type-only checks"`
