# Primitives Pack + Showcase Usage Examples — Design Spec

## 1. Overview & Roadmap Context

This spec covers the first two sub-projects of the kit expansion roadmap:

| # | Sub-project | Status |
|---|---|---|
| 1 | **Popover + Kbd + CodeBlock** (this spec) | designed |
| 2 | **Showcase usage examples** (this spec) | designed |
| 3 | Combobox + MultiSelect | future spec — depends on Popover |
| 4 | DatePicker + DateRangePicker | future spec — depends on Popover |
| 5 | Stepper + Timeline + DescriptionList | future spec — independent |

Sub-projects 3–5 get their own specs later. Popover is designed here as the positioning
primitive that Combobox/MultiSelect/DatePicker will build on. CodeBlock is required by
the showcase work in sub-project 2.

Every new component ships with: implementation in `packages/ui/src/components/`,
Storybook stories, barrel export in `packages/ui/src/index.ts`, JSDoc on all public
props (feeds the MCP extractor), regenerated `packages/mcp/data/components.json`,
and a gallery section in `site/src/main.tsx`.

## 2. Popover

A generic floating-panel primitive. Unlike `DropdownMenu` (menu-shaped: menuitem roles,
item focus cycling, close-on-item-click), `Popover` renders arbitrary content — filter
panels, inline help, pickers.

### 2.1 API

```tsx
<Popover open={open} onOpenChange={setOpen}>   {/* both optional — uncontrolled by default */}
  <PopoverTrigger asChild>
    <Button variant="outline">Filters</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" className="w-72">
    ...anything...
  </PopoverContent>
</Popover>
```

- `Popover` — root; context provider; `relative inline-block` wrapper div.
  - `open?: boolean` + `onOpenChange?: (open: boolean) => void` — controlled mode.
    When `open` is undefined the component manages its own state (uncontrolled),
    same pattern as elsewhere in the kit.
- `PopoverTrigger` — `<button>` by default; `asChild` clones the child element and
  merges the toggle `onClick` (same mechanics as `DropdownMenuTrigger`).
  Sets `aria-haspopup="dialog"` and `aria-expanded`.
- `PopoverContent` — panel; extends `React.HTMLAttributes<HTMLDivElement>`.
  - `side?: "top" | "bottom" | "left" | "right"` — default `"bottom"`.
  - `align?: "start" | "center" | "end"` — default `"center"`.

### 2.2 Behavior

- **Positioning**: pure CSS classes relative to the wrapper (kit idiom — no portal,
  no floating-ui dependency, no collision detection in v1). Side/align map to a
  static class lookup table (e.g. `bottom` + `start` → `top-[calc(100%+6px)] left-0`).
- **Dismissal**: click outside closes; `Escape` closes and returns focus to trigger.
- **Focus**: on open, focus moves to the panel (`tabIndex={-1}` on `PopoverContent`);
  no focus trap (non-modal). On close via Escape, focus returns to trigger.
- **A11y**: `role="dialog"` on content; `aria-expanded` on trigger.
- **DOM presence**: content renders only while open (matches `DropdownMenuContent`),
  with the kit's `kjpop` open animation.

### 2.3 Architecture

`PopoverContext { open, setOpen, triggerRef }` — mirrors `MenuContext` in
`dropdown-menu.tsx` plus a trigger ref for focus return. Controlled/uncontrolled
resolved in the root: internal state used when `open` prop undefined.

## 3. Kbd

Inline keyboard-shortcut hint. Pairs with `CommandPalette` (⌘K) and menu shortcut labels.

```tsx
<Kbd>⌘K</Kbd>
<Kbd keys={["⌘", "Shift", "P"]} />   // renders one <kbd> per key with separators
```

- `keys?: string[]` — when given, renders each key as its own `<kbd>` chip separated
  by a small flex gap (no "+" glyph); children ignored. Otherwise renders children
  inside a single `<kbd>`.
- `size?: "sm" | "md"` — default `"sm"`.
- Styling: monospace, `bg-muted`, `border-border`, rounded, slight bottom border
  emphasis for a keycap look. Token-driven, no new tokens needed.

## 4. CodeBlock

Code snippet display with copy-to-clipboard. Dev-console pattern; consumed by the
showcase Code tab.

```tsx
<CodeBlock code={snippet} language="tsx" filename="invoice-table.tsx" />
```

- `code: string` — required; the snippet text.
- `language?: string` — shown as a label in the header when no `filename`; **no
  syntax highlighting in v1** (keeps kit dependency-free; plain monospace on
  `bg-muted`/card surface).
- `filename?: string` — optional header label.
- `copyable?: boolean` — default `true`; copy button uses
  `navigator.clipboard.writeText`, flips icon/label to "Copied" for ~1.5 s.
  If the Clipboard API is unavailable (insecure context), the button hides itself.
- `maxHeight?: number` — optional; scrolls internally past it.
- Wraps in `overflow-x: auto` — never widens page layout.

## 5. Showcase Usage Examples (site)

Goal: every gallery section offers **Demo | Props | Code** so a visitor can see the
component, its API, and copy-paste usage — without leaving the page.

### 5.1 Data source

`packages/mcp/data/components.json` imported directly by the site via Vite JSON import.
It already carries `name`, `importPath`, `description`, `props[]` (name / type /
optional / default / description), `cva` variants, and `usageSnippet` per component —
86 entries. Single source of truth; site and MCP server can never drift.

### 5.2 `ExampleTabs` (site-local component)

Site-local wrapper (not exported from the kit) used inside gallery sections:

```tsx
<ExampleTabs components={["Button"]}>          {/* names looked up in components.json */}
  <Box>...existing live demo markup...</Box>
</ExampleTabs>

<ExampleTabs components={["Card", "CardHeader", "CardTitle", "CardContent"]} code={cardExample}>
  ...
</ExampleTabs>
```

- Renders kit `Tabs` with three tabs: **Demo** (children unchanged), **Props**, **Code**.
- **Props tab**: one generated table per listed component name — columns Name, Type,
  Default, Description. Long union types wrap inside an `overflow-x:auto` container.
  Compound components stack multiple tables under subheadings.
- **Code tab**: kit `CodeBlock` showing `importPath` line + snippet.
  Snippet resolution order: explicit `code` prop → entry in
  `site/src/example-overrides.ts` → `usageSnippet` from JSON.
- Lookup misses (name not in JSON) render nothing for that entry and `console.warn`
  in dev — never crash the gallery.

### 5.3 Curated overrides

`site/src/example-overrides.ts` — `Record<string, string>` of richer snippets for
components whose auto-extracted `usageSnippet` is too thin to teach usage. Initial
curated set: `Button`, `DataTable`, `DashboardShell`, `FormField`, `Tabs`, `Toast`,
`CommandPalette`, `Drawer`. Others keep the auto snippet.

### 5.4 Rollout

All existing gallery sections get wrapped in `ExampleTabs`. Default tab is Demo, so
visual appearance of the gallery is unchanged until a visitor clicks Props/Code.
New sections for `Popover`, `Kbd`, `CodeBlock` are added in the same pass.

## 6. MCP Data Regeneration

The three new components get JSDoc'd props so `packages/mcp/src/extractor.ts`
(`generate()`) picks them up. Regenerate `components.json` / `tokens.json` as part of
the MCP build and commit the refreshed data.

## 7. Error Handling

- Popover: guard `useContext` misuse (trigger/content outside root) with a clear
  thrown error, matching kit conventions where present.
- CodeBlock copy failure (rejected promise): swallow and keep "Copy" label — no toast
  dependency inside the kit component.
- ExampleTabs: missing JSON entry → dev warning, tab still renders remaining entries.

## 8. Testing & Verification

- **Unit (vitest)**: Popover — open/close, click-outside, Escape + focus return,
  controlled vs uncontrolled. CodeBlock — copy writes to clipboard (mock), copied
  state resets. Kbd — keys array rendering. Follows `bottom-sheet.test.tsx` patterns.
- **Stories**: each new component gets `*.stories.tsx` covering variants/sides/aligns.
- **Showcase**: `npm run site:dev` + Playwright MCP visual verification — tabs render,
  props tables populated, copy button works, no layout regressions in existing sections.
- **Type safety**: `npm run typecheck` across workspaces.

## 9. Out of Scope

- Collision detection / auto-flip for Popover (add later if real layouts demand it).
- Syntax highlighting in CodeBlock (revisit after seeing it in the showcase).
- Combobox, MultiSelect, DatePicker, DateRange, Stepper, Timeline, DescriptionList —
  sub-projects 3–5, separate specs.
- Extensions backlog (DataTable column visibility, Badge chip variant, Toast actions,
  MetricCard sparkline, TableToolbar filter chips, Pagination page-size selector) —
  tracked for future iterations, not designed here.
