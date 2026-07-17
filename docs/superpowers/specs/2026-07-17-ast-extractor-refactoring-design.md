# Design Spec: Refactor AST Extractor to Resolve Type-Only Exports and Truncated Snippets

**Date:** 2026-07-17  
**Status:** Draft  

## 1. Background & Goals

During the Code Quality Review, two findings were raised for the AST Extractor in `packages/mcp/src/extractor.ts`:

1. **Type-Only Exports registered as React Components**:
   Typescript types like `TimelineAlign`, `TimelineDotVariant`, and `TimelineDotSize` (which are exported as types) are extracted as React components because they do not match the current exclusion regex `(Props|Variants|Options|Tone|Option)`.
2. **Cut-off Snippet Extraction for Compound Components**:
   The `findUsageSnippet` function uses a single lazy regex `<${compName}\b[^]*?(?:/>|</${compName}>)` which stops at the first self-closing nested tag (like `<TimelineDot />` inside `<Timeline>`), cutting off the snippet and leaving it incomplete.

This design outlines the changes to resolve both issues and verify correctness.

---

## 2. Proposed Changes

### 2.1. Filter out Type-Only Exports in `visitIndex`

We will modify `visitIndex` in `packages/mcp/src/extractor.ts`:
- Check the `.isTypeOnly` property of the `ExportSpecifier` node `element`.
- Expand the exclusion regex to exclude export names ending with `Align`, `Size`, `Variant`, or `Style`.

**Refactored Condition:**
```typescript
// Filter only capitalized exports (React components), ignore type-only exports, and ignore Props/Variants/Options/etc.
if (!element.isTypeOnly && /^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option|Align|Size|Variant|Style)$/.test(exportName)) {
```

### 2.2. Robust Usage Snippet Extraction in `findUsageSnippet`

We will refactor `findUsageSnippet` in `packages/mcp/src/extractor.ts` to:
1. Search for double tags `<CompName>...</CompName>` first.
2. Fall back to single self-closing tags `<CompName />`.
3. Fall back to a default snippet if neither is found.

---

## 3. Alternative Approaches Considered

- **Approach 1 (Recommended):** Apply the precise pattern matching on the export node properties and the proposed fallback regex sequence in `findUsageSnippet`. This is lightweight, preserves the existing codebase's dependency structure, and addresses the root causes cleanly.
- **Approach 2:** Set up a full TS Program with TypeChecker to inspect whether each export resolves to a React component type. *Tradeoff:* Extremely heavy, slow, and requires full compilation configuration of the workspace in the MCP parser script which is run standalone.

---

## 4. Verification Plan

1. **Regenerate Metadata**: Run `npm run build`.
2. **Inspect Outputs**:
   - Check `packages/mcp/data/components.json` to ensure `TimelineAlign`, `TimelineDotVariant`, and `TimelineDotSize` do not exist.
   - Verify that the usage snippet for `Timeline` is complete and ends with `</Timeline>`.
3. **Run Code Verification**:
   - Run typecheck in all workspaces: `npm run typecheck`
   - Run tests: `npm run test`
