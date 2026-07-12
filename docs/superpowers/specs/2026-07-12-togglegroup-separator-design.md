# ToggleGroup / Separator — Design

## Summary

Add a `ToggleGroup` (multi-select toggle row) and a `Separator` (layout divider) to `@kjaniec-dev/ui`. Closes the `ToggleGroup` / `Separator` (Divider) item in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section — small but commonly used primitives, missing despite `Segmented`/`Tabs` already existing.

## Scope

- **`ToggleGroup` is multi-select only.** `Segmented` already covers single-select tab-style switching (`role="tablist"`, one active slot). `ToggleGroup` covers the case `Segmented` doesn't: independent toggles, e.g. a text-formatting toolbar (bold/italic/underline) or a multi-filter row — `role="group"` with `aria-pressed` buttons, any subset of options can be active at once.
- **Item content mirrors `Segmented`'s API shape** — `{ value, label: ReactNode }` — so `label` can be icon-only, text-only, or icon+text, matching the existing option-list convention instead of inventing a new one.
- **`Separator` supports both orientations.** Horizontal (default) for section dividers, vertical for toolbar/inline item dividers (e.g. between `ToggleGroup` clusters). `dropdown-menu.tsx` already has its own internal `DropdownMenuSeparator` (scoped to menu items) — this is a new, generic, standalone primitive, not a replacement for that one.
- **`Separator` is decorative by default** (`role="none"`, hidden from the accessibility tree) since most dividers are pure visual lines; `decorative={false}` opts into `role="separator"` + `aria-orientation` for the rare case where the divider is semantically meaningful (e.g. separating groups of controls for assistive tech).
- No new npm dependency (no icon library in the kit — demos/stories use inline SVG, matching `Button`/FAB usage).

## Architecture

Two small, independent, stateless/controlled units — no shared internals file needed (unlike `FileUpload`/`DateRangePicker`, neither component has async or validation logic to extract). Each follows the kit's existing controlled-component and token/`cn` conventions (`Segmented`, `Switch`).

- **`ToggleGroup`** (`packages/ui/src/components/toggle-group.tsx`) — controlled multi-select. Renders a `role="group"` container of `<button type="button" aria-pressed>` elements. Clicking a button toggles its `value` in/out of the `value: T[]` array and calls `onChange` with the new array. No internal state (always controlled, like `Segmented`).
- **`Separator`** (`packages/ui/src/components/separator.tsx`) — a `<div>` styled as a thin line, orientation and decorative/semantic behavior driven by props. Purely presentational, no state.

## Component API

```ts
export interface ToggleGroupOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface ToggleGroupProps<T extends string> {
  options: ToggleGroupOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string; // required — the group has no visible label of its own
}

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical"; // default "horizontal"
  decorative?: boolean; // default true
  className?: string;
}
```

## `ToggleGroup` behavior

- Always controlled: `value: T[]` is the source of truth, no `defaultValue`/uncontrolled mode (mirrors `Segmented`, which is also always-controlled — there's no ambiguous "uncontrolled multi-select" default to guess at).
- Clicking an option's button: if `value` includes that option's `value`, produce a new array with it removed; otherwise produce a new array with it appended. Call `onChange` with the result. The component never mutates or holds its own copy of `value`.
- Each button: `type="button"`, `role="button"` (native default), `aria-pressed={active}`, `disabled` when the group's `disabled` prop is set.
- Visual style reuses the `Segmented` track look (`bg-muted` container, `p-[3px]`, rounded pill buttons) but each button's active state (`bg-surface text-foreground shadow-kj-xs`) is independent per-button rather than exclusive.
- Keyboard: native `<button>` gives Tab/Enter/Space for free — no roving tabindex or arrow-key navigation (that's a `role="group"` convention difference from `role="tablist"`'s roving-tabindex requirement in `Segmented`).

## `Separator` behavior

- `orientation="horizontal"` (default): `h-px w-full bg-border`.
- `orientation="vertical"`: `w-px h-full bg-border`. Requires the parent to provide height (e.g. a flex row with `items-stretch` or an explicit height) — documented in the Storybook story, not enforced in code (same "consumer's responsibility" precedent as `Dropzone`'s parent-provided sizing).
- `decorative` (default `true`): `role="none"` and `aria-hidden="true"` — a pure visual line, invisible to assistive tech.
- `decorative={false}`: `role="separator"` and `aria-orientation={orientation}` (per WAI-ARIA, `aria-orientation` is only meaningful — and only set — when semantic).
- No interactive behavior, no focus.

## Testing

- **`toggle-group.test.tsx`**: clicking an inactive option adds its value to the array via `onChange` (without duplicating existing selections); clicking an active option removes just that value; `aria-pressed` reflects membership in `value` for each button; multiple options can be simultaneously pressed; `disabled` disables every button and clicks are no-ops; `aria-label` is present on the group container.
- **`separator.test.tsx`**: default render has `role="none"` and `aria-hidden="true"`; `decorative={false}` renders `role="separator"` with `aria-orientation` matching the `orientation` prop; `orientation="vertical"` (decorative) has no `aria-orientation` (since it's not semantic); correct orientation classes (`w-full`/`h-full`) apply per orientation.

## Non-goals (this iteration)

- Roving-tabindex / arrow-key navigation within `ToggleGroup` (that's a `role="tablist"`/single-select concern already served by `Segmented`).
- A single-select mode for `ToggleGroup` — kept out to avoid overlapping `Segmented`'s existing responsibility.
- Enforcing/measuring parent height for vertical `Separator` — documented as the consumer's responsibility.
