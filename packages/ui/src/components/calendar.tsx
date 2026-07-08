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
