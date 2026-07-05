# Combobox / Autocomplete — Design

**Status:** Approved
**Date:** 2026-07-05
**Backlog item:** P1 — New components: common B2B/dashboard gaps → `Combobox / Autocomplete`

## Purpose

The kit has a `Select` (a styled native `<select>`) but no searchable/filterable
variant. `Combobox` fills that gap: a text-filterable listbox picker for B2B forms,
supporting both single-select and multi-select in one component.

## Scope

**In v1:**

- Single-select and multi-select in one `<Combobox>` (a `multiple` boolean flips modes).
- Type-to-filter over a static `options` array (case-insensitive substring on label).
- Full keyboard navigation and ARIA combobox/listbox semantics.
- Controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage.
- A `ComboboxField` wrapper (label / hint / error / required) mirroring `SelectField`.

**Out of scope (possible follow-ups):**

- Async / remote-loaded options.
- Creatable / free-text custom values.
- Option groups / headings.
- List virtualization.

## API

```ts
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxBaseProps {
  options: ComboboxOption[];
  /** Trigger text when nothing is selected. Default "Select…". */
  placeholder?: string;
  /** Search input placeholder inside the popup. Default "Search…". */
  searchPlaceholder?: string;
  /** Shown when the filter matches no options. Default "No results". */
  emptyMessage?: string;
  disabled?: boolean;
  /** Visual error state (red border + aria-invalid on the trigger). */
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export type ComboboxProps =
  | (ComboboxBaseProps & {
      multiple?: false;
      value?: string;
      defaultValue?: string;
      onChange?: (value: string) => void;
    })
  | (ComboboxBaseProps & {
      multiple: true;
      value?: string[];
      defaultValue?: string[];
      onChange?: (value: string[]) => void;
    });
```

The discriminated union types `value` / `defaultValue` / `onChange` as `string` in
single mode and `string[]` in multi mode at the call site.

```ts
// Distributive omit preserves the discriminated union (plain Omit<Union, K>
// collapses it to the shared keys and loses the `multiple` narrowing).
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ComboboxFieldProps = DistributiveOmit<ComboboxProps, "error"> & {
  label: string;
  hint?: string;
  error?: string;    // string error message, like SelectField
  required?: boolean;
};
```

`ComboboxField` wraps `Combobox` in the existing `FormField`, matching `SelectField`
and `TextField`. The `error` string toggles the Combobox's boolean `error`.
`DistributiveOmit` is required: a plain `Omit<ComboboxProps, "error">` over the
union would drop the `multiple` discriminant and break `value`/`onChange` typing.

## Structure

Single component file `combobox.tsx`, `"use client"`, `forwardRef` to the trigger
button. No new dependencies — reuses existing tokens and patterns.

- **Trigger** — a `<button type="button">` styled like `Select`: `border-input`,
  `rounded-kj-md`, `bg-surface`, inline SVG chevron (like `CommandPalette`'s icons),
  focus ring `focus:ring-ring/30`, density-aware vertical padding
  (`py-[calc(0.6rem*var(--kj-density,1))]`).
  - Single mode: shows the selected option's label, or `placeholder`.
  - Multi mode: shows removable chips (styled with `bg-primary/10 text-primary`,
    each with an × button), or `placeholder` when empty.
- **Popup** — an absolutely-positioned panel below the trigger, following the
  `Popover` positioning approach (`absolute z-40 top-[calc(100%+6px)] left-0`,
  `min-w-full`, `bg-surface border border-border rounded-kj-md shadow-kj-lg`). It
  contains:
  - a search `<input>` (autofocused on open), and
  - a scrollable `role="listbox"` of `role="option"` rows; `emptyMessage` when the
    filter matches nothing.

## Behavior

- **Open**: on trigger click, `ArrowDown`, or typing. Search input is autofocused on
  open. `activeIndex` resets to 0 (or first enabled option).
- **Filter**: case-insensitive substring match on `option.label` (same approach as
  `CommandPalette`). `activeIndex` resets to 0 when the filtered list changes.
- **Keyboard** (while open):
  - `ArrowDown` / `ArrowUp` — move `activeIndex` across enabled options, wrapping.
  - `Enter` — select the active option.
  - `Escape` — close popup, refocus trigger.
  - `Home` / `End` — jump to first / last enabled option.
  - Multi mode, `Backspace` on an empty search input — remove the last selected chip.
- **Selection**:
  - Single — set value, close popup, focus trigger.
  - Multi — toggle the value in the array; popup stays open; search input keeps focus.
  - Disabled options are not selectable and are skipped by keyboard navigation.
- **Dismiss**: outside mousedown or `Escape` closes the popup (same document-listener
  pattern as `Popover`). Escape refocuses the trigger.
- **State**: controlled when `value` is provided (call `onChange` only), otherwise
  uncontrolled from `defaultValue`. Open state is always internal.

## Accessibility

- **Trigger** button: `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`
  (listbox id), `aria-invalid` when `error`, `disabled` passthrough.
- **Search input**: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`,
  `aria-controls` (listbox id), `aria-activedescendant` (active option id).
- **Listbox**: `role="listbox"`, `aria-multiselectable={true}` in multi mode, stable
  `id` for `aria-controls` / `aria-activedescendant`.
- **Options**: `role="option"`, `aria-selected`, `aria-disabled`, unique `id` for
  active-descendant tracking.
- Chip remove buttons have `aria-label` (e.g. `Remove {label}`).

## Styling

Existing design tokens only; light and dark handled automatically by tokens.

- Active option: `bg-primary/10 text-primary`. Hover: `bg-muted`.
- Selected option (multi): a check mark, `text-primary`.
- Chips: `bg-primary/10 text-primary`, `rounded-kj-sm`.
- Error: `border-danger` on the trigger.
- Disabled option: `text-muted-foreground opacity-50`, `cursor-not-allowed`.
- Density via `--kj-density`, matching `Select` / `Input`.

## Testing

`combobox.test.tsx` — vitest + `@testing-library/react`, matching `select.test.tsx`
style. Cases:

1. Renders the trigger with the placeholder when nothing is selected.
2. Opens the popup on trigger click and shows all options.
3. Filters options by typed search text; shows `emptyMessage` on no match.
4. Single: selecting an option sets the trigger label, closes the popup, fires
   `onChange(value)`.
5. Reflects a controlled single `value`.
6. Multi: selecting toggles chips and fires `onChange(array)`; removing a chip fires
   `onChange` without that value.
7. Keyboard: `ArrowDown` + `Enter` selects the active option; `Escape` closes.
8. A disabled option cannot be selected (click and keyboard skip it).
9. `error` sets `aria-invalid` on the trigger.
10. `ComboboxField` associates the label, shows the hint, and swaps hint → error with
    `aria-invalid` when `error` is set.

## Definition of done

- `packages/ui/src/components/combobox.tsx` — `Combobox` + `ComboboxField`.
- `packages/ui/src/components/combobox.stories.tsx` — `title: "Forms/Combobox"`;
  stories for single, multi, disabled option, error, and `ComboboxField`.
- `packages/ui/src/components/combobox.test.tsx` — the cases above.
- Barrel export in `packages/ui/src/index.ts`
  (`Combobox`, `ComboboxField`, `type ComboboxOption`, `type ComboboxProps`,
  `type ComboboxFieldProps`).
- Regenerate MCP data: `npm run mcp:build` (updates `packages/mcp/data/components.json`).
- Add a Combobox gallery section to `site/src/main.tsx`, consistent with existing
  form components.
- Check the item off in `docs/BACKLOG.md`.
- Verify: `npm run typecheck`, `npm run test`, `npm run build`, plus a Playwright
  visual/functional pass in the site.
