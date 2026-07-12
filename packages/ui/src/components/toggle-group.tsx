"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ToggleGroupOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface ToggleGroupProps<T extends string> {
  options: ToggleGroupOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}

/** Multi-select toggle row. Always controlled — each button's pressed state is independent. */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className,
  ...props
}: ToggleGroupProps<T>) {
  const toggle = (optionValue: T) => {
    if (disabled) return;
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  return (
    <div
      role="group"
      className={cn("inline-flex gap-0.5 p-[3px] rounded-kj-md bg-muted", className)}
      {...props}
    >
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={cn(
              "px-3.5 py-1.5 text-[0.82rem] font-semibold rounded-[calc(var(--kj-radius-md)-3px)] cursor-pointer transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-surface text-foreground shadow-kj-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
