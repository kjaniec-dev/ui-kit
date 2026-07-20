# Modularization of site/src/main.tsx Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `site/src/main.tsx` into 6 categorized feature section modules under `site/src/sections/` and a barrel export, reducing `main.tsx` to a light ~200-line root application orchestrator.

**Architecture:** Create `primitives.tsx`, `forms.tsx`, `data-display.tsx`, `navigation.tsx`, `overlays.tsx`, and `layouts.tsx` inside `site/src/sections/`, with a barrel `index.ts` re-exporting all section renderers.

**Tech Stack:** React 19, TypeScript, Vite.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `site/src/sections/primitives.tsx` | Primitives demo section (Button, Badge, Alert, etc.) |
| Create | `site/src/sections/forms.tsx` | Form controls demo section (Inputs, Selects, Pickers, ColorPicker, etc.) |
| Create | `site/src/sections/data-display.tsx` | Data display section (Cards, Tables, DataTable, Timeline, Cards, etc.) |
| Create | `site/src/sections/navigation.tsx` | Navigation demo section (Tabs, Breadcrumbs, Dropdown, Stepper, etc.) |
| Create | `site/src/sections/overlays.tsx` | Overlays demo section (Modal, Drawer, BottomSheet, Popover, InboxPopover, etc.) |
| Create | `site/src/sections/layouts.tsx` | Layouts demo section (AppShell, DashboardShell, SettingsLayout, etc.) |
| Create | `site/src/sections/index.ts` | Barrel export re-exporting all section components |
| Modify | `site/src/main.tsx` | Slim root application orchestrator importing section modules |
| Modify | `docs/BACKLOG.md` | Mark site modularization as complete |

---

## Task 1: Create `site/src/sections/primitives.tsx`

**Files:**
- Create: `site/src/sections/primitives.tsx`

- [ ] **Step 1.1: Extract Primitives demo components and section renderers from `main.tsx` into `site/src/sections/primitives.tsx`**

Extract Button, Badge, Alert, Spinner, Progress, Avatar, Stat, Kbd, and Separator section code from `main.tsx` into `site/src/sections/primitives.tsx`.

- [ ] **Step 1.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 1.3: Commit**

```bash
git add site/src/sections/primitives.tsx
git commit -m "refactor(site): extract PrimitivesSections module"
```

---

## Task 2: Create `site/src/sections/forms.tsx`

**Files:**
- Create: `site/src/sections/forms.tsx`

- [ ] **Step 2.1: Extract Form demo components and section renderers from `main.tsx` into `site/src/sections/forms.tsx`**

Extract Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Segmented, ToggleGroup, DatePickerField, DateRangePickerField, Dropzone, FileUploadField, RatingField, and ColorPickerField section code from `main.tsx` into `site/src/sections/forms.tsx`.

- [ ] **Step 2.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 2.3: Commit**

```bash
git add site/src/sections/forms.tsx
git commit -m "refactor(site): extract FormsSections module"
```

---

## Task 3: Create `site/src/sections/data-display.tsx`

**Files:**
- Create: `site/src/sections/data-display.tsx`

- [ ] **Step 3.1: Extract Data Display demo components and section renderers from `main.tsx` into `site/src/sections/data-display.tsx`**

Extract Card, MetricCard, Table, DataTable, Accordion, Timeline, CodeBlock, ProjectCard, BlogCard, and PricingCard section code from `main.tsx` into `site/src/sections/data-display.tsx`.

- [ ] **Step 3.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 3.3: Commit**

```bash
git add site/src/sections/data-display.tsx
git commit -m "refactor(site): extract DataDisplaySections module"
```

---

## Task 4: Create `site/src/sections/navigation.tsx`

**Files:**
- Create: `site/src/sections/navigation.tsx`

- [ ] **Step 4.1: Extract Navigation demo components and section renderers from `main.tsx` into `site/src/sections/navigation.tsx`**

Extract Tabs, Breadcrumb, Pagination, BottomNavigation, DropdownMenu, CommandPalette, and Stepper section code from `main.tsx` into `site/src/sections/navigation.tsx`.

- [ ] **Step 4.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 4.3: Commit**

```bash
git add site/src/sections/navigation.tsx
git commit -m "refactor(site): extract NavigationSections module"
```

---

## Task 5: Create `site/src/sections/overlays.tsx`

**Files:**
- Create: `site/src/sections/overlays.tsx`

- [ ] **Step 5.1: Extract Overlays demo components and section renderers from `main.tsx` into `site/src/sections/overlays.tsx`**

Extract Modal, Drawer, BottomSheet, ConfirmDialog, Tooltip, Popover, and InboxPopover section code from `main.tsx` into `site/src/sections/overlays.tsx`.

- [ ] **Step 5.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 5.3: Commit**

```bash
git add site/src/sections/overlays.tsx
git commit -m "refactor(site): extract OverlaysSections module"
```

---

## Task 6: Create `site/src/sections/layouts.tsx`

**Files:**
- Create: `site/src/sections/layouts.tsx`

- [ ] **Step 6.1: Extract Layouts demo components and section renderers from `main.tsx` into `site/src/sections/layouts.tsx`**

Extract AppShell, DashboardShell, SettingsLayout, DetailPageLayout, SectionHeader, and TableToolbar section code from `main.tsx` into `site/src/sections/layouts.tsx`.

- [ ] **Step 6.2: Typecheck site**

```bash
cd site && npx tsc --noEmit
```

- [ ] **Step 6.3: Commit**

```bash
git add site/src/sections/layouts.tsx
git commit -m "refactor(site): extract LayoutsSections module"
```

---

## Task 7: Create `site/src/sections/index.ts` & Refactor `main.tsx`

**Files:**
- Create: `site/src/sections/index.ts`
- Modify: `site/src/main.tsx`

- [ ] **Step 7.1: Create `site/src/sections/index.ts` barrel export**

```ts
export * from "./primitives";
export * from "./forms";
export * from "./data-display";
export * from "./navigation";
export * from "./overlays";
export * from "./layouts";
```

- [ ] **Step 7.2: Refactor `site/src/main.tsx` to import section modules**

Clean `main.tsx` to retain App state, Top Header, Sidebar Navigation, Search, and render `<PrimitivesSections />`, `<FormsSections />`, `<DataDisplaySections />`, `<NavigationSections />`, `<OverlaysSections />`, `<LayoutsSections />`.

- [ ] **Step 7.3: Build & test site**

```bash
npm run build --workspace=site
npm test --workspace=site
```

- [ ] **Step 7.4: Commit**

```bash
git add site/src/sections/index.ts site/src/main.tsx
git commit -m "refactor(site): simplify main.tsx to use modular section components"
```

---

## Task 8: Backlog update & final verification

**Files:**
- Modify: `docs/BACKLOG.md`

- [ ] **Step 8.1: Mark site modularization as complete in `docs/BACKLOG.md`**

In `docs/BACKLOG.md`:
Change `- [ ] Split site/src/main.tsx` to `- [x] Split site/src/main.tsx`.

- [ ] **Step 8.2: Full monorepo verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: All 4 commands pass cleanly.

- [ ] **Step 8.3: Commit**

```bash
git add docs/BACKLOG.md
git commit -m "chore: mark site modularization as complete in BACKLOG"
```
