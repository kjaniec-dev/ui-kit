# DateRangePicker / RangeCalendar — Design

## Summary

Add a `RangeCalendar` dual-month grid primitive and a `DateRangePicker` control (button trigger + floating panel wrapping `RangeCalendar`) to `@kjaniec-dev/ui`, plus a `DateRangePickerField` form wrapper. Closes the `DateRangePicker` gap in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section, deferred from the `DatePicker`/`Calendar` work (`docs/superpowers/specs/2026-07-07-datepicker-design.md`).

## Scope

- Dual-month grid, locked navigation: left calendar always shows month N, right always shows month N+1; a single prev/next control pair shifts both by one month together. No independent per-grid navigation.
- Hover preview: while a start date is picked and no end date yet, hovering (or keyboard-focusing) a later day previews the pending range highlight without committing it.
- Auto-commit, no footer: clicking/selecting an end date commits the range and closes the panel immediately — no Apply/Cancel buttons, matching the `DatePicker` v1 precedent of no footer chrome.
- No presets (Today, Last 7 days, This month, etc.) in v1 — same minimalism precedent as `DatePicker` shipping without Today/Clear buttons. Can be added later if a real consumer need shows up.
- `min`/`max` bounds and a `disabledDates` predicate are in scope, mirroring `Calendar`/`DatePicker` exactly.
- Value type is `{ start?: Date; end?: Date }` (a `DateRange` object), not a positional tuple — self-documenting at call sites, matches the common `DateRange` shape used by other date-picker libraries.
- Button-only trigger — no typed date-string entry, same rationale as `DatePicker`.

## Architecture

The existing `Calendar` (`packages/ui/src/components/calendar.tsx`) already implements everything a single month grid needs: grid layout, weekday header, roving-tabindex keyboard nav (arrow/Home/End/PageUp/PageDown/Shift+PageUp/PageDown), the disabled-day skip loop, and clamped month/year arithmetic. Rather than duplicating that logic for a second grid (risking the two copies drifting out of sync on a11y-critical behavior) or bolting range-selection concerns onto `Calendar`'s public API (risking regressions to the already-shipped, tested, showcased single-date component), this design extracts the reusable pieces:

- **Pure date-math helpers** (`startOfDay`, `isSameDay`, `addDays`, `addMonths`, `clampToMonth`, `addMonthsClamped`, `addYearsClamped`, `startOfMonth`, `startOfWeek`, `buildGridDays`, `dateKey`, and the `Intl.DateTimeFormat` instances) move from `calendar.tsx` into a shared internal module, `packages/ui/src/components/calendar-internals.ts`. Both `calendar.tsx` and the new `range-calendar.tsx` import from there. These are already plain functions with no component state, so extraction is a pure move, not a rewrite.
- **`CalendarGrid`** (also in `calendar-internals.ts`, or a sibling internal file `calendar-grid.tsx`) — a non-exported component holding the single-month grid renderer and the keyboard-nav handler (roving tabindex, disabled-skip loop, the full arrow/Home/End/PageUp/PageDown matrix). It's parameterized by:
  - `viewMonth: Date`
  - `isDayDisabled: (d: Date) => boolean`
  - `cellState: (d: Date) => { selected?: boolean; rangeStart?: boolean; rangeEnd?: boolean; inRange?: boolean; today?: boolean }` — lets the two consumers (`Calendar`, `RangeCalendar`) each supply their own highlight semantics without `CalendarGrid` knowing about single-vs-range selection.
  - `onSelectDay: (d: Date) => void` and `onFocusDay?: (d: Date) => void` (the latter used by `RangeCalendar` for hover/keyboard-focus preview)
  - `initialFocusDate` — deterministic starting point (selected date or today) so tests can assert against the mount case (mirrors current `Calendar` behavior)
  - Roving tabindex and the internal `focusedDate` state stay owned inside `CalendarGrid` itself (not lifted to a prop) — each grid manages its own focus independently, matching `Calendar`'s current behavior. `onFocusDay` is a read-only notification fired when that internal focus moves, not a way for the parent to drive it.
- **`Calendar`** becomes a thin wrapper: single-date state management (controlled/uncontrolled `value`, `month`) plus a `cellState` that maps `isSameDay(d, selected)` to `selected` and `isSameDay(d, today)` to `today`. Its public API, DOM output, and `calendar.test.tsx` are unchanged — the existing test suite passing unmodified after the refactor is the regression check that the extraction didn't alter behavior.
- **`RangeCalendar`** (`packages/ui/src/components/range-calendar.tsx`) — owns range state (`{start, end}`, controlled/uncontrolled same as `Calendar`), a single `viewMonth` (left month; right = `addMonths(viewMonth, 1)`), and a `hoverDate` (or `focusedDate`-driven preview target when navigating by keyboard). Renders two `CalendarGrid`s side by side with one shared prev/next header. Its `cellState` for a given day marks `rangeStart`/`rangeEnd`/`inRange` based on the committed range, or based on `start`↔`hoverDate` when a start is picked but no end yet. `onSelectDay` implements the click/selection semantics below; `onFocusDay` (called on hover and on keyboard focus-move within either grid) updates `hoverDate` to drive the live preview.
- **`DateRangePicker`** (`packages/ui/src/components/date-range-picker.tsx`) — button trigger showing `"{start} – {end}"` (formatted via `Intl.DateTimeFormat(undefined, { dateStyle: "medium" })` on each side) or `placeholder` when nothing is committed. Opens a floating panel below the trigger containing `<RangeCalendar>`. Same outside-click (`mousedown` listener on the container) and Escape dismissal pattern as `date-picker.tsx`'s actual implementation: `aria-haspopup="grid"` + `aria-expanded` on the trigger, Escape handled both in the trigger's `onKeyDown` (focus stays on trigger, since the panel is a DOM sibling not a descendant) and in the panel's `onKeyDown` (if focus has moved into the grid).
- **`DateRangePickerField`** — `React.forwardRef<HTMLButtonElement, DateRangePickerFieldProps>` wrapping `FormField` + `DateRangePicker`, mirroring `DatePickerField`'s shape exactly (label/hint/error, ref forwarded to the trigger button).

## Component API

```ts
export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface RangeCalendarProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  month?: Date;                 // controlled left-month; right is always +1 month
  defaultMonth?: Date;          // defaults to value.start ?? today
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  placeholder?: string;         // default "Pick a date range…"
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;                // renders two hidden inputs: `${name}Start` / `${name}End`
  "aria-describedby"?: string;
}

export interface DateRangePickerFieldProps extends Omit<DateRangePickerProps, "error"> {
  label: string;
  hint?: string;
  error?: string;
}
```

## Click / selection semantics

- **No start committed, or a complete range already committed:** clicking (or Enter/Space on the focused cell) sets that day as the new `start` and clears `end` — begins a fresh selection.
- **Start committed, no end yet, clicked day ≥ start:** commits `end`, fires `onChange({ start, end })`. In `DateRangePicker` this also closes the panel and returns focus to the trigger (mirrors `DatePicker`'s `handleCalendarChange`); in standalone `RangeCalendar` there's no panel to close.
- **Start committed, no end yet, clicked day < start:** restarts the selection — the clicked day becomes the new `start` (no "swap start/end" behavior; simpler mental model, matches most range-picker UX conventions).
- **Hover preview:** while a start is committed and no end yet, hovering a day (`onMouseEnter`) or moving keyboard focus to it updates a `hoverDate` used purely for the visual `inRange` highlight between `start` and `hoverDate`. It never fires `onChange`.
- **Escape (`DateRangePicker` only):** if a start-only partial selection is in progress (no end committed), Escape discards it and reverts the visual state to the last fully-committed value, then closes the panel and refocuses the trigger. This avoids the picker reopening later in a half-selected state.

## Keyboard / ARIA behavior

Each `CalendarGrid` (left and right) keeps its own independent roving tabindex and full keyboard matrix, identical to `Calendar`'s today:

| Key | Action |
|---|---|
| Arrow Left/Right | ±1 day (within that grid; does not cross into the other grid) |
| Arrow Up/Down | ±7 days |
| Home/End | Start/end of the current week |
| PageUp/PageDown | ±1 month (shifts **both** grids together, since navigation is locked) |
| Shift+PageUp/PageDown | ±1 year (both grids together) |
| Enter/Space | Select focused date per the click semantics above |
| Escape | (`DateRangePicker` only) revert partial selection, close popover, refocus trigger |

Tab order moves naturally from the left grid's roving cell to the right grid's roving cell (two independent `role="grid"` regions) — no special cross-grid arrow-key handling is implemented; this is a deliberate simplification (see Non-goals).

Each grid has its own `aria-label` (e.g. "July 2026", "August 2026"). Disabled days (outside `[min, max]` or matching `disabledDates`) render `aria-disabled`, are excluded from arrow-key traversal via the same skip-loop `Calendar` already uses, and are not clickable — identical rule applied independently in both grids.

The `DateRangePicker` trigger gets `aria-haspopup="grid"` and `aria-expanded`, matching the actual (not spec-described) `DatePicker` implementation.

## Error handling / edge cases

- `disabledDates` blocks a day from being chosen as `start` or `end`, but does **not** validate days strictly *between* an already-committed `start` and `end` — a consumer-supplied range that happens to pass through a disabled day is accepted as-is. This matches `Calendar`/`DatePicker`'s existing philosophy of trusting an explicit value from the consumer rather than second-guessing it, and avoids a class of edge cases (what should happen if a mid-range day becomes disabled after the fact) that no real consumer need has surfaced yet.
- Controlled (`value` + `onChange`) vs uncontrolled (`defaultValue` only) — same `value !== undefined` split already used by `Calendar`/`Combobox`.
- Day identity/equality compares by local calendar date (year/month/day) via the shared `isSameDay`, not `Date` reference or `getTime()`.
- Month/year arithmetic reuses the existing clamped helpers (`addMonthsClamped`, `addYearsClamped`) — no new date-math is introduced.
- No responsive/stacked layout for narrow viewports: `Calendar` itself is already a fixed `w-[280px]` with no responsive behavior, so `RangeCalendar`'s two-grid layout (~560px+ wide) follows that same existing non-responsive precedent rather than introducing new behavior inconsistent with the rest of the kit.

## Form serialization

`DateRangePicker` renders two hidden inputs when `name` is provided — `<input type="hidden" name={`${name}Start`} value={...ISO date or ""} />` and the `End` counterpart — rather than reusing `Combobox`'s repeated-`name` multi-value pattern, since `start`/`end` are two distinct fields, not repeated values of one field. ISO date strings use the same local `YYYY-MM-DD` formatting `date-picker.tsx` already uses (not `toISOString()`, which can shift the date across a timezone boundary).

## Testing

- **`calendar.test.tsx`**: unchanged, must pass as-is after the `CalendarGrid` extraction — this is the regression check that refactoring `Calendar` onto the shared internals didn't alter its behavior.
- **`range-calendar.test.tsx`**: both grids render the correct (locked, N/N+1) months; prev/next shifts both together; full keyboard matrix on each grid independently (arrow/Home/End/PageUp/PageDown/Shift+PageUp/PageDown); click-start-then-click-end commits `{start, end}` via `onChange`; hover preview highlights the in-between days without firing `onChange`; clicking a day earlier than an in-progress `start` restarts the selection; `min`/`max`/`disabledDates` disable and skip days in both grids; controlled `value`/`month` drive rendering, not internal state.
- **`date-range-picker.test.tsx`**: trigger shows placeholder or formatted `"start – end"`; click/Enter/Space opens the panel; completing a selection closes the panel and updates the trigger label; Escape during a partial (start-only) selection reverts and closes without committing; Escape/outside-click with no partial selection just closes; `disabled` prevents opening; `error`/`required` reflected as `aria-invalid`/`aria-required` on the trigger.
- **`DateRangePickerField` tests**: ref forwards to the trigger button; `label`/`hint`/`error` integrate with `FormField` the same way `DatePickerField` does.

## Non-goals (this iteration)

- Presets (Today, Last 7/30 days, This month, custom, etc.).
- Apply/Cancel footer buttons — selection auto-commits on the second click.
- Typed/manual date-string entry.
- Cross-grid keyboard focus traversal (arrow key at the edge of one grid moving into the other).
- Independent per-grid month navigation.
- Enforcing that every day within a committed range is itself non-disabled.
- A minimum/maximum range length (nights) constraint.
- Responsive/stacked single-column layout for narrow viewports.
- Locale/calendar-system switching beyond what `Intl.DateTimeFormat(undefined, …)` gives for free.
