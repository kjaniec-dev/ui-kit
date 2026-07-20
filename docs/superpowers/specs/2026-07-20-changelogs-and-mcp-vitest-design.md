# Package Changelogs & MCP Vitest Migration Design Specification

**Date:** 2026-07-20  
**Status:** Approved  
**Targets:** `@kjaniec-dev/ui`, `@kjaniec-dev/design`, `@kjaniec-dev/ui-mcp`  

---

## 1. Overview & Objectives

This specification completes the final remaining items in `docs/BACKLOG.md`:
1. Add standard `CHANGELOG.md` files for `@kjaniec-dev/ui` and `@kjaniec-dev/design` following Keep a Changelog standards.
2. Migrate `@kjaniec-dev/ui-mcp` test suite from standalone `run-test.ts` to `vitest` (`src/parser.test.ts`).

---

## 2. Changelogs Specification

### 2.1 `packages/ui/CHANGELOG.md`
Follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

Sections:
- **`[0.8.0]`**: `ColorPicker` component suite (`ColorPicker`, `ColorPickerField`, `ColorPickerSwatch`), ESLint v9 Flat Config, `site/src/main.tsx` modularization.
- **`[0.7.0]`**: `Rating` suite (`Rating`, `RatingField`, `RatingSummary`), `InboxPopover` / `NotificationCenter`, `MetricCard`, `DataTable` selection & toolbar, `FileUpload` & `Dropzone`, `DatePicker` & `DateRangePicker`, `Combobox`.
- **`[0.6.0]`**: `Timeline` / `ActivityFeed`, `Stepper` / `Wizard`, `ToggleGroup`, `Separator`.
- **`[0.5.0]`**: B2B components (`AppShell`, `SectionHeader`, `BlogCard`, `ProjectCard`, `PricingCard`).
- **`[0.4.0]`**: Navigation & overlays (`Tabs`, `Breadcrumb`, `Pagination`, `BottomNavigation`, `DropdownMenu`, `CommandPalette`, `Modal`, `Drawer`, `ConfirmDialog`, `BottomSheet`).
- **`[0.3.0]`**: Forms suite (`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented`).
- **`[0.2.0]`**: Data display primitives (`Card`, `Stat`, `Table`, `Badge`, `Alert`, `Progress`, `Spinner`, `Skeleton`, `ErrorState`).
- **`[0.1.0]`**: Initial release of `@kjaniec-dev/ui` component library.

### 2.2 `packages/design/CHANGELOG.md`
Follows Keep a Changelog standard covering token system releases (`[0.8.0]` through `[0.1.0]`).

---

## 3. `@kjaniec-dev/ui-mcp` Vitest Migration Specification

### 3.1 Convert `run-test.ts` to `src/parser.test.ts`
- Create `packages/mcp/src/parser.test.ts` using Vitest `describe`, `it`, and `expect`.
- Test component prop extraction, JSDoc parsing, type mapping, and AST traversal logic.
- Delete `packages/mcp/run-test.ts`.

### 3.2 Script & Configuration Updates
- In `packages/mcp/package.json`:
  - `"test": "vitest run"`
- Root `npm test` runs Vitest across monorepo workspaces cleanly.

---

## 4. Verification

1. Run `npm test` across monorepo.
2. Run `npm run lint` across monorepo.
3. Run `npm run build` across monorepo.
4. Mark remaining items complete in `docs/BACKLOG.md`.
