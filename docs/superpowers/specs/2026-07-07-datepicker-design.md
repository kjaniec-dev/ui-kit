# DatePicker / Calendar — Design

## Summary

Add a `Calendar` grid primitive and a `DatePicker` control (button trigger + floating panel wrapping `Calendar`) to `@kjaniec-dev/ui`, plus a `DatePickerField` form wrapper. Closes the `DatePicker` / `Calendar` gap in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section.

## Scope

- Single-date selection only. Date-range picking is a distinct interaction (dual-month grid, hover preview between start/end) and is explicitly deferred to a follow-up backlog item.
- Button-only trigger — no typed date-string entry. Matches the existing `Select`/`Combobox` trigger convention in this kit; avoids building date-string parsing/validation.
- `min`/`max` bounds and a `disabledDates` predicate are in scope for v1 (cheap now, awkward to retrofit since it touches keyboard-skip logic).
- No "Today"/"Clear" footer buttons in v1 — just a visual marker on today's date in the grid. Can be added later if a real consumer need shows up.
- Value type is a native `Date` object (not an ISO string), matching most date-picker conventions and simplifying calendar math / `Intl` formatting.

## Architecture

Two new components, following the established convention that trigger-based components (`Select`, `Combobox`, `DropdownMenu`) each roll their own floating panel rather than reusing the generic `Popover`/`PopoverContent` (confirmed via grep — none of them import `popover.tsx`; only its own test/stories do).

- **`Calendar`** (`packages/ui/src/components/calendar.tsx`) — pure grid, no popover, usable standalone (e.g. inline in a dashboard). Renders:
  - Header: prev-month button, "July 2026"-style label, next-month button.
  - Weekday header row (locale-aware short names via `Intl.DateTimeFormat`).
  - 6×7 grid of day cells (`role="grid"` / `role="row"` / `role="gridcell"`, per the ARIA APG Date Picker Dialog pattern — distinct from the listbox pattern `Combobox` uses, because a calendar is a 2D grid, not a 1D list).
  - Leading/trailing days from adjacent months render dimmed and are not selectable (click has no effect, not part of tab sequence).
- **`DatePicker`** (`packages/ui/src/components/date-picker.tsx`) — button trigger showing the formatted selected date (or `placeholder`), opens a floating panel containing `<Calendar>` below the trigger. Click-outside and Escape close the panel, same pattern as `Combobox`'s hand-rolled popup (`combobox.tsx`).
- **`DatePickerField`** (same file as `DatePicker`, or `date-picker.tsx`) — `React.forwardRef<HTMLButtonElement, DatePickerFieldProps>` wrapper around `FormField` + `DatePicker`, mirroring `ComboboxField`/`SelectField`'s shape exactly (label/hint/error, ref forwarded to the trigger button).

## Component API

```ts
export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  month?: Date;                 // controlled displayed month (optional)
  defaultMonth?: Date;          // defaults to value ?? today
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  placeholder?: string;         // default "Pick a date…"
  disabled?: boolean;
  error?: boolean;               // visual error state + aria-invalid on trigger
  required?: boolean;            // aria-required on trigger (buttons have no native `required`)
  className?: string;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
}

export interface DatePickerFieldProps extends DatePickerProps {
  label: string;
  hint?: string;
  error?: string;                // overrides DatePickerProps.error (string message, not boolean)
}
```

Display formatting uses `Intl.DateTimeFormat(undefined, { dateStyle: "medium" })` — no new dependency; the kit has no date library today (`packages/ui/package.json` deps are `class-variance-authority`, `clsx`, `tailwind-merge` only) and native `Date` + `Intl` keeps that true.

## Keyboard / ARIA behavior

Roving tabindex across grid cells (one cell `tabIndex=0` — the selected date, or today if nothing selected — rest `tabIndex=-1`), per ARIA APG Date Picker Dialog:

| Key | Action |
|---|---|
| Arrow Left/Right | ±1 day |
| Arrow Up/Down | ±7 days |
| Home/End | Start/end of the current week |
| PageUp/PageDown | ±1 month |
| Shift+PageUp/PageDown | ±1 year |
| Enter/Space | Select focused date, close popover (DatePicker only; no-op boundary in standalone Calendar) |
| Escape | Close popover, return focus to trigger (DatePicker only) |

Dates outside `[min, max]` or matching `disabledDates` render `aria-disabled`, are excluded from arrow-key traversal (skipped over, same skip-logic pattern `Combobox` uses for `disabled` options), and are not clickable. Month navigation (`PageUp`/`PageDown`, header buttons) stays freely usable near bounds — simpler than disabling nav buttons, and browsing an out-of-range month to see context is harmless since no day in it is selectable.

The trigger button gets `aria-haspopup="dialog"` and `aria-expanded`, matching `Combobox`'s trigger. The floating panel gets `role="dialog"` with `aria-label` derived from the current month/year (e.g. "July 2026"), consistent with `PopoverContent`'s `role="dialog"` convention already used elsewhere in the kit.

## Error handling / edge cases

- `value`/`defaultValue` outside `[min, max]` or matching `disabledDates`: last-write-wins, no special handling — the component doesn't second-guess an explicit prop from the consumer (matches how `Combobox` doesn't validate that a `value` exists in `options`).
- Controlled (`value` + `onChange` both given) vs uncontrolled (`defaultValue` only) — same controlled/uncontrolled split `Combobox` already uses (`value !== undefined` ⇒ controlled).
- Month/year arithmetic uses local `Date` methods (`setMonth`, `setDate`, etc.) throughout — no manual day-count math, avoids off-by-one bugs around month-length/leap-year edges.
- Day-cell identity/equality compares by local calendar date (year/month/day), not `Date` object reference or `getTime()`, since `Date` objects for "the same day" are never reference-equal and may carry different time-of-day components depending on how a consumer constructs them.

## Testing

Mirrors `combobox.test.tsx`'s structure:

- **`calendar.test.tsx`**: grid renders correct days for a given month; prev/next month navigation; full keyboard matrix (arrow/Home/End/PageUp/PageDown/Shift+PageUp/PageDown); `min`/`max`/`disabledDates` render as disabled and are skipped during arrow navigation; `onChange` fires with the correct `Date` on click/Enter/Space; controlled `value`/`month` props drive rendering (not internal state) — same controlled-mode check pattern used for `Combobox`'s multi-select value.
- **`date-picker.test.tsx`**: trigger shows placeholder/formatted value; click/Enter/Space opens the panel; selecting a date closes the panel and updates the trigger label; Escape and outside-click close without selecting; `disabled` prevents opening; `error`/`required` reflected as `aria-invalid`/`aria-required` on the trigger.
- **`DatePickerField` tests** (same file or a `describe` block): ref forwards to the trigger button; `label`/`hint`/`error` integrate with `FormField` the same way `ComboboxField` does.

## Non-goals (this iteration)

- Date-range selection.
- Typed/manual date-string entry.
- Footer "Today"/"Clear" shortcut buttons.
- Locale/calendar-system switching beyond what `Intl.DateTimeFormat(undefined, …)` gives for free from the browser's locale.
