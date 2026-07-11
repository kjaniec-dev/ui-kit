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
