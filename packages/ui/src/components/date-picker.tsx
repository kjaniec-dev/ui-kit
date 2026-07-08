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
      } else if (e.key === "Escape" && open) {
        // The panel is a DOM sibling of the trigger, not a descendant, and
        // the Calendar deliberately doesn't auto-focus into the grid on
        // open. So while focus remains on the trigger, a real Escape
        // keydown never bubbles into the panel's onKeyDown handler — it
        // must be handled here instead. Focus is already on the trigger,
        // so no refocus is needed.
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
