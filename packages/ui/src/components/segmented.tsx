"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

/** Segmented control / single-select toggle group. Controlled. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ...props
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex gap-0.5 p-[3px] rounded-kj-md bg-muted", className)}
      {...props}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3.5 py-1.5 text-[0.82rem] font-semibold rounded-[calc(var(--kj-radius-md)-3px)] cursor-pointer transition-all duration-150",
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
