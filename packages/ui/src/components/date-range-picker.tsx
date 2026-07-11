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
        // So a real Escape keydown while focus is on the trigger never
        // bubbles into the panel's onKeyDown handler — it must be handled
        // here instead. Refocus the trigger explicitly rather than assuming
        // it already has focus.
        e.preventDefault();
        closePopup();
        triggerRef.current?.focus();
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
