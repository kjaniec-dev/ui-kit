# Package Changelogs & MCP Vitest Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Keep a Changelog formatted `CHANGELOG.md` files for `@kjaniec-dev/ui` and `@kjaniec-dev/design`, migrate `@kjaniec-dev/ui-mcp` to Vitest, and complete all items in `docs/BACKLOG.md`.

**Tech Stack:** Markdown (Keep a Changelog 1.1.0), Vitest, TypeScript.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/ui/CHANGELOG.md` | Release history for `@kjaniec-dev/ui` (v0.1.0 to v0.8.0) |
| Create | `packages/design/CHANGELOG.md` | Release history for `@kjaniec-dev/design` (v0.1.0 to v0.8.0) |
| Create | `packages/mcp/src/parser.test.ts` | Vitest suite for `@kjaniec-dev/ui-mcp` extractor |
| Delete | `packages/mcp/run-test.ts` | Obsolete custom runner script |
| Modify | `packages/mcp/package.json` | Update `"test"` script to `"vitest run"` |
| Modify | `docs/BACKLOG.md` | Mark all backlog items complete |

---

## Task 1: Create `packages/ui/CHANGELOG.md`

**Files:**
- Create: `packages/ui/CHANGELOG.md`

- [ ] **Step 1.1: Create `packages/ui/CHANGELOG.md`**

Create `packages/ui/CHANGELOG.md` documenting versions v0.8.0 down to v0.1.0 in Keep a Changelog format.

- [ ] **Step 1.2: Commit**

```bash
git add packages/ui/CHANGELOG.md
git commit -m "docs(ui): add CHANGELOG.md following Keep a Changelog format"
```

---

## Task 2: Create `packages/design/CHANGELOG.md`

**Files:**
- Create: `packages/design/CHANGELOG.md`

- [ ] **Step 2.1: Create `packages/design/CHANGELOG.md`**

Create `packages/design/CHANGELOG.md` documenting design token system updates from v0.8.0 down to v0.1.0 in Keep a Changelog format.

- [ ] **Step 2.2: Commit**

```bash
git add packages/design/CHANGELOG.md
git commit -m "docs(design): add CHANGELOG.md following Keep a Changelog format"
```

---

## Task 3: Migrate `@kjaniec-dev/ui-mcp` to Vitest

**Files:**
- Create: `packages/mcp/src/parser.test.ts`
- Delete: `packages/mcp/run-test.ts`
- Modify: `packages/mcp/package.json`

- [ ] **Step 3.1: Create `packages/mcp/src/parser.test.ts`**

Convert tests from `run-test.ts` into Vitest `describe`, `it`, and `expect` blocks.

- [ ] **Step 3.2: Update `packages/mcp/package.json` script**

Update `"test": "vitest run"` in `packages/mcp/package.json`.

- [ ] **Step 3.3: Delete `packages/mcp/run-test.ts`**

Delete `packages/mcp/run-test.ts`.

- [ ] **Step 3.4: Verify MCP test suite execution**

```bash
npm test --workspace=packages/mcp
```

Expected: Vitest executes 1 test file and passes all tests.

- [ ] **Step 3.5: Commit**

```bash
git add packages/mcp/src/parser.test.ts packages/mcp/package.json
git rm packages/mcp/run-test.ts
git commit -m "test(mcp): migrate test suite from run-test.ts to vitest"
```

---

## Task 4: Backlog update & final verification

**Files:**
- Modify: `docs/BACKLOG.md`

- [ ] **Step 4.1: Mark all backlog items as complete in `docs/BACKLOG.md`**

In `docs/BACKLOG.md`:
Mark `- [x] Add CHANGELOG.md...` and `- [x] Align packages/mcp on vitest...`.

- [ ] **Step 4.2: Full monorepo verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: All 4 commands pass cleanly with 0 errors.

- [ ] **Step 4.3: Commit**

```bash
git add docs/BACKLOG.md
git commit -m "chore: mark all backlog items complete in BACKLOG"
```
