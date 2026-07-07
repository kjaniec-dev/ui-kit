# DatePicker / Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `Calendar` grid primitive and a single-date `DatePicker` (button trigger + floating panel) to `@kjaniec-dev/ui`, plus a `DatePickerField` form wrapper, filling the P1 backlog gap for date picking.

**Architecture:** Two `"use client"` component files. `Calendar` (`calendar.tsx`) is a pure grid — no popover — using native `Date` + `Intl` (no new dependency), `role="grid"`/`row`/`gridcell` per the ARIA APG Date Picker Dialog pattern, and roving tabindex. `DatePicker` (`date-picker.tsx`) is a `forwardRef` trigger button + a hand-rolled floating panel wrapping `<Calendar>`, following the same self-contained-popup convention `Combobox`/`Select` already use (none of this kit's trigger components import the generic `Popover`). `DatePickerField` (same file) wraps `DatePicker` in `FormField`, mirroring `ComboboxField`/`SelectField` exactly.

**Tech Stack:** React 19, TypeScript, Tailwind (kj design tokens), native `Date` + `Intl.DateTimeFormat` (no date library), Vitest + `@testing-library/react`, Storybook, the MCP extractor (`npm run mcp:build`).

## Global Constraints

- Design-token classes only (no raw colors). Reuse existing tokens verified present in `packages/design/src/tailwind.css`: `border-input`, `border-danger`, `bg-surface`, `bg-muted`, `bg-primary`, `text-primary`, `text-primary-foreground`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-primary`, `ring-primary`, `shadow-kj-lg`, `rounded-kj-md`, `rounded-kj-sm`, `focus:ring-ring/30`, keyframe `animate-[kjpop_.12s_ease]`.
- Density-aware sizing via `var(--kj-density,1)` on the `DatePicker` trigger, matching `Select`/`Combobox`.
- Works in light and dark automatically (tokens handle it) — no theme-specific code.
- Tests import components directly (`from "./calendar"`, `from "./date-picker"`), matching `combobox.test.tsx`.
- All formatting/parsing uses `Intl.DateTimeFormat` — never hardcode locale-formatted strings in tests; build expected strings with the same `Intl.DateTimeFormat` call the component uses, so tests don't depend on the CI environment's default locale being `en-US`.
- Value type is a native `Date` object throughout (not an ISO string).
- Component files must start with `"use client";`.
- Do not introduce any new npm dependency.
- Commit after each task with a Conventional Commit message ending:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

---

## File Structure

- Create: `packages/ui/src/components/calendar.tsx` — `Calendar`.
- Create: `packages/ui/src/components/calendar.test.tsx` — Vitest suite.
- Create: `packages/ui/src/components/calendar.stories.tsx` — Storybook, `title: "Forms/Calendar"`.
- Create: `packages/ui/src/components/date-picker.tsx` — `DatePicker` + `DatePickerField`.
- Create: `packages/ui/src/components/date-picker.test.tsx` — Vitest suites.
- Create: `packages/ui/src/components/date-picker.stories.tsx` — Storybook, `title: "Forms/DatePicker"`.
- Modify: `packages/ui/src/index.ts` — barrel exports.
- Modify (generated): `packages/mcp/data/components.json` — via `npm run mcp:build`.
- Modify: `site/src/main.tsx` — gallery demo in the Forms section.
- Modify: `docs/BACKLOG.md` — check the `DatePicker`/`Calendar` item off; add a `DateRangePicker` follow-up line.

---

## Task 1: `Calendar` grid (month view, keyboard nav, min/max/disabledDates)

**Files:**
- Create: `packages/ui/src/components/calendar.tsx`
- Test: `packages/ui/src/components/calendar.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Produces: `CalendarProps { value?: Date; defaultValue?: Date; onChange?: (date: Date) => void; month?: Date; defaultMonth?: Date; onMonthChange?: (month: Date) => void; min?: Date; max?: Date; disabledDates?: (date: Date) => boolean; className?: string }`.
- Produces: `Calendar` — `forwardRef<HTMLDivElement, CalendarProps>`; the ref points at the outer container `div`.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/calendar.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar } from "./calendar";

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
const dayLabel = (y: number, m: number, d: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(y, m, d));

describe("Calendar", () => {
  it("renders the month label and 7 weekday headers", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByText(monthLabel(2026, 6))).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("renders a gridcell for every day in the month", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />); // July 2026 has 31 days
    expect(screen.getAllByRole("gridcell")).toHaveLength(31);
  });

  it("navigates to the next/previous month via header buttons", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(monthLabel(2026, 7))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText(monthLabel(2026, 5))).toBeInTheDocument();
  });

  it("selects a day on click and fires onChange", () => {
    const onChange = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 15));
  });

  it("marks the selected day aria-selected only after the value is set", () => {
    render(<Calendar value={new Date(2026, 6, 1)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "false");
  });

  it("disables days outside min/max and blocks selecting them", () => {
    const onChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2026, 6, 1)}
        min={new Date(2026, 6, 10)}
        max={new Date(2026, 6, 20)}
        onChange={onChange}
      />
    );
    const outOfRange = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) });
    expect(outOfRange).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(outOfRange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledDates predicate disables matching days", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} disabledDates={(d) => d.getDay() === 0} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-disabled", "true"); // July 5, 2026 is a Sunday
  });

  it("moves the roving tabindex with ArrowRight, Home, and End", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 8)} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 9) })).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(grid, { key: "Home" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(grid, { key: "End" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 11) })).toHaveAttribute("tabindex", "0");
  });

  it("selects the roving day on Enter", () => {
    const onChange = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 8)} onChange={onChange} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 9));
  });

  it("PageUp/PageDown move by a month; Shift+PageUp/PageDown move by a year", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 15)} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(screen.getByText(monthLabel(2026, 7))).toBeInTheDocument();
    fireEvent.keyDown(grid, { key: "PageDown", shiftKey: true });
    expect(screen.getByText(monthLabel(2027, 7))).toBeInTheDocument();
  });

  it("ArrowLeft skips a disabled day", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={new Date(2026, 6, 10)}
        disabledDates={(d) => d.getDate() === 9}
      />
    );
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("tabindex", "0");
  });

  it("reflects a controlled value and only updates after the parent re-renders", () => {
    const { rerender } = render(<Calendar value={new Date(2026, 6, 1)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "false");
    rerender(<Calendar value={new Date(2026, 6, 15)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "true");
  });

  it("forwards its ref to the outer container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Calendar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- calendar`
Expected: FAIL — `Failed to resolve import "./calendar"` (file does not exist yet).

- [ ] **Step 3: Implement `Calendar`**

Create `packages/ui/src/components/calendar.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

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

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
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

function addMonthsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear(), d.getMonth() + n, d.getDate());
}

function addYearsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear() + n, d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

function buildGridDays(viewMonth: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(viewMonth));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const monthLabelFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });
const weekdayShortFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const weekdayLongFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });

const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(startOfWeek(new Date()), i);
  return { key: i, short: weekdayShortFormat.format(d), long: weekdayLongFormat.format(d) };
});

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

    const gridDays = React.useMemo(() => buildGridDays(viewMonth), [viewMonth]);
    const inViewMonth = (d: Date) => d.getMonth() === viewMonth.getMonth() && d.getFullYear() === viewMonth.getFullYear();

    const [focusedDate, setFocusedDate] = React.useState<Date>(() => startOfDay(selected ?? new Date()));
    const pendingFocusRef = React.useRef(false);
    const gridRef = React.useRef<HTMLDivElement>(null);

    const rovingTarget =
      inViewMonth(focusedDate) && !isDayDisabled(focusedDate)
        ? focusedDate
        : gridDays.find((d) => inViewMonth(d) && !isDayDisabled(d)) ?? gridDays.find((d) => inViewMonth(d)) ?? gridDays[0];

    // Roving tabindex requires an imperative DOM .focus() call after the state
    // update that moved it — but only when the move came from a keyboard
    // handler in this grid, never on mount or on a value/month prop change
    // from outside (that would steal page focus unexpectedly).
    const moveFocusTo = (next: Date, viaKeyboard: boolean) => {
      pendingFocusRef.current = viaKeyboard;
      setFocusedDate(next);
      if (!inViewMonth(next)) setViewMonth(next);
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

    const commitValue = (d: Date) => {
      if (!controlled) setInternalValue(d);
      onChange?.(d);
    };

    const selectDay = (d: Date) => {
      if (isDayDisabled(d)) return;
      moveFocusTo(d, false);
      commitValue(d);
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
          // Explicit handling (not native button activation) keeps this
          // testable with fireEvent.keyDown, matching the rest of the kit's
          // test convention, and works identically in real browsers since
          // preventDefault() on keydown suppresses the native activation.
          e.preventDefault();
          selectDay(rovingTarget);
          break;
      }
    };

    const today = new Date();

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
                const isSelected = selected ? isSameDay(day, selected) : false;
                const isToday = isSameDay(day, today);
                const isRoving = isSameDay(day, rovingTarget);
                return (
                  <button
                    key={dateKey(day)}
                    type="button"
                    role="gridcell"
                    data-date={dateKey(day)}
                    tabIndex={isRoving ? 0 : -1}
                    aria-selected={isSelected}
                    aria-disabled={disabled || undefined}
                    aria-label={fullDateFormat.format(day)}
                    onClick={() => selectDay(day)}
                    className={cn(
                      "h-9 w-9 mx-auto flex items-center justify-center rounded-full text-sm",
                      "focus:outline-none focus:ring-[3px] focus:ring-ring/30",
                      disabled && "text-muted-foreground opacity-40 cursor-not-allowed",
                      !disabled && isSelected && "bg-primary text-primary-foreground",
                      !disabled && !isSelected && isToday && "ring-1 ring-primary text-primary font-medium",
                      !disabled && !isSelected && !isToday && "text-foreground hover:bg-muted"
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
  }
);
Calendar.displayName = "Calendar";
```

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add this line after the `Combobox` export block (end of file):

```ts
export { Calendar, type CalendarProps } from "./components/calendar";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- calendar`
Expected: PASS — all `Calendar` tests green.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/calendar.tsx packages/ui/src/components/calendar.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add standalone Calendar grid with keyboard nav + min/max/disabledDates

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `DatePicker` (trigger + floating panel wrapping `Calendar`)

**Files:**
- Create: `packages/ui/src/components/date-picker.tsx`
- Test: `packages/ui/src/components/date-picker.test.tsx`
- Modify: `packages/ui/src/index.ts` (add barrel export)

**Interfaces:**
- Consumes: `Calendar`, `CalendarProps` from Task 1 (`value`, `onChange`, `min`, `max`, `disabledDates` — `DatePicker` always renders `<Calendar>` in controlled mode: `value={selected} onChange={handleCalendarChange}`).
- Produces: `DatePickerProps { value?: Date; defaultValue?: Date; onChange?: (date: Date) => void; min?: Date; max?: Date; disabledDates?: (date: Date) => boolean; placeholder?: string; disabled?: boolean; error?: boolean; required?: boolean; className?: string; id?: string; name?: string; "aria-describedby"?: string }`.
- Produces: `DatePicker` — `forwardRef<HTMLButtonElement, DatePickerProps>`; the ref points at the trigger button.

- [ ] **Step 1: Write the failing test file**

Create `packages/ui/src/components/date-picker.test.tsx`:

```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker } from "./date-picker";

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

describe("DatePicker", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  });

  it("opens the calendar panel on trigger click", () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selecting a day closes the panel, updates the trigger, and fires onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const today = new Date();
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(today) }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: displayFormat.format(today) })).toBeInTheDocument();
  });

  it("reflects a controlled value on the trigger", () => {
    render(<DatePicker value={new Date(2026, 6, 15)} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: displayFormat.format(new Date(2026, 6, 15)) })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<DatePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("does not open when disabled", () => {
    render(<DatePicker disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("sets aria-invalid and aria-required on the trigger", () => {
    render(<DatePicker error required />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-picker`
Expected: FAIL — `Failed to resolve import "./date-picker"` (file does not exist yet).

- [ ] **Step 3: Implement `DatePicker`**

Create `packages/ui/src/components/date-picker.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { Calendar } from "./calendar";

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabledDates?: (date: Date) => boolean;
  /** Trigger text when nothing is selected. Default "Pick a date…". */
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

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      defaultValue,
      onChange,
      min,
      max,
      disabledDates,
      placeholder = "Pick a date…",
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
    const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
    const selected = controlled ? value : internalValue;

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const commitValue = (d: Date) => {
      if (!controlled) setInternalValue(d);
      onChange?.(d);
    };

    const closePopup = React.useCallback(() => setOpen(false), []);
    const openPopup = () => {
      if (!disabled) setOpen(true);
    };

    const handleCalendarChange = (d: Date) => {
      commitValue(d);
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
      }
    };

    const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePopup();
        triggerRef.current?.focus();
      }
    };

    return (
      <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
        <button
          ref={setTriggerRef}
          type="button"
          id={id}
          disabled={disabled}
          aria-haspopup="grid"
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
            !selected && "text-muted-foreground"
          )}
        >
          <span>{selected ? displayFormat.format(selected) : placeholder}</span>
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
        {name && <input type="hidden" name={name} value={selected ? toISODateString(selected) : ""} />}

        {open && (
          <div
            onKeyDown={onPanelKeyDown}
            className="absolute z-40 top-[calc(100%+6px)] left-0 bg-surface border border-border rounded-kj-md shadow-kj-lg p-3 animate-[kjpop_.12s_ease]"
          >
            <Calendar value={selected} onChange={handleCalendarChange} min={min} max={max} disabledDates={disabledDates} />
          </div>
        )}
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";
```

- [ ] **Step 4: Add the barrel export**

In `packages/ui/src/index.ts`, add this line after the `Calendar` export added in Task 1:

```ts
export { DatePicker, type DatePickerProps } from "./components/date-picker";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-picker`
Expected: PASS — all `DatePicker` tests green.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/date-picker.tsx packages/ui/src/components/date-picker.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add DatePicker trigger + floating panel wrapping Calendar

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: `DatePickerField` wrapper

**Files:**
- Modify: `packages/ui/src/components/date-picker.tsx` (append `DatePickerField` + types)
- Modify: `packages/ui/src/index.ts` (extend the DatePicker export)
- Test: `packages/ui/src/components/date-picker.test.tsx` (append a `DatePickerField` suite)

**Interfaces:**
- Consumes: `DatePicker`, `DatePickerProps` from Task 2; `FormField` from `./form-field` (it clones its single child, injecting `id`, `aria-describedby`, `aria-invalid`, and `required` — `DatePicker` already applies `id`/`aria-describedby`/`aria-required` on the trigger, so `DatePickerField` does not need to re-forward `required` manually; `FormField`'s `cloneElement` sets it directly on the `<DatePicker>` element).
- Produces: `DatePickerFieldProps = Omit<DatePickerProps, "error"> & { label: string; hint?: string; error?: string }`; `DatePickerField` component.

- [ ] **Step 1: Write the failing DatePickerField tests**

Append to `packages/ui/src/components/date-picker.test.tsx`. First update the import line at the top of the file from:

```tsx
import { DatePicker } from "./date-picker";
```

to:

```tsx
import { DatePicker, DatePickerField } from "./date-picker";
```

Then append:

```tsx
describe("DatePickerField", () => {
  it("associates the label with the trigger", () => {
    render(<DatePickerField label="Due date" />);
    expect(screen.getByLabelText("Due date")).toHaveAttribute("aria-haspopup", "grid");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<DatePickerField label="Due date" hint="Choose a weekday" />);
    const trigger = screen.getByLabelText("Due date");
    expect(screen.getByText("Choose a weekday")).toBeInTheDocument();
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Choose a weekday").id);
  });

  it("shows the error, hides the hint, and marks the trigger invalid", () => {
    render(<DatePickerField label="Due date" hint="Choose a weekday" error="Required" />);
    const trigger = screen.getByLabelText("Due date");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Choose a weekday")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Required").id);
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePickerField label="Due date" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-picker`
Expected: FAIL — `DatePickerField` is not exported from `./date-picker`.

- [ ] **Step 3: Append `DatePickerField` to `date-picker.tsx`**

Add to the **end** of `packages/ui/src/components/date-picker.tsx` (after `DatePicker.displayName = "DatePicker";`):

```tsx
import { FormField } from "./form-field";

export interface DatePickerFieldProps extends Omit<DatePickerProps, "error"> {
  label: string;
  hint?: string;
  error?: string;
}

export const DatePickerField = React.forwardRef<HTMLButtonElement, DatePickerFieldProps>(
  function DatePickerField({ label, hint, error, required, className, ...props }, ref) {
    return (
      <FormField label={label} hint={hint} error={error} required={required} className={className}>
        <DatePicker ref={ref} error={!!error} {...props} />
      </FormField>
    );
  }
);
DatePickerField.displayName = "DatePickerField";
```

- [ ] **Step 4: Extend the barrel export**

In `packages/ui/src/index.ts`, replace the `DatePicker` export line from Task 2:

```ts
export { DatePicker, type DatePickerProps } from "./components/date-picker";
```

with:

```ts
export {
  DatePicker,
  DatePickerField,
  type DatePickerProps,
  type DatePickerFieldProps,
} from "./components/date-picker";
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run test --workspace @kjaniec-dev/ui -- date-picker`
Expected: PASS — both `DatePicker` and `DatePickerField` suites green.

If `getByLabelText("Due date")` fails to resolve the trigger (label→button association), fall back to asserting on the element with the injected id: query `screen.getByText("Due date")` (the `<label>`), read its `htmlFor`, and assert `document.getElementById(htmlFor)` has `aria-haspopup="grid"`. Do not change component behavior to make the test pass.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/components/date-picker.tsx packages/ui/src/components/date-picker.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add DatePickerField wrapper (label/hint/error)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Stories, MCP data, site gallery, backlog, verification

**Files:**
- Create: `packages/ui/src/components/calendar.stories.tsx`
- Create: `packages/ui/src/components/date-picker.stories.tsx`
- Modify (generated): `packages/mcp/data/components.json` (via `npm run mcp:build`)
- Modify: `site/src/main.tsx`
- Modify: `docs/BACKLOG.md`

**Interfaces:**
- Consumes: `Calendar` from Task 1; `DatePicker`, `DatePickerField` from Tasks 2–3.

- [ ] **Step 1: Write the Storybook stories**

Create `packages/ui/src/components/calendar.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./calendar";

const meta = {
  title: "Forms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(new Date());
    return <Calendar value={value} onChange={setValue} />;
  },
};

export const WithBounds: Story = {
  render: () => {
    const today = new Date();
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const max = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return (
      <Calendar
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

Create `packages/ui/src/components/date-picker.stories.tsx`:

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker, DatePickerField } from "./date-picker";

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <DatePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 280 }}>
      <DatePicker error placeholder="Required field" />
    </div>
  ),
};

export const Field: Story = {
  render: () => {
    const [value, setValue] = React.useState<Date | undefined>(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <DatePickerField label="Due date" required hint="Weekdays only." value={value} onChange={setValue} disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6} />
      </div>
    );
  },
};
```

- [ ] **Step 2: Verify Storybook builds the stories**

Run: `npm run build-storybook`
Expected: build succeeds (no errors referencing `calendar.stories` or `date-picker.stories`).

- [ ] **Step 3: Regenerate the MCP component data**

Run: `npm run mcp:build`
Expected: succeeds and prints `Found N exported React components in index.ts.` (N includes `Calendar`, `DatePicker`, and `DatePickerField`).

Verify the data now contains them:

Run: `node -e "const c=require('./packages/mcp/data/components.json'); console.log(c.map(x=>x.name).filter(n=>/Calendar|DatePicker/.test(n)))"`
Expected: `[ 'Calendar', 'DatePicker', 'DatePickerField' ]`

Note: the pre-existing MCP extractor (`packages/mcp/src/extractor.ts`) doesn't fully resolve intersection prop types (`Omit<X, K> & {...}`) — this is a known, out-of-scope issue already hit by `ComboboxFieldProps` and will likely produce an incomplete prop list for `DatePickerFieldProps` too. Do not attempt to fix the extractor in this task; just confirm the three names above appear.

- [ ] **Step 4: Add a Calendar/DatePicker demo to the site gallery**

In `site/src/main.tsx`:

1. Add the import. The site imports components from `"@kjaniec-dev/ui"` in one large named-import block (`ComboboxField,` is around line 70). Add these three lines into that import block (placement within the block does not matter):

```tsx
  Calendar,
  DatePicker,
  DatePickerField,
```

2. Add demo state. Find the `frameworkOptions` array declared after `const [stack, setStack] = React.useState<string[]>(["next"]);` (around line 344–351) and add directly below its closing `];`:

```tsx
  const [meetingDate, setMeetingDate] = React.useState<Date | undefined>(undefined);
  const [inlineDate, setInlineDate] = React.useState<Date | undefined>(new Date());
```

3. Register the components in the Forms section tabs. Change the Forms `<Sec ...>` opening tag (around line 692) `components` array from:

```tsx
components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "FormField"]}
```

to:

```tsx
components={["Input", "TextField", "Textarea", "Select", "SelectField", "Combobox", "ComboboxField", "Calendar", "DatePicker", "DatePickerField", "FormField"]}
```

4. Add a demo `<Box>` inside the Forms `<Sec>`. Find the `<Sub>Combobox (searchable select)</Sub>` block, locate its closing `</Box>` (immediately before the `</Sec>` that ends the Forms section, around line 813), and insert immediately after it, before `</Sec>`:

```tsx
            <Box>
              <Sub>DatePicker / Calendar</Sub>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
                <DatePickerField
                  label="Meeting date"
                  hint="Weekends are disabled."
                  value={meetingDate}
                  onChange={setMeetingDate}
                  disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
                />
                <div>
                  <Sub>Calendar (standalone)</Sub>
                  <Calendar value={inlineDate} onChange={setInlineDate} />
                </div>
              </div>
            </Box>
```

- [ ] **Step 5: Verify the site builds and typechecks**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: no errors.

Run: `npm run build --workspace @kjaniec-dev/site`
Expected: build succeeds.

- [ ] **Step 6: Update the backlog**

In `docs/BACKLOG.md`, change:

```markdown
- [ ] `DatePicker` / `Calendar` / `DateRangePicker` — `TableToolbar`/README mention date filters, but there's no real date-picking component yet.
```

to:

```markdown
- [x] `DatePicker` / `Calendar` — `TableToolbar`/README mention date filters; single-date picker + standalone calendar grid shipped.
- [ ] `DateRangePicker` — deferred from the `DatePicker` work (2026-07-07 design doc); needs a dual-month grid and a start/end hover-preview interaction, distinct enough to warrant its own spec.
```

- [ ] **Step 7: Full monorepo verification**

Run each and confirm success:

```bash
npm run typecheck
npm run test
npm run build
```

Expected: all pass. `npm run test` includes the new `calendar` and `date-picker` suites.

- [ ] **Step 8: Visual/functional check in the running site**

Use the `verify` skill (or Playwright MCP) to drive the site:

1. Start the site: `npm run site:dev` (note the local URL).
2. Open the Forms section, scroll to "DatePicker / Calendar".
3. Confirm: clicking the `DatePicker` trigger opens the calendar panel; the current month shows with today marked; clicking an enabled day selects it, closes the panel, and updates the trigger text; weekends render disabled (dimmed, unclickable) per `disabledDates`.
4. Confirm keyboard nav: focus the trigger, press Enter to open, use Arrow keys to move within the grid, press Enter on a day to select it and close the panel with focus returning to the trigger. Press Escape while open to close without selecting.
5. Confirm the standalone `Calendar` demo updates its own state on click without any popup involved.
6. Toggle dark mode and confirm the header, grid, selected/today/disabled states all read correctly in both themes.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/components/calendar.stories.tsx packages/ui/src/components/date-picker.stories.tsx packages/mcp/data/components.json site/src/main.tsx docs/BACKLOG.md
git commit -m "feat(ui): showcase Calendar/DatePicker in Storybook + site, regen MCP data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**

- Single-date selection only, no range → Tasks 1–3 (`Date | undefined`, no array/tuple anywhere). ✓
- Button-only trigger, no typed entry → Task 2 (`DatePicker`'s trigger is a `<button>`, no `<input>`). ✓
- `min`/`max`/`disabledDates` with keyboard skip-over → Task 1 (`isDayDisabled`, `step`). ✓
- No footer Today/Clear buttons; today shown via a ring marker only → Task 1 (`isToday` ring class, no footer JSX). ✓
- Native `Date` value type → Tasks 1–3 (`CalendarProps`/`DatePickerProps` all use `Date`, not string). ✓
- Standalone `Calendar` + `DatePicker` wraps it in a popover → Task 1 (standalone, own stories) + Task 2 (`<Calendar>` nested inside `DatePicker`'s panel). ✓
- `role="grid"`/`row`/`gridcell`, roving tabindex, full keyboard matrix (arrows, Home/End, PageUp/PageDown, Shift+PageUp/PageDown) → Task 1. ✓
- `Intl.DateTimeFormat` formatting, no new dependency → Tasks 1–2 (`monthLabelFormat`, `fullDateFormat`, `displayFormat`). ✓
- `DatePickerField` mirroring `ComboboxField`'s `forwardRef` + `FormField` shape → Task 3. ✓
- Controlled + uncontrolled for both selection and view-month → Task 1 (`controlled`/`internalValue`, `monthControlled`/`internalMonth`), tested. ✓
- Local (non-UTC) date-string serialization for the hidden form input → Task 2 (`toISODateString`, explicit comment on why not `toISOString()`). ✓
- Non-goals (range, typed entry, footer buttons, locale/calendar-system switching) → not implemented anywhere in Tasks 1–4. ✓
- Definition of done: components, stories, tests, barrel exports, MCP regen, site gallery, backlog update, verify → Task 4. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code. ✓

**Type consistency:** `CalendarProps`, `DatePickerProps`, `DatePickerFieldProps`, `Calendar`, `DatePicker`, `DatePickerField`, and helpers (`startOfDay`, `isSameDay`, `addDays`, `addMonths`, `addMonthsClamped`, `addYearsClamped`, `startOfMonth`, `startOfWeek`, `buildGridDays`, `dateKey`, `isDayDisabled`, `commitValue`, `selectDay`, `moveFocusTo`, `step`, `toISODateString`) are named identically everywhere they're used across Tasks 1–3. `DatePicker` always drives `<Calendar>` in controlled mode (`value`/`onChange` both passed), so `Calendar`'s own uncontrolled path is only exercised by its standalone tests/stories — verified both modes are tested in Task 1. ✓
