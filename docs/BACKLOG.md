# Backlog

Working backlog of gaps and improvement ideas identified during a repo review (components, docs, tests, tooling). Items are grouped by theme and roughly ordered by priority within each group. Check items off as they land.

## P0 — Test coverage for interactive components

Only 5 of ~48 components have a `.test.tsx` file (`bottom-sheet`, `code-block`, `kbd`, `popover`, `tabs`). The components with the most complex logic (focus trap, keyboard navigation, open/close state) have zero coverage.

- [x] `data-table` — sorting, selection, pagination, search
- [x] `select` — keyboard navigation, open/close, option selection
- [x] `modal` — focus trap, escape/backdrop close, scroll lock
- [x] `drawer` — focus trap, escape/backdrop close, side variants
- [x] `dropdown-menu` — keyboard navigation, item selection, close-on-select
- [x] `command-palette` — `⌘K` shortcut, filtering, keyboard navigation, selection

## P1 — New components: close the `DESIGN.md` gap

`docs/DESIGN.md` → "First components to build" lists components that were never implemented (confirmed via grep — zero occurrences in `packages/`). Either build them or remove them from the doc if no longer relevant.

- [x] `SectionHeader`
- [ ] `BlogCard`
- [ ] `ProjectCard`
- [ ] `AppShell` (generic shell for marketing/portfolio pages — distinct from the existing `DashboardShell`)
- [ ] `PricingCard`

## P1 — New components: common B2B/dashboard gaps

Components frequently needed in SaaS/admin UI kits that are currently missing from `packages/ui/src/components`.

- [x] `DatePicker` / `Calendar` — `TableToolbar`/README mention date filters; single-date picker + standalone calendar grid shipped.
- [x] `DateRangePicker` — dual-month grid, locked navigation, hover preview, and `DateRangePickerField` wrapper shipped (2026-07-10 design doc).
- [x] `Combobox` / `Autocomplete` — `Select` exists, but there's no searchable/filterable variant, common in B2B forms.
- [x] `FileUpload` / `Dropzone` — transport-agnostic drag-drop + validation (accept/maxSize/maxFiles) + per-file progress rows, standalone `Dropzone` primitive, and `FileUploadField` wrapper shipped (2026-07-11 design doc).
- [x] `Timeline` / `ActivityFeed` — fits "Tenant & Property Manager" and "Project & Dev Console" patterns (event history, activity log).
- [x] `Stepper` / `Wizard` — multi-step forms (onboarding, creation wizards).
- [x] `ToggleGroup` / `Separator` (Divider) — multi-select toggle row and a generic layout divider (horizontal/vertical, decorative or semantic) shipped.

## P2 — New components: nice-to-have

- [ ] `NotificationCenter` / `InboxPopover` — persistent notifications (bell icon in the top nav), complements the existing `Toast`.
- [ ] `Rating`
- [ ] `ColorPicker`

## P2 — Tooling & process

- [ ] Add a linter (ESLint flat config, likely with `eslint-plugin-react` + `jsx-a11y`) and a `lint` step in CI (`.github/workflows/ci.yml` currently only runs `tokens:check`, `typecheck`, `test`, `build`, `mcp:build`, `build-storybook`).
- [ ] Add `CHANGELOG.md` for `@kjaniec-dev/ui` / `@kjaniec-dev/design` — both are published to npm but have no changelog, making it hard for consumers to track breaking changes.
- [ ] Align `packages/mcp` on `vitest` instead of its own `run-test.ts` script, for tooling consistency with the rest of the monorepo.

## P3 — Codebase hygiene

- [ ] Split `site/src/main.tsx` (1541 lines) into per-section modules, mirroring the existing pattern of `example-tabs.tsx` / `highlighted-code.tsx`, so new gallery sections don't keep growing a single file.

---

**How to use this backlog:** pick an item, open a plan/spec under `docs/superpowers/plans` (or just a PR) for it, and check it off here once merged. Priorities (`P0`–`P3`) reflect risk/impact, not strict execution order — re-prioritize as needed.
