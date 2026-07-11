# DateRangePicker / RangeCalendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `RangeCalendar` dual-month grid primitive and a `DateRangePicker` (button trigger + floating panel) to `@kjaniec-dev/ui`, plus a `DateRangePickerField` form wrapper, closing the `DateRangePicker` P1 backlog gap deferred from the `DatePicker`/`Calendar` work.

**Architecture:** Extract the existing `Calendar`'s reusable internals (pure date-math helpers + the single-month grid renderer/keyboard-nav component) into shared, non-exported modules (`calendar-internals.ts`, `calendar-grid.tsx`), so `Calendar` becomes a thin wrapper over them (public API/tests unchanged) and a new `RangeCalendar` reuses the same grid/keyboard logic for two locked-navigation month grids with range selection + hover preview. `DateRangePicker` is a `forwardRef` trigger button + hand-rolled floating panel wrapping `<RangeCalendar>`, mirroring `DatePicker` exactly (including its Escape-closes-from-trigger fix). `DateRangePickerField` wraps it in `FormField`, mirroring `DatePickerField`.

**Tech Stack:** React 19, TypeScript, Tailwind (kj design tokens), native `Date` + `Intl.DateTimeFormat` (no date library), Vitest + `@testing-library/react`, Storybook, the MCP extractor (`npm run mcp:build`).

## Global Constraints

- Design-token classes only (no raw colors). Reuse existing tokens verified present in `packages/design/src/tailwind.css`: `border-input`, `border-danger`, `bg-surface`, `bg-muted`, `bg-primary`, `text-primary`, `text-primary-foreground`, `text-foreground`, `text-muted-foreground`, `border-border`, `ring-primary`, `shadow-kj-lg`, `rounded-kj-md`, `rounded-kj-sm`, `focus:ring-ring/30`, keyframe `animate-[kjpop_.12s_ease]`. `bg-primary/15` follows the same opacity-modifier convention already used by `ring-ring/30`.
- Density-aware sizing via `var(--kj-density,1)` on the `DateRangePicker` trigger, matching `DatePicker`/`Select`/`Combobox`.
- Works in light and dark automatically (tokens handle it) — no theme-specific code.
- Tests import components directly (`from "./range-calendar"`, `from "./date-range-picker"`), matching `calendar.test.tsx`/`date-picker.test.tsx`.
- All formatting/parsing uses `Intl.DateTimeFormat`; tests build expected strings with the same `Intl.DateTimeFormat` call the component uses, never a hardcoded locale-formatted string.
- Value type is `{ start?: Date; end?: Date }` (a `DateRange` object), not a positional tuple.
- Component files must start with `"use client";`.
- Do not introduce any new npm dependency.
- **`calendar.test.tsx` must pass unmodified after Task 1's refactor** — that is the regression check proving the `CalendarGrid` extraction didn't change `Calendar`'s behavior. Do not edit that test file.
- Commit after each task with a Conventional Commit message ending:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

---

## File Structure

- Create: `packages/ui/src/components/calendar-internals.ts` — shared pure date-math helpers + `Intl.DateTimeFormat` instances (moved out of `calendar.tsx`).
- Create: `packages/ui/src/components/calendar-grid.tsx` — internal (not exported from the package barrel) `CalendarGrid`: single-month grid render + full keyboard nav, parameterized by a `cellState` callback so both `Calendar` and `RangeCalendar` can drive its highlighting without it knowing about single-vs-range selection.
- Modify: `packages/ui/src/components/calendar.tsx` — refactor to a thin wrapper over `CalendarGrid`/`calendar-internals`. Public API and DOM output unchanged.
- Create: `packages/ui/src/components/range-calendar.tsx` — `RangeCalendar` + `DateRange` type.
- Create: `packages/ui/src/components/range-calendar.test.tsx`.
- Create: `packages/ui/src/components/date-range-picker.tsx` — `DateRangePicker` + `DateRangePickerField`.
- Create: `packages/ui/src/components/date-range-picker.test.tsx`.
- Create: `packages/ui/src/components/range-calendar.stories.tsx` — Storybook, `title: "Forms/RangeCalendar"`.
- Create: `packages/ui/src/components/date-range-picker.stories.tsx` — Storybook, `title: "Forms/DateRangePicker"`.
- Modify: `packages/ui/src/index.ts` — barrel exports.
- Modify (generated): `packages/mcp/data/components.json` — via `npm run mcp:build`.
- Modify: `site/src/main.tsx` — gallery demo in the Forms section.
- Modify: `docs/BACKLOG.md` — check the `DateRangePicker` item off.

---

## Task 1: Extract `calendar-internals` + `CalendarGrid`, refactor `Calendar` onto them

**Files:**
- Create: `packages/ui/src/components/calendar-internals.ts`
- Create: `packages/ui/src/components/calendar-grid.tsx`
- Modify: `packages/ui/src/components/calendar.tsx`
- (No test file created — `calendar.test.tsx` is the existing regression suite; it must pass unmodified.)

**Interfaces:**
- Produces (`calendar-internals.ts`): `startOfDay`, `isSameDay`, `addDays`, `addMonths`, `addMonthsClamped`, `addYearsClamped`, `startOfMonth`, `startOfWeek`, `buildGridDays`, `dateKey` (all `(d: Date, ...) => Date | boolean | string`), plus `monthLabelFormat`, `fullDateFormat`, `weekdayLabels: { key: number; short: string; long: string }[]` (all `Intl.DateTimeFormat` instances / derived data).
- Produces (`calendar-grid.tsx`): `CalendarCellState { selected?: boolean; rangeStart?: boolean; rangeEnd?: boolean; inRange?: boolean; today?: boolean }`; `CalendarGridProps { viewMonth: Date; isDayDisabled: (d: Date) => boolean; cellState: (d: Date) => CalendarCellState; onSelectDay: (d: Date) => void; onFocusDay?: (d: Date) => void; initialFocusDate: Date; className?: string }`; `CalendarGrid` — `forwardRef<HTMLDivElement, CalendarGridProps>`.
- Consumes (in `calendar.tsx`): `CalendarGrid`, `CalendarCellState` from `./calendar-grid`; `startOfDay`, `isSameDay`, `addMonths`, `startOfMonth`, `monthLabelFormat` from `./calendar-internals`.

- [ ] **Step 1: Create `calendar-internals.ts`**

Create `packages/ui/src/components/calendar-internals.ts`:

```ts
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

// setMonth/setFullYear roll over into the next month when the target month is
// shorter than the current day-of-month (e.g. Jan 31 + 1 month -> Mar 3, not
// Feb 28). Clamp the day to the target month's actual length to avoid that.
function clampToMonth(year: number, month: number, day: number): Date {
  const daysInTarget = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, daysInTarget));
}

export function addMonthsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear(), d.getMonth() + n, d.getDate());
}

export function addYearsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear() + n, d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

export function buildGridDays(viewMonth: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(viewMonth));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const monthLabelFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
export const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });
const weekdayShortFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const weekdayLongFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });

export const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(startOfWeek(new Date()), i);
  return { key: i, short: weekdayShortFormat.format(d), long: weekdayLongFormat.format(d) };
});
```

- [ ] **Step 2: Run the existing Calendar tests to confirm the current baseline passes**

Run: `npm run test --workspace @kjaniec-dev/ui -- calendar.test`
Expected: PASS (all existing `Calendar` tests green, before touching `calendar.tsx`).

- [ ] **Step 3: Create `calendar-grid.tsx`**

Create `packages/ui/src/components/calendar-grid.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import {
  startOfDay,
  isSameDay,
  addDays,
  startOfWeek,
  buildGridDays,
  dateKey,
  addMonthsClamped,
  addYearsClamped,
  fullDateFormat,
  monthLabelFormat,
  weekdayLabels,
} from "./calendar-internals";

export interface CalendarCellState {
  selected?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange?: boolean;
  today?: boolean;
}

export interface CalendarGridProps {
  viewMonth: Date;
  isDayDisabled: (d: Date) => boolean;
  cellState: (d: Date) => CalendarCellState;
  onSelectDay: (d: Date) => void;
  /** Fired on hover and on keyboard focus-move within this grid (not on click). */
  onFocusDay?: (d: Date) => void;
  /** Seeds the roving-tabindex focus once, on mount. Not re-synced on later prop changes (matches Calendar's existing behavior). */
  initialFocusDate: Date;
  className?: string;
}

export const CalendarGrid = React.forwardRef<HTMLDivElement, CalendarGridProps>(function CalendarGrid(
  { viewMonth, isDayDisabled, cellState, onSelectDay, onFocusDay, initialFocusDate, className },
  ref
) {
  const gridDays = React.useMemo(() => buildGridDays(viewMonth), [viewMonth]);
  const inViewMonth = (d: Date) => d.getMonth() === viewMonth.getMonth() && d.getFullYear() === viewMonth.getFullYear();

  const [focusedDate, setFocusedDate] = React.useState<Date>(() => startOfDay(initialFocusDate));
  const pendingFocusRef = React.useRef(false);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const rovingTarget =
    inViewMonth(focusedDate) && !isDayDisabled(focusedDate)
      ? focusedDate
      : gridDays.find((d) => inViewMonth(d) && !isDayDisabled(d)) ?? gridDays.find((d) => inViewMonth(d)) ?? gridDays[0];

  const moveFocusTo = (next: Date, viaKeyboard: boolean) => {
    pendingFocusRef.current = viaKeyboard;
    setFocusedDate(next);
    onFocusDay?.(next);
  };

  React.useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    const el = gridRef.current?.querySelector(`[data-date="${dateKey(rovingTarget)}"]`) as HTMLElement | null;
    el?.focus();
  }, [rovingTarget]);

  const step = (from: Date, delta: number): Date => {
    let next = addDays(from, delta);
    let guard = 0;
    while (isDayDisabled(next) && guard < 1000) {
      next = addDays(next, delta);
      guard++;
    }
    return isDayDisabled(next) ? from : next;
  };

  const selectDay = (d: Date) => {
    if (isDayDisabled(d)) return;
    moveFocusTo(d, false);
    onSelectDay(d);
  };

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        moveFocusTo(step(rovingTarget, 1), true);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveFocusTo(step(rovingTarget, -1), true);
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocusTo(step(rovingTarget, 7), true);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocusTo(step(rovingTarget, -7), true);
        break;
      case "Home": {
        e.preventDefault();
        const target = startOfWeek(rovingTarget);
        moveFocusTo(isDayDisabled(target) ? step(target, 1) : target, true);
        break;
      }
      case "End": {
        e.preventDefault();
        const target = addDays(startOfWeek(rovingTarget), 6);
        moveFocusTo(isDayDisabled(target) ? step(target, -1) : target, true);
        break;
      }
      case "PageUp": {
        e.preventDefault();
        const target = e.shiftKey ? addYearsClamped(rovingTarget, -1) : addMonthsClamped(rovingTarget, -1);
        moveFocusTo(isDayDisabled(target) ? step(target, -1) : target, true);
        break;
      }
      case "PageDown": {
        e.preventDefault();
        const target = e.shiftKey ? addYearsClamped(rovingTarget, 1) : addMonthsClamped(rovingTarget, 1);
        moveFocusTo(isDayDisabled(target) ? step(target, 1) : target, true);
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        selectDay(rovingTarget);
        break;
    }
  };

  return (
    <div ref={ref} className={cn(className)}>
      <div ref={gridRef} role="grid" aria-label={monthLabelFormat.format(viewMonth)} onKeyDown={onGridKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {weekdayLabels.map((w) => (
            <div
              key={w.key}
              role="columnheader"
              aria-label={w.long}
              className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {w.short}
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div role="row" key={week} className="grid grid-cols-7">
            {gridDays.slice(week * 7, week * 7 + 7).map((day) => {
              if (!inViewMonth(day)) {
                return <div key={dateKey(day)} role="gridcell" aria-hidden="true" className="h-9" />;
              }
              const disabled = isDayDisabled(day);
              const state = cellState(day);
              const isRoving = isSameDay(day, rovingTarget);
              const isEndpoint = !!(state.selected || state.rangeStart || state.rangeEnd);
              return (
                <button
                  key={dateKey(day)}
                  type="button"
                  role="gridcell"
                  data-date={dateKey(day)}
                  tabIndex={isRoving ? 0 : -1}
                  aria-selected={isEndpoint}
                  aria-disabled={disabled || undefined}
                  aria-label={fullDateFormat.format(day)}
                  onMouseEnter={() => onFocusDay?.(day)}
                  onClick={() => selectDay(day)}
                  className={cn(
                    "h-9 w-9 mx-auto flex items-center justify-center text-sm",
                    state.inRange && !isEndpoint ? "rounded-none" : "rounded-full",
                    "focus:outline-none focus:ring-[3px] focus:ring-ring/30",
                    disabled && "text-muted-foreground opacity-40 cursor-not-allowed",
                    !disabled && isEndpoint && "bg-primary text-primary-foreground",
                    !disabled && state.inRange && !isEndpoint && "bg-primary/15 text-foreground",
                    !disabled && !isEndpoint && !state.inRange && state.today && "ring-1 ring-primary text-primary font-medium",
                    !disabled && !isEndpoint && !state.inRange && !state.today && "text-foreground hover:bg-muted"
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
CalendarGrid.displayName = "CalendarGrid";
```

- [ ] **Step 4: Refactor `calendar.tsx` to a thin wrapper over `CalendarGrid`**

Replace the full contents of `packages/ui/src/components/calendar.tsx` with:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { CalendarGrid, type CalendarCellState } from "./calendar-grid";
import { isSameDay, addMonths, startOfMonth, startOfDay, monthLabelFormat } from "./calendar-internals";

export interface CalendarProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  /** Controlled displayed month. Omit for uncontrolled behavior. */
  month?: Date;
  /** Initial displayed month when uncontrolled. Defaults to `value` ?? today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(
    { value, defaultValue, onChange, month, defaultMonth, onMonthChange, min, max, disabledDates, className },
    ref
  ) {
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
    const selected = controlled ? value : internalValue;

    const monthControlled = month !== undefined;
    const [internalMonth, setInternalMonth] = React.useState<Date>(() =>
      startOfMonth(month ?? defaultMonth ?? selected ?? new Date())
    );
    const viewMonth = monthControlled ? startOfMonth(month as Date) : internalMonth;

    const setViewMonth = (next: Date) => {
      const normalized = startOfMonth(next);
      if (!monthControlled) setInternalMonth(normalized);
      onMonthChange?.(normalized);
    };

    const isDayDisabled = React.useCallback(
      (d: Date) => {
        if (min && d < startOfDay(min)) return true;
        if (max && d > startOfDay(max)) return true;
        return disabledDates?.(d) ?? false;
      },
      [min, max, disabledDates]
    );

    const commitValue = (d: Date) => {
      if (!controlled) setInternalValue(d);
      onChange?.(d);
    };

    const today = new Date();
    const cellState = (d: Date): CalendarCellState => ({
      selected: selected ? isSameDay(d, selected) : false,
      today: isSameDay(d, today),
    });

    const inViewMonth = (d: Date) => d.getMonth() === viewMonth.getMonth() && d.getFullYear() === viewMonth.getFullYear();

    // CalendarGrid owns roving focus internally and only reports where it moved
    // via onFocusDay. When a keyboard move (PageUp/PageDown, Shift+PageUp/PageDown,
    // or an Arrow key crossing a month boundary) lands outside the currently
    // displayed month, this is what advances the header/grid to follow it.
    const handleFocusDay = (d: Date) => {
      if (!inViewMonth(d)) setViewMonth(d);
    };

    return (
      <div ref={ref} className={cn("w-[280px] select-none", className)}>
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            className="p-1.5 rounded-kj-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-medium text-foreground">{monthLabelFormat.format(viewMonth)}</span>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="p-1.5 rounded-kj-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        <CalendarGrid
          viewMonth={viewMonth}
          isDayDisabled={isDayDisabled}
          cellState={cellState}
          onSelectDay={commitValue}
          onFocusDay={handleFocusDay}
          initialFocusDate={selected ?? new Date()}
        />
      </div>
    );
  }
);
Calendar.displayName = "Calendar";
```

- [ ] **Step 5: Run the existing Calendar tests to verify the refactor is behavior-preserving**

Run: `npm run test --workspace @kjaniec-dev/ui -- calendar.test`
Expected: PASS — same tests as Step 2, unmodified, still green. If anything fails, fix `calendar.tsx`/`calendar-grid.tsx` (not the test) until it does.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/calendar-internals.ts packages/ui/src/components/calendar-grid.tsx packages/ui/src/components/calendar.tsx
git commit -m "refactor(ui): extract CalendarGrid + date-math internals from Calendar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `RangeCalendar` (dual-month grid, range selection, hover preview)

**Files:**
- Create: `packages/ui/src/components/range-calendar.tsx`
- Test: `packages/ui/src/components/range-calendar.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Consumes: `CalendarGrid`, `CalendarCellState` from Task 1's `./calendar-grid`; `startOfDay`, `isSameDay`, `addMonths`, `startOfMonth`, `monthLabelFormat` from `./calendar-internals`.
- Produces: `DateRange { start?: Date; end?: Date }`; `RangeCalendarProps { value?: DateRange; defaultValue?: DateRange; onChange?: (range: DateRange) => void; month?: Date; defaultMonth?: Date; onMonthChange?: (month: Date) => void; min?: Date; max?: Date; disabledDates?: (date: Date) => boolean; className?: string }`; `RangeCalendar` — `forwardRef<HTMLDivElement, RangeCalendarProps>`; the ref points at the outer container `div`.
- Selection model: `pendingStart: Date | undefined` is purely internal UI state (never part of `value`/`onChange`) tracking an in-progress pick. `onChange` fires exactly once, only when a click/Enter completes a range (`pendingStart` set, clicked day ≥ `pendingStart`). A click while `pendingStart` is `undefined` (nothing in progress, or a prior complete range is showing) always starts a fresh pick. A click on a day earlier than `pendingStart` restarts the pick from that earlier day. This matters for Task 3: `DateRangePicker` relies on `pendingStart` being purely internal — unmounting `RangeCalendar` (which happens naturally when the picker's panel closes) discards any in-progress pick for free, with no extra plumbing needed for the Escape-reverts-partial-selection behavior.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/range-calendar.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RangeCalendar } from "./range-calendar";

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
const dayLabel = (y: number, m: number, d: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(y, m, d));

describe("RangeCalendar", () => {
  it("renders two locked months (left = defaultMonth, right = defaultMonth + 1)", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByRole("grid", { name: monthLabel(2026, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
  });

  it("Next/Previous month shifts both grids together", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 8) })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: monthLabel(2026, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
  });

  it("a keyboard move landing outside both visible months shifts the locked pair", () => {
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 15), end: new Date(2026, 6, 15) }}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    // Shift+PageDown moves the focused day +1 year (July 2027), which is
    // outside the initially-visible [July 2026, August 2026] pair — this is
    // the case that requires CalendarGrid's onFocusDay to reach RangeCalendar's
    // setViewMonth, not just a same-pair move like a plain PageDown would be.
    fireEvent.keyDown(leftGrid, { key: "PageDown", shiftKey: true });
    expect(screen.getByRole("grid", { name: monthLabel(2027, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2027, 7) })).toBeInTheDocument();
  });

  it("click start then click end (later date) commits the range via onChange", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
  });

  it("clicking an end date in the right-hand month completes a cross-month range", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 25) }));
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 7, 5) }));
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 25), end: new Date(2026, 7, 5) });
  });

  it("clicking a day earlier than the in-progress start restarts the selection instead of committing", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) }));
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) }));
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) });
  });

  it("hovering while a start is picked previews the range without committing", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    fireEvent.mouseEnter(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 14) }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 14) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 12) })).toHaveAttribute("aria-selected", "false");
  });

  it("disables days outside min/max and blocks selecting them in both months", () => {
    const onChange = vi.fn();
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        min={new Date(2026, 6, 10)}
        max={new Date(2026, 7, 20)}
        onChange={onChange}
      />
    );
    const outOfRange = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) });
    expect(outOfRange).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(outOfRange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledDates predicate disables matching days in both months", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} disabledDates={(d) => d.getDay() === 0} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-disabled", "true"); // July 5, 2026 is a Sunday
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 7, 2) })).toHaveAttribute("aria-disabled", "true"); // August 2, 2026 is a Sunday
  });

  it("moves the roving tabindex within a grid via ArrowRight without affecting the other grid", () => {
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 8), end: new Date(2026, 6, 8) }}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    fireEvent.keyDown(leftGrid, { key: "ArrowRight" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 9) })).toHaveAttribute("tabindex", "0");
  });

  it("selects the roving day on Enter, completing the range on the second Enter", () => {
    const onChange = vi.fn();
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 8), end: new Date(2026, 6, 8) }}
        onChange={onChange}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    fireEvent.keyDown(leftGrid, { key: "Enter" });
    fireEvent.keyDown(leftGrid, { key: "ArrowRight" });
    fireEvent.keyDown(leftGrid, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 8), end: new Date(2026, 6, 9) });
  });

  it("reflects a controlled value across both grids", () => {
    const { rerender } = render(
      <RangeCalendar value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 8) }} onChange={() => {}} />
    );
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("aria-selected", "true");
    rerender(<RangeCalendar value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 6) }} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("aria-selected", "false");
  });

  it("forwards its ref to the outer container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<RangeCalendar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- range-calendar`
Expected: FAIL — `Failed to resolve import "./range-calendar"` (file does not exist yet).

- [ ] **Step 3: Implement `RangeCalendar`**

Create `packages/ui/src/components/range-calendar.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { CalendarGrid, type CalendarCellState } from "./calendar-grid";
import { startOfDay, isSameDay, addMonths, startOfMonth, monthLabelFormat } from "./calendar-internals";

export interface DateRange {
  start?: Date;
  end?: Date;
}

export interface RangeCalendarProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  /** Controlled left-month. The right month is always this + 1 (locked navigation). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

function isBetweenExclusive(d: Date, lo: Date, hi: Date): boolean {
  const t = startOfDay(d).getTime();
  return t > startOfDay(lo).getTime() && t < startOfDay(hi).getTime();
}

export const RangeCalendar = React.forwardRef<HTMLDivElement, RangeCalendarProps>(
  function RangeCalendar(
    { value, defaultValue, onChange, month, defaultMonth, onMonthChange, min, max, disabledDates, className },
    ref
  ) {
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<DateRange>(defaultValue ?? {});
    const range = controlled ? (value as DateRange) : internalValue;

    const monthControlled = month !== undefined;
    const [internalMonth, setInternalMonth] = React.useState<Date>(() =>
      startOfMonth(month ?? defaultMonth ?? range.start ?? new Date())
    );
    const leftMonth = monthControlled ? startOfMonth(month as Date) : internalMonth;
    const rightMonth = addMonths(leftMonth, 1);

    const setViewMonth = (next: Date) => {
      const normalized = startOfMonth(next);
      if (!monthControlled) setInternalMonth(normalized);
      onMonthChange?.(normalized);
    };

    const isDayDisabled = React.useCallback(
      (d: Date) => {
        if (min && d < startOfDay(min)) return true;
        if (max && d > startOfDay(max)) return true;
        return disabledDates?.(d) ?? false;
      },
      [min, max, disabledDates]
    );

    // Purely internal — never part of the controlled/uncontrolled `value`. Tracks
    // an in-progress pick (start clicked, end not yet chosen) so onChange fires
    // exactly once, only when a full range completes.
    const [pendingStart, setPendingStart] = React.useState<Date | undefined>(undefined);
    const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined);

    const commitRange = (next: DateRange) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    };

    const handleSelectDay = (d: Date) => {
      const day = startOfDay(d);
      if (pendingStart === undefined) {
        setPendingStart(day);
        setHoverDate(undefined);
        return;
      }
      if (day < startOfDay(pendingStart)) {
        setPendingStart(day);
        setHoverDate(undefined);
        return;
      }
      commitRange({ start: pendingStart, end: day });
      setPendingStart(undefined);
      setHoverDate(undefined);
    };

    const today = new Date();
    const previewEnd = pendingStart !== undefined ? hoverDate : undefined;

    const cellState = (d: Date): CalendarCellState => {
      const isToday = isSameDay(d, today);
      if (pendingStart !== undefined) {
        if (previewEnd === undefined) {
          return { rangeStart: isSameDay(d, pendingStart), today: isToday };
        }
        if (startOfDay(previewEnd) < startOfDay(pendingStart)) {
          return { rangeStart: isSameDay(d, previewEnd), today: isToday };
        }
        return {
          rangeStart: isSameDay(d, pendingStart),
          rangeEnd: isSameDay(d, previewEnd),
          inRange: isBetweenExclusive(d, pendingStart, previewEnd),
          today: isToday,
        };
      }
      if (range.start && range.end) {
        return {
          rangeStart: isSameDay(d, range.start),
          rangeEnd: isSameDay(d, range.end),
          inRange: isBetweenExclusive(d, range.start, range.end),
          today: isToday,
        };
      }
      return { rangeStart: range.start ? isSameDay(d, range.start) : false, today: isToday };
    };

    const inLockedRange = (d: Date) =>
      (d.getMonth() === leftMonth.getMonth() && d.getFullYear() === leftMonth.getFullYear()) ||
      (d.getMonth() === rightMonth.getMonth() && d.getFullYear() === rightMonth.getFullYear());

    // Each CalendarGrid owns its own roving focus internally and only reports
    // where it moved via onFocusDay. That single callback serves two purposes
    // here: (1) drives the hover/keyboard-focus range preview (setHoverDate),
    // and (2) — mirroring Calendar's own onFocusDay wiring — advances the
    // locked month pair when a keyboard move (PageUp/PageDown, Shift+PageUp/
    // PageDown, or an Arrow key) lands outside both currently visible months.
    const handleFocusDay = (d: Date) => {
      setHoverDate(d);
      if (!inLockedRange(d)) setViewMonth(d);
    };

    const navButton = (direction: "prev" | "next") => (
      <button
        type="button"
        aria-label={direction === "prev" ? "Previous month" : "Next month"}
        onClick={() => setViewMonth(addMonths(leftMonth, direction === "prev" ? -1 : 1))}
        className="p-1.5 rounded-kj-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {direction === "prev" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
        </svg>
      </button>
    );

    return (
      <div ref={ref} className={cn("flex gap-6 select-none", className)}>
        <div className="w-[280px]">
          <div className="flex items-center justify-between mb-2">
            {navButton("prev")}
            <span className="text-sm font-medium text-foreground">{monthLabelFormat.format(leftMonth)}</span>
            <span className="w-[26px]" aria-hidden="true" />
          </div>
          <CalendarGrid
            viewMonth={leftMonth}
            isDayDisabled={isDayDisabled}
            cellState={cellState}
            onSelectDay={handleSelectDay}
            onFocusDay={handleFocusDay}
            initialFocusDate={pendingStart ?? range.start ?? new Date()}
          />
        </div>
        <div className="w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <span className="w-[26px]" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{monthLabelFormat.format(rightMonth)}</span>
            {navButton("next")}
          </div>
          <CalendarGrid
            viewMonth={rightMonth}
            isDayDisabled={isDayDisabled}
            cellState={cellState}
            onSelectDay={handleSelectDay}
            onFocusDay={handleFocusDay}
            initialFocusDate={pendingStart ?? range.start ?? new Date()}
          />
        </div>
      </div>
    );
  }
);
RangeCalendar.displayName = "RangeCalendar";
```

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add this line after the `DatePicker` export block (end of file):

```ts
export { RangeCalendar, type RangeCalendarProps, type DateRange } from "./components/range-calendar";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- range-calendar`
Expected: PASS — all `RangeCalendar` tests green.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/range-calendar.tsx packages/ui/src/components/range-calendar.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add dual-month RangeCalendar with hover preview + keyboard nav

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `DateRangePicker` (trigger + panel wrapping `RangeCalendar`) + `DateRangePickerField`

**Files:**
- Create: `packages/ui/src/components/date-range-picker.tsx`
- Test: `packages/ui/src/components/date-range-picker.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Consumes: `RangeCalendar`, `DateRange` from Task 2 (`value`, `onChange`, `min`, `max`, `disabledDates` — `DateRangePicker` always renders `<RangeCalendar>` in controlled mode: `value={selected} onChange={handleRangeChange}`); `FormField` from `./form-field`.
- Produces: `DateRangePickerProps { value?: DateRange; defaultValue?: DateRange; onChange?: (range: DateRange) => void; min?: Date; max?: Date; disabledDates?: (date: Date) => boolean; placeholder?: string; disabled?: boolean; error?: boolean; required?: boolean; className?: string; id?: string; name?: string; "aria-describedby"?: string }`; `DateRangePicker` — `forwardRef<HTMLButtonElement, DateRangePickerProps>`; the ref points at the trigger button. `DateRangePickerFieldProps = Omit<DateRangePickerProps, "error"> & { label: string; hint?: string; error?: string }`; `DateRangePickerField` component.
- Escape handling covers both cases from day one (this is the fix that `DatePicker` needed a follow-up commit for): the trigger's own `onKeyDown` closes on Escape while focus is still on the trigger (the panel is a DOM sibling, not a descendant, and `RangeCalendar` never auto-focuses into a grid on open), and the panel's `onKeyDown` closes on Escape if focus has moved into a grid. Because `RangeCalendar` only mounts while `open` is true, closing the panel this way unmounts it — discarding any in-progress `pendingStart` pick automatically, satisfying the spec's "Escape reverts a partial pick" requirement with no extra API.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/date-range-picker.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangePicker, DateRangePickerField } from "./date-range-picker";

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

// DateRangePicker exposes no month/defaultMonth prop (matching DatePicker's own
// shape — it doesn't expose one either), so tests that need to click two
// distinct, deterministic days use the 1st and 2nd of the real current month
// rather than a fixed year/month. Every month has at least 28 days, so day 2
// always exists regardless of when the suite runs.
const base = new Date();
const day1 = new Date(base.getFullYear(), base.getMonth(), 1);
const day2 = new Date(base.getFullYear(), base.getMonth(), 2);

describe("DateRangePicker", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<DateRangePicker placeholder="Pick a date range" />);
    expect(screen.getByRole("button", { name: "Pick a date range" })).toBeInTheDocument();
  });

  it("opens the range calendar panel on trigger click", () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("grid")).toHaveLength(2);
  });

  it("completing a range closes the panel, updates the trigger, and fires onChange once", () => {
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) }));
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day2) }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: day1, end: day2 });
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    const expectedLabel = `${displayFormat.format(day1)} – ${displayFormat.format(day2)}`;
    expect(screen.getByRole("button", { name: expectedLabel })).toBeInTheDocument();
  });

  it("reflects a controlled value on the trigger", () => {
    render(<DateRangePicker value={{ start: day1, end: day2 }} onChange={() => {}} />);
    const expectedLabel = `${displayFormat.format(day1)} – ${displayFormat.format(day2)}`;
    expect(screen.getByRole("button", { name: expectedLabel })).toBeInTheDocument();
  });

  it("closes on Escape from the trigger without opening a grid first", () => {
    render(<DateRangePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    expect(trigger).toHaveFocus();
  });

  it("Escape during a partial (start-only) pick reverts it and closes without committing", () => {
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: "Pick a date range…" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) }));
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Pick a date range…" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pick a date range…" }));
    expect(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) })).toHaveAttribute("aria-selected", "false");
  });

  it("does not open when disabled", () => {
    render(<DateRangePicker disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
  });

  it("sets aria-invalid and aria-required on the trigger", () => {
    render(<DateRangePicker error required />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DateRangePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("DateRangePickerField", () => {
  it("associates the label with the trigger", () => {
    render(<DateRangePickerField label="Booking dates" />);
    expect(screen.getByLabelText("Booking dates")).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<DateRangePickerField label="Booking dates" hint="Choose your stay" />);
    const trigger = screen.getByLabelText("Booking dates");
    expect(screen.getByText("Choose your stay")).toBeInTheDocument();
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Choose your stay").id);
  });

  it("shows the error, hides the hint, and marks the trigger invalid", () => {
    render(<DateRangePickerField label="Booking dates" hint="Choose your stay" error="Required" />);
    const trigger = screen.getByLabelText("Booking dates");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Choose your stay")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DateRangePickerField label="Booking dates" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-range-picker`
Expected: FAIL — `Failed to resolve import "./date-range-picker"` (file does not exist yet).

- [ ] **Step 3: Implement `DateRangePicker`**

Create `packages/ui/src/components/date-range-picker.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { RangeCalendar, type DateRange } from "./range-calendar";

export interface DateRangePickerProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  /** Trigger text when nothing is selected. Default "Pick a date range…". */
  placeholder?: string;
  disabled?: boolean;
  /** Visual error state (red border + aria-invalid on the trigger). */
  error?: boolean;
  /** Marks the trigger aria-required (buttons have no native `required` attribute). */
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
}

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

// Local YYYY-MM-DD, not Date#toISOString() — that converts to UTC first and
// can shift the calendar date across a timezone boundary.
function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatRangeLabel(range: DateRange): string | undefined {
  if (!range.start || !range.end) return undefined;
  return `${displayFormat.format(range.start)} – ${displayFormat.format(range.end)}`;
}

export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      disabledDates,
      placeholder = "Pick a date range…",
      disabled = false,
      error = false,
      required = false,
      className,
      id,
      name,
      "aria-describedby": describedBy,
    },
    ref
  ) {
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<DateRange>(defaultValue ?? {});
    const selected = controlled ? value : internalValue;

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const commitValue = (r: DateRange) => {
      if (!controlled) setInternalValue(r);
      onChange?.(r);
    };

    const closePopup = React.useCallback(() => setOpen(false), []);
    const openPopup = () => {
      if (!disabled) setOpen(true);
    };

    const handleRangeChange = (r: DateRange) => {
      commitValue(r);
      closePopup();
      triggerRef.current?.focus();
    };

    // Outside-click dismissal.
    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) closePopup();
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open, closePopup]);

    const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopup();
      } else if (e.key === "Escape" && open) {
        // The panel is a DOM sibling of the trigger, not a descendant, and
        // RangeCalendar deliberately doesn't auto-focus into a grid on open.
        // So while focus remains on the trigger, a real Escape keydown never
        // bubbles into the panel's onKeyDown handler — it must be handled
        // here instead. Focus is already on the trigger, so no refocus needed.
        e.preventDefault();
        closePopup();
      }
    };

    const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
        triggerRef.current?.focus();
      }
    };

    const label = formatRangeLabel(selected);

    return (
      <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
        <button
          ref={setTriggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={error || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          onClick={() => (open ? closePopup() : openPopup())}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "w-full flex items-center justify-between gap-2 border rounded-kj-md bg-surface text-left text-sm",
            "pl-[0.85rem] pr-3 py-[calc(0.6rem*var(--kj-density,1))]",
            "transition-[border-color,box-shadow] duration-150",
            "focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/30",
            disabled && "bg-muted text-muted-foreground cursor-not-allowed",
            error ? "border-danger" : "border-input",
            !label && "text-muted-foreground"
          )}
        >
          <span>{label ?? placeholder}</span>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-muted-foreground shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18M8 2v4M16 2v4" />
          </svg>
        </button>
        {name && (
          <>
            <input type="hidden" name={`${name}Start`} value={selected.start ? toISODateString(selected.start) : ""} />
            <input type="hidden" name={`${name}End`} value={selected.end ? toISODateString(selected.end) : ""} />
          </>
        )}

        {open && (
          <div
            onKeyDown={onPanelKeyDown}
            className="absolute z-40 top-[calc(100%+6px)] left-0 bg-surface border border-border rounded-kj-md shadow-kj-lg p-3 animate-[kjpop_.12s_ease]"
          >
            <RangeCalendar value={selected} onChange={handleRangeChange} min={min} max={max} disabledDates={disabledDates} />
          </div>
        )}
      </div>
    );
  }
);
DateRangePicker.displayName = "DateRangePicker";

import { FormField } from "./form-field";

export interface DateRangePickerFieldProps extends Omit<DateRangePickerProps, "error"> {
  label: string;
  hint?: string;
  error?: string;
}

export const DateRangePickerField = React.forwardRef<HTMLButtonElement, DateRangePickerFieldProps>(
  function DateRangePickerField({ label, hint, error, required, className, ...props }, ref) {
    return (
      <FormField label={label} hint={hint} error={error} required={required} className={className}>
        <DateRangePicker ref={ref} error={!!error} {...props} />
      </FormField>
    );
  }
);
DateRangePickerField.displayName = "DateRangePickerField";
```

Note: `aria-haspopup="dialog"` here (not `"grid"` like `DatePicker`) because the panel contains two grids, not one — `"dialog"` is the correct ARIA value for a popup that isn't itself a single grid/listbox/etc. Update the test file's `DateRangePickerField` "associates the label" test to expect `"dialog"` (already written that way above) — do not change this to `"grid"` to match `DatePicker`; they're intentionally different.

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add this line after the `RangeCalendar` export added in Task 2:

```ts
export {
  DateRangePicker,
  DateRangePickerField,
  type DateRangePickerProps,
  type DateRangePickerFieldProps,
} from "./components/date-range-picker";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-range-picker`
Expected: PASS — all `DateRangePicker` and `DateRangePickerField` tests green.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/date-range-picker.tsx packages/ui/src/components/date-range-picker.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add DateRangePicker trigger + panel, DateRangePickerField wrapper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Stories, MCP data, site gallery, backlog, verification

**Files:**
- Create: `packages/ui/src/components/range-calendar.stories.tsx`
- Create: `packages/ui/src/components/date-range-picker.stories.tsx`
- Modify (generated): `packages/mcp/data/components.json` (via `npm run mcp:build`)
- Modify: `site/src/main.tsx`
- Modify: `docs/BACKLOG.md`

**Interfaces:**
- Consumes: `RangeCalendar`, `DateRange` from Task 2; `DateRangePicker`, `DateRangePickerField` from Task 3.

- [ ] **Step 1: Write the Storybook stories**

Create `packages/ui/src/components/range-calendar.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RangeCalendar } from "./range-calendar";
import type { DateRange } from "./range-calendar";

const meta = {
  title: "Forms/RangeCalendar",
  component: RangeCalendar,
  tags: ["autodocs"],
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return <RangeCalendar value={value} onChange={setValue} />;
  },
};

export const WithBounds: Story = {
  render: () => {
    const today = new Date();
    const [value, setValue] = React.useState<DateRange>({});
    const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
    return (
      <RangeCalendar
        value={value}
        onChange={setValue}
        min={min}
        max={max}
        disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
      />
    );
  },
};
```

Create `packages/ui/src/components/date-range-picker.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateRangePicker, DateRangePickerField } from "./date-range-picker";
import type { DateRange } from "./range-calendar";

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return (
      <div style={{ maxWidth: 280 }}>
        <DateRangePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <DateRangePicker error placeholder="Required field" />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [value, setValue] = React.useState<DateRange>({});
    return (
      <div style={{ maxWidth: 280 }}>
        <DateRangePickerField
          label="Booking dates"
          required
          hint="Weekends are disabled."
          value={value}
          onChange={setValue}
          disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
        />
      </div>
    );
  },
};
```

- [ ] **Step 2: Verify Storybook builds the stories**

Run: `npm run build-storybook`
Expected: build succeeds (no errors referencing `range-calendar.stories` or `date-range-picker.stories`).

- [ ] **Step 3: Regenerate the MCP component data**

Run: `npm run mcp:build`
Expected: succeeds and prints `Found N exported React components in index.ts.` (N includes `RangeCalendar`, `DateRangePicker`, and `DateRangePickerField`).

Verify the data now contains them:

Run: `node -e "const c=require('./packages/mcp/data/components.json'); console.log(c.map(x=>x.name).filter(n=>/RangeCalendar|DateRangePicker/.test(n)))"`
Expected: `[ 'RangeCalendar', 'DateRangePicker', 'DateRangePickerField' ]`

Note: the pre-existing MCP extractor (`packages/mcp/src/extractor.ts`) doesn't fully resolve intersection prop types (`Omit<X, K> & {...}`) — this is a known, out-of-scope issue already hit by `ComboboxFieldProps`/`DatePickerFieldProps` and will likely produce an incomplete prop list for `DateRangePickerFieldProps` too. Do not attempt to fix the extractor in this task; just confirm the three names above appear.

- [ ] **Step 4: Add a RangeCalendar/DateRangePicker demo to the site gallery**

In `site/src/main.tsx`:

1. Add the import. The site imports components from `"@kjaniec-dev/ui"` in one large named-import block; `Calendar,` and `DatePickerField,` currently sit at lines 72–73. Add these two lines into that same import block (placement within the block does not matter):

```tsx
  RangeCalendar,
  DateRangePickerField,
```

2. Add demo state. The `meetingDate`/`inlineDate` state (lines 354–355) looks like:

```tsx
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(undefined);
  const [inlineDate, setInlineDate] = React.useState<Date | undefined>(new Date());
```

Add directly below it:

```tsx
  const [bookingRange, setBookingRange] = React.useState<{ start?: Date; end?: Date }>({});
  const [inlineRange, setInlineRange] = React.useState<{ start?: Date; end?: Date }>({});
```

3. Register the components in the Forms section tabs. The Forms `<Sec>` opening tag's `components` array (around line 696) currently reads:

```tsx
components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "Calendar", "DatePicker", "DatePickerField", "FormField"]}
```

Change it to:

```tsx
components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "Calendar", "DatePicker", "DatePickerField", "RangeCalendar", "DateRangePicker", "DateRangePickerField", "FormField"]}
```

4. Add a demo `<Box>` inside the Forms `<Sec>`. The existing "DatePicker / Calendar" `<Box>` block ends immediately before the `</Sec>` that closes the Forms section (around line 833–834):

```tsx
            </Box>
          </Sec>
```

Insert a new `<Box>` between them:

```tsx
            </Box>
            <Box>
              <Sub>DateRangePicker / RangeCalendar</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <DateRangePickerField
                  label="Booking dates"
                  hint="Weekends are disabled."
                  value={bookingRange}
                  onChange={setBookingRange}
                  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
                />
              </div>
              <div className="mt-5">
                <Sub>RangeCalendar (standalone)</Sub>
                <RangeCalendar value={inlineRange} onChange={setInlineRange} />
              </div>
            </Box>
          </Sec>
```

- [ ] **Step 5: Verify the site builds and typechecks**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: no errors.

Run: `npm run build --workspace @kjaniec-dev/site`
Expected: build succeeds.

- [ ] **Step 6: Update the backlog**

In `docs/BACKLOG.md`, change:

```markdown
- [ ] `DateRangePicker` — deferred from the `DatePicker` work (2026-07-07 design doc); needs a dual-month grid and a start/end hover-preview interaction, distinct enough to warrant its own spec.
```

to:

```markdown
- [x] `DateRangePicker` — dual-month grid, locked navigation, hover preview, and `DateRangePickerField` wrapper shipped (2026-07-10 design doc).
```

- [ ] **Step 7: Full monorepo verification**

Run each and confirm success:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: all pass. `npm run test` includes the new `range-calendar` and `date-range-picker` suites, and the still-unmodified `calendar` suite.

- [ ] **Step 8: Visual/functional check in the running site**

Use the `verify` skill (or Playwright MCP) to drive the site:

1. Start the site: `npm run site:dev` (note the local URL).
2. Open the Forms section, scroll to "DateRangePicker / RangeCalendar".
3. Confirm: clicking the `DateRangePicker` trigger opens a dual-month panel with the current month on the left and next month on the right.
4. Click a start day, then hover over later days and confirm the range preview highlights between the start and the hovered day without committing anything.
5. Click an end day (in either month) and confirm the panel closes, the trigger updates to "start – end", and clicking Previous/Next (opening again) still shows the committed range highlighted across both months if visible.
6. Reopen, click a start day, then press Escape — confirm the panel closes without committing (trigger still shows the prior value or placeholder) and reopening shows no stray in-progress selection.
7. Confirm keyboard nav: focus the trigger, Enter to open, Arrow keys move within a grid, Enter selects; a second Enter (after moving focus) completes the range and closes with focus back on the trigger.
8. Confirm weekends render disabled (dimmed, unclickable) per `disabledDates` in the Field demo.
9. Confirm the standalone `RangeCalendar` demo updates its own state without any popup involved.
10. Toggle dark mode and confirm the header, both grids, range-highlight, endpoint, today, and disabled states all read correctly in both themes.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/range-calendar.stories.tsx packages/ui/src/components/date-range-picker.stories.tsx packages/mcp/data/components.json site/src/main.tsx docs/BACKLOG.md
git commit -m "feat(ui): showcase RangeCalendar/DateRangePicker in Storybook + site, regen MCP data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**

- Dual-month grid, locked navigation (left=N, right=N+1, single shared prev/next pair) → Task 2 (`RangeCalendar`'s single `navButton` pair, `rightMonth = addMonths(leftMonth, 1)`). ✓
- Hover preview between start and pending end, no commit → Task 2 (`hoverDate`/`previewEnd`, `onFocusDay`), tested. ✓
- Auto-commit + close on 2nd click, no footer → Task 2 (`handleSelectDay`), Task 3 (`handleRangeChange` closes the panel). ✓
- No presets, no Apply/Cancel, no Today/Clear → not implemented anywhere in Tasks 1–4. ✓
- `min`/`max`/`disabledDates` → Task 2 (`isDayDisabled`, shared by both grids), tested. ✓
- Value shape `{ start?: Date; end?: Date }` object, not tuple → `DateRange` in Task 2, used throughout Tasks 2–4. ✓
- Click/restart/hover semantics (3 bullet cases from the spec) → Task 2 (`handleSelectDay`'s three branches), each has a dedicated test. ✓
- Escape reverts an in-progress partial pick → Task 3 (unmounting `RangeCalendar` on close discards internal `pendingStart` for free), tested explicitly. ✓
- Each grid keeps independent roving tabindex, no cross-grid arrow traversal → Task 1 (`CalendarGrid` unchanged keyboard logic, reused verbatim per instance) + Task 2 (two independent `CalendarGrid` instances). ✓
- `aria-haspopup="dialog"` on the `DateRangePicker` trigger (distinct from `DatePicker`'s `"grid"`, since the panel holds two grids) → Task 3, called out explicitly, tested. ✓
- Form serialization via `${name}Start`/`${name}End` hidden inputs (not repeated-name like `Combobox`) → Task 3. ✓
- `disabledDates` blocks start/end anchors only, doesn't validate days between → Task 2 (`isDayDisabled` only gates `handleSelectDay`/keyboard `step`, never inspects the resulting committed range). ✓
- No responsive/stacked layout → Task 2 (`flex gap-6`, two fixed `w-[280px]` columns, no breakpoint classes). ✓
- `Calendar`'s public API/behavior unchanged post-refactor → Task 1, the entire task is gated on the pre-existing `calendar.test.tsx` passing unmodified. ✓
- `DateRangePickerField` mirroring `DatePickerField`'s `forwardRef` + `FormField` shape → Task 3. ✓
- Definition of done: components, stories, tests, barrel exports, MCP regen, site gallery, backlog update, verify → Task 4. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code; no "similar to Task N" shortcuts. ✓

**Type consistency:** `CalendarCellState`, `CalendarGridProps`, `CalendarGrid` (Task 1) → consumed identically by `Calendar` (Task 1) and `RangeCalendar` (Task 2). `DateRange`, `RangeCalendarProps`, `RangeCalendar` (Task 2) → consumed identically by `DateRangePicker`/`DateRangePickerFieldProps` (Task 3) and the stories/site (Task 4). Helper names (`startOfDay`, `isSameDay`, `addMonths`, `startOfMonth`, `monthLabelFormat`, etc.) match `calendar-internals.ts`'s exports everywhere they're imported across Tasks 1–2. `pendingStart`/`hoverDate` are internal to `RangeCalendar` only — never referenced from Task 3, consistent with the "unmount discards it" design noted in Task 3's Interfaces section. ✓

