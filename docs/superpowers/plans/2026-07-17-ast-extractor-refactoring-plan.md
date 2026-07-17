# AST Extractor Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the AST Extractor to filter out type-only exports from being parsed as React components, and correctly extract compound component usage snippets without premature truncation.

**Architecture:** Update AST traversal logic in `visitIndex` function and regex fallback sequences in `findUsageSnippet` function in `packages/mcp/src/extractor.ts`, and match these changes in test files.

**Tech Stack:** TypeScript, Node.js, npm, git

---

### Task 1: Refactor `visitIndex` in AST Extractor and Test Verification

**Files:**
- Modify: `packages/mcp/src/extractor.ts`
- Modify: `packages/mcp/src/run-test.ts`

- [ ] **Step 1: Apply type-only filtering and expanded exclusion regex to `visitIndex` in `packages/mcp/src/extractor.ts`**

Replace the current condition:
```typescript
          // Filter only capitalized exports (React components) and ignore Props/Variants/Options/Tone/Option
          if (/^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option)$/.test(exportName)) {
```
with:
```typescript
            // Filter only capitalized exports (React components), ignore type-only exports, and ignore Props/Variants/Options/etc.
            if (!element.isTypeOnly && /^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option|Align|Size|Variant|Style)$/.test(exportName)) {
```

- [ ] **Step 2: Update the export filter logic in `packages/mcp/src/run-test.ts` to match the extractor's updated logic**

Replace the condition in `packages/mcp/src/run-test.ts` around line 56:
```typescript
          // Filter only capitalized exports (React components) and ignore Props/Variants/Options/Tone/Option
          if (/^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option)$/.test(exportName)) {
```
with:
```typescript
          // Filter only capitalized exports (React components), ignore type-only exports, and ignore Props/Variants/Options/etc.
          if (!element.isTypeOnly && /^[A-Z]/.test(exportName) && !/(Props|Variants|Options|Tone|Option|Align|Size|Variant|Style)$/.test(exportName)) {
```

- [ ] **Step 3: Commit Task 1 changes**

```bash
git add packages/mcp/src/extractor.ts packages/mcp/src/run-test.ts
git commit -m "refactor(mcp): filter type-only exports and apply extended exclusions in AST extractor"
```

---

### Task 2: Refactor `findUsageSnippet` in AST Extractor

**Files:**
- Modify: `packages/mcp/src/extractor.ts`

- [ ] **Step 1: Replace `findUsageSnippet` function in `packages/mcp/src/extractor.ts`**

Refactor the `findUsageSnippet` function to first try double-tag matching before falling back to self-closing tags:
```typescript
  function findUsageSnippet(compName: string): string {
    // Try to find a double tag JSX usage <CompName>...</CompName> in all stories
    const doubleTagRegex = new RegExp(`<${compName}\\b[^]*?</${compName}>`, "g");
    // Fallback to self-closing JSX usage <CompName />
    const singleTagRegex = new RegExp(`<${compName}\\b[^]*?/>`, "g");

    for (const storyFile of Object.keys(storyContents)) {
      const content = storyContents[storyFile];
      
      // Try double tag first
      const doubleMatches = content.match(doubleTagRegex);
      if (doubleMatches && doubleMatches.length > 0) {
        for (const match of doubleMatches) {
          const trimmed = match.trim();
          if (trimmed.length < 500 && !trimmed.includes("PlusIcon")) {
            return dedentSnippet(trimmed);
          }
        }
        return dedentSnippet(doubleMatches[0].trim());
      }

      // Fallback to single tag
      const singleMatches = content.match(singleTagRegex);
      if (singleMatches && singleMatches.length > 0) {
        for (const match of singleMatches) {
          const trimmed = match.trim();
          if (trimmed.length < 250 && !trimmed.includes("PlusIcon")) {
            return dedentSnippet(trimmed);
          }
        }
        return dedentSnippet(singleMatches[0].trim());
      }
    }
    // Fallback default usage snippet
    return `<${compName}>\n  <!-- Content -->\n</${compName}>`;
  }
```

- [ ] **Step 2: Commit Task 2 changes**

```bash
git add packages/mcp/src/extractor.ts
git commit -m "refactor(mcp): prevent truncation of compound component usage snippets"
```

---

### Task 3: Build & Verification

**Files:**
- Verify: `packages/mcp/data/components.json`

- [ ] **Step 1: Run the build to compile code and regenerate metadata**

Run: `npm run build`
Expected output: Successful build of all packages, including components.json and tokens.json regeneration.

- [ ] **Step 2: Verify component.json contents**

Check `packages/mcp/data/components.json` to verify:
- There are no entries for `TimelineAlign`, `TimelineDotVariant`, or `TimelineDotSize`.
- The snippet for `Timeline` is complete (closing with `</Timeline>` and containing nested children).

- [ ] **Step 3: Run full tests and typechecks**

Run: `npm run typecheck`
Run: `npm run test`
Expected output: Both commands pass successfully in all workspaces.

- [ ] **Step 4: Commit generated files if any changed**

```bash
git add packages/mcp/data/
git commit -m "fix(mcp): resolve type exports and truncated usage snippets in AST extractor"
```
