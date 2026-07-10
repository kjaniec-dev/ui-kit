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
