# Add FAB to Site Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the new `Fab` component to the `site` gallery application to showcase both inline and mobile-only floating behavior.

**Architecture:** Modify `site/src/main.tsx` to import `Fab` from `@kjaniec-dev/ui`, render a static inline preview inside the Buttons section, and render a mobileOnly floating preview at the bottom of the viewport.

**Tech Stack:** React, `@kjaniec-dev/ui`.

---

### Task 1: Add Fab Component to Site Gallery

**Files:**
- Modify: `site/src/main.tsx`

- [ ] **Step 1: Add Fab to imports in site/src/main.tsx**
Import `Fab` from `@kjaniec-dev/ui`.

- [ ] **Step 2: Add inline Fab demo under Buttons section**
Render static FABs with sizes sm, md, lg and variants primary, secondary, outline, danger under the Buttons section.

- [ ] **Step 3: Add floating mobileOnly Fab**
Render floating `Fab` with `mobileOnly` at the bottom of the page container.

- [ ] **Step 4: Verify site build**
Run: `npm run build --workspace=@kjaniec-dev/site` or `npm run build` in root.
Expected: Build succeeds.
