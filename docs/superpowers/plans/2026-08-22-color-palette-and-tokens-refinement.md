# Color Palette and Tokens Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `kj-product-kit-starter` color palette to a warm neutral base with refined amber/teal accents, WCAG AA compliant light-mode status colors, dedicated `controlBorder` tokens for form accessibility, and a 6-color categorical data visualization palette.

**Architecture:** Update `packages/design/tokens.json` as the single source of truth, run `build-tokens.js` to compile CSS custom properties and Tailwind `@theme` bridge, update form inputs in `packages/ui` to consume `controlBorder`, and update documentation in `docs/DESIGN.md`.

**Tech Stack:** Design Tokens (DTCG format), CSS Custom Properties, Tailwind CSS v4 (`@theme`), React 19, Vitest, Biome.

**Spec:** Current session discussion on refined neutral ramp, amber/teal tuning, WCAG AA status colors, and control borders.

## Global Constraints
- Do not break existing CSS variable names or Tailwind class utilities.
- Maintain WCAG 2.1 AA compliance for text (>= 4.5:1) and non-text UI components (>= 3:1).
- Synchronize token versioning to `0.9.3`.

---

### Task 1: Update `packages/design/tokens.json` with Refined Palette and New Tokens

**Files:**
- Modify: `packages/design/tokens.json`

**Interfaces:**
- Produces: Updated semantic and primitive color tokens for light and dark themes.

- [ ] **Step 1: Update primitive and semantic tokens in `packages/design/tokens.json`**
  - Synchronize version to `"0.9.3"`.
  - Update Light Neutral ramp: `background: #fafaf9`, `bgSubtle: #fafaf9`, `mutedForeground: #5f5f68`, `border: #e7e5e4`, `borderStrong: #d6d3d1`, `input: #a1a1aa`, `controlBorder: #a1a1aa`, `controlBorderHover: #71717a`.
  - Update Dark Neutral ramp: `background: #0c0c0d`, `foreground: #f5f5f4`, `surface: #171719`, `card: #171719`, `cardForeground: #f5f5f4`, `bgCanvas: #0c0c0d`, `bgSubtle: #121214`, `bgSurface: #171719`, `bgElevated: #202023`, `mutedForeground: #a7a7b0`, `border: #2d2d31`, `borderSubtle: #202023`, `borderStrong: #3f3f46`, `input: #3f3f46`, `controlBorder: #3f3f46`, `controlBorderHover: #52525b`.
  - Update Primary: Light `primary: #a84f08`, `primaryHover: #8f4007`, `ring: #a84f08`; Dark `primary: #f5b82e`, `primaryHover: #e8a91b`, `ring: #f5b82e`.
  - Update Secondary: Light `secondary: #0f746d`, `secondaryHover: #0b625c`; Dark `secondary: #38c6b7`, `secondaryHover: #27b3a5`.
  - Update Light Statuses (WCAG AA): `success: #047857`, `warning: #a84f08`, `danger: #be123c`, `info: #0369a1`.
  - Update Chart Tokens (6 series in light & dark):
    - Light: `chart1: #a84f08` (amber), `chart2: #0f746d` (teal), `chart3: #0284c7` (sky), `chart4: #7c3aed` (violet), `chart5: #e11d48` (rose), `chart6: #65a30d` (lime)
    - Dark: `chart1: #f5b82e` (amber), `chart2: #38c6b7` (teal), `chart3: #38bdf8` (sky), `chart4: #a78bfa` (violet), `chart5: #fb7185` (rose), `chart6: #a3e635` (lime)

- [ ] **Step 2: Verify `tokens.json` schema and validity**
  Run: `npm run tokens:check`
  Expected: "Tokens OK"

---

### Task 2: Build Design Tokens and Verify CSS Generation

**Files:**
- Modify: `packages/design/build-tokens.js` (if necessary to handle control-border naming)
- Generate: `packages/design/src/theme.css`
- Generate: `packages/design/src/tailwind.css`

- [ ] **Step 1: Execute `build-tokens.js`**
  Run: `npm run build --workspace @kjaniec-dev/design`
  Expected: Generated `src/theme.css` and `src/tailwind.css` with new variables `--kj-control-border`, `--kj-chart-4`, etc.

- [ ] **Step 2: Inspect output CSS files**
  Verify `--kj-background: #fafaf9`, `--kj-control-border`, `--color-control-border` are created cleanly.

---

### Task 3: Update UI Form Components to use `border-control-border`

**Files:**
- Modify: `packages/ui/src/components/input.tsx`
- Modify: `packages/ui/src/components/checkbox.tsx`
- Modify: `packages/ui/src/components/select.tsx`
- Modify: `packages/ui/src/components/combobox.tsx`
- Modify: `packages/ui/src/components/date-picker.tsx`
- Modify: `packages/ui/src/components/date-range-picker.tsx`
- Modify: `packages/ui/src/components/dropzone.tsx`

- [ ] **Step 1: Update form component border classes**
  Replace `border-input` with `border-control-border hover:border-control-border-hover` where appropriate, ensuring backward compatibility with `--kj-input` mapping.

- [ ] **Step 2: Run UI Vitest suite**
  Run: `npm run test --workspace @kjaniec-dev/ui`
  Expected: All 400 tests pass.

---

### Task 4: Update Design System Documentation

**Files:**
- Modify: `docs/DESIGN.md`

- [ ] **Step 1: Update color palette tables and token rationale in `docs/DESIGN.md`**
  Document the warm neutral base (`#FAFAF9` / `#0C0C0D`), refined amber/teal palette, WCAG AA status colors, form accessibility guidelines, and categorical chart palette.

---

### Task 5: End-to-End Build and Verification

**Files:**
- Monorepo validation

- [ ] **Step 1: Run full build across all workspaces**
  Run: `npm run build`
  Expected: `@kjaniec-dev/design`, `@kjaniec-dev/ui`, `@kjaniec-dev/ui-mcp`, and `@kjaniec-dev/site` build with exit code 0.

- [ ] **Step 2: Run all tests and linter**
  Run: `npm run test`
  Run: `npm run lint`
  Expected: 0 errors, all tests pass.
