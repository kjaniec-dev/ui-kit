"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxBaseProps {
  options: ComboboxOption[];
  /** Trigger text when nothing is selected. Default "Select…". */
  placeholder?: string;
  /** Search input placeholder inside the popup. Default "Search…". */
  searchPlaceholder?: string;
  /** Shown when the filter matches no options. Default "No results". */
  emptyMessage?: string;
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

export type ComboboxProps =
  | (ComboboxBaseProps & {
      multiple?: false;
      value?: string;
      defaultValue?: string;
      onChange?: (value: string) => void;
    })
  | (ComboboxBaseProps & {
      multiple: true;
      value?: string[];
      defaultValue?: string[];
      onChange?: (value: string[]) => void;
    });

// Internal selection is always an array; single mode holds at most one entry.
function toArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(props, ref) {
    const {
      options,
      placeholder = "Select…",
      searchPlaceholder = "Search…",
      emptyMessage = "No results",
      disabled = false,
      error = false,
      required = false,
      className,
      id,
      name,
      "aria-describedby": describedBy,
    } = props;
    const multiple = props.multiple ?? false;

    const reactId = React.useId();
    const baseId = id ?? reactId;
    const listId = `${baseId}-listbox`;
    const optionId = (i: number) => `${baseId}-opt-${i}`;

    const controlled = props.value !== undefined;
    const [internal, setInternal] = React.useState<string[]>(() => toArray(props.defaultValue));
    const selected = controlled ? toArray(props.value) : internal;

    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [activeIndex, setActiveIndex] = React.useState(0);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);

    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const filtered = React.useMemo(() => {
      const q = search.trim().toLowerCase();
      return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    }, [search, options]);

    const firstEnabled = React.useCallback(() => {
      const i = filtered.findIndex((o) => !o.disabled);
      return i === -1 ? 0 : i;
    }, [filtered]);

    const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v;

    const emit = (next: string[]) => {
      if (!controlled) setInternal(next);
      if (props.multiple) {
        props.onChange?.(next);
      } else {
        props.onChange?.(next[0] ?? "");
      }
    };

    const closePopup = React.useCallback(() => {
      setOpen(false);
      setSearch("");
    }, []);

    const openPopup = () => {
      if (!disabled) setOpen(true);
    };

    const handleSelect = (opt: ComboboxOption) => {
      if (opt.disabled) return;
      if (multiple) {
        const next = selected.includes(opt.value)
          ? selected.filter((v) => v !== opt.value)
          : [...selected, opt.value];
        emit(next);
        inputRef.current?.focus();
      } else {
        emit([opt.value]);
        closePopup();
        triggerRef.current?.focus();
      }
    };

    const removeValue = (value: string) => {
      emit(selected.filter((v) => v !== value));
    };

    // Reset the active option to the first enabled row on open / filter change.
    React.useEffect(() => {
      if (open) setActiveIndex(firstEnabled());
    }, [open, firstEnabled]);

    // Autofocus the search input when the popup opens.
    React.useEffect(() => {
      if (open) inputRef.current?.focus();
    }, [open]);

    // Outside-click dismissal.
    React.useEffect(() => {
      if (!open) return;
      const onDown = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) closePopup();
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open, closePopup]);

    // Keep the active option scrolled into view.
    React.useEffect(() => {
      const el = listRef.current?.querySelector('[data-active="true"]') as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    const moveActive = (dir: 1 | -1) => {
      if (filtered.length === 0) return;
      setActiveIndex((prev) => {
        let i = prev;
        for (let step = 0; step < filtered.length; step++) {
          i = (i + dir + filtered.length) % filtered.length;
          if (!filtered[i]?.disabled) return i;
        }
        return prev;
      });
    };

    const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          moveActive(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveActive(-1);
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(firstEnabled());
          break;
        case "End":
          e.preventDefault();
          for (let i = filtered.length - 1; i >= 0; i--) {
            if (!filtered[i].disabled) {
              setActiveIndex(i);
              break;
            }
          }
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[activeIndex]) handleSelect(filtered[activeIndex]);
          break;
        case "Escape":
          e.preventDefault();
          closePopup();
          triggerRef.current?.focus();
          break;
        case "Backspace":
          if (multiple && search === "" && selected.length > 0) {
            removeValue(selected[selected.length - 1]);
          }
          break;
      }
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPopup();
      }
    };

    const showPlaceholder = multiple ? selected.length === 0 : !selected[0];

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <div
          className={cn(
            "relative flex w-full items-center gap-1.5 flex-wrap border rounded-kj-md bg-surface",
            "pl-[0.85rem] pr-9 py-[calc(0.45rem*var(--kj-density,1))] min-h-[calc(2.5rem*var(--kj-density,1))]",
            "transition-[border-color,box-shadow] duration-150",
            "focus-within:outline-none focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30",
            disabled && "bg-muted cursor-not-allowed",
            error ? "border-danger" : "border-input"
          )}
        >
          {multiple &&
            selected.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 rounded-kj-sm bg-primary/10 text-primary text-xs font-medium pl-2 pr-1 py-0.5"
              >
                {labelFor(value)}
                <button
                  type="button"
                  aria-label={`Remove ${labelFor(value)}`}
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(value);
                  }}
                  className="rounded-full p-0.5 leading-none hover:bg-primary/20"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </span>
            ))}
          <button
            ref={setTriggerRef}
            type="button"
            id={id}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open && filtered.length > 0 ? listId : undefined}
            aria-invalid={error || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            onClick={() => (open ? closePopup() : openPopup())}
            onKeyDown={onTriggerKeyDown}
            className={cn(
              "flex-1 min-w-[60px] text-left bg-transparent border-none outline-none cursor-pointer text-sm disabled:cursor-not-allowed",
              showPlaceholder && "text-muted-foreground"
            )}
          >
            {multiple
              ? selected.length === 0
                ? placeholder
                : ""
              : (selected[0] ? labelFor(selected[0]) : "") || placeholder}
          </button>
          {name && multiple &&
            selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
          {name && !multiple && (
            <input type="hidden" name={name} value={selected[0] ?? ""} />
          )}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        {open && (
          <div className="absolute z-40 top-[calc(100%+6px)] left-0 w-full min-w-[12rem] bg-surface border border-border rounded-kj-md shadow-kj-lg overflow-hidden animate-[kjpop_.12s_ease]">
            <div className="p-2 border-b border-border">
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls={filtered.length > 0 ? listId : undefined}
                aria-activedescendant={filtered[activeIndex] ? optionId(activeIndex) : undefined}
                aria-label={searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onInputKeyDown}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none px-2 py-1"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
            ) : (
              <div
                ref={listRef}
                id={listId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                aria-label={placeholder}
                className="max-h-60 overflow-y-auto p-1"
              >
                {filtered.map((opt, i) => {
                  const isSelected = selected.includes(opt.value);
                  const isActive = i === activeIndex;
                  return (
                    <div
                      key={opt.value}
                      id={optionId(i)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled || undefined}
                      data-active={isActive || undefined}
                      onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                      onClick={() => handleSelect(opt)}
                      className={cn(
                        "flex items-center justify-between gap-2 px-3 py-2 rounded-kj-sm text-sm cursor-pointer select-none",
                        opt.disabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                        !opt.disabled && isActive && "bg-primary/10 text-primary",
                        !opt.disabled && !isActive && "text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
Combobox.displayName = "Combobox";

// Distributive omit preserves the discriminated union (plain Omit<Union, K>
// collapses it to the shared keys and drops the `multiple` narrowing).
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ComboboxFieldProps = DistributiveOmit<ComboboxProps, "error"> & {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

import { FormField } from "./form-field";

export const ComboboxField = React.forwardRef<HTMLButtonElement, ComboboxFieldProps>(
  function ComboboxField({ label, hint, error, required, className, ...props }, ref) {
    return (
      <FormField label={label} hint={hint} error={error} required={required} className={className}>
        <Combobox ref={ref} error={!!error} {...props} />
      </FormField>
    );
  }
);
ComboboxField.displayName = "ComboboxField";
