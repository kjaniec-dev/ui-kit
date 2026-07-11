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

    // CalendarGrid owns roving focus internally and only reports where it moved.
    // When a keyboard move (PageUp/PageDown/Shift+PageUp/PageDown, or Arrow keys
    // near a month boundary) lands outside the currently displayed month, this
    // is what advances the header/grid to follow it — mirrors the pre-refactor
    // Calendar's own `moveFocusTo`, which called `setViewMonth` directly.
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
