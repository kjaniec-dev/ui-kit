"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer text-sm select-none",
          className
        )}
      >
        <input ref={ref} id={inputId} type="checkbox" className="peer sr-only" {...props} />
        <span className="grid place-items-center h-[1.15rem] w-[1.15rem] shrink-0 rounded-[0.4rem] border-[1.5px] border-input bg-surface transition-all duration-150 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/35 peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-3 text-primary-foreground opacity-0 scale-50 transition-all duration-150"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-2.5 cursor-pointer text-sm select-none",
          className
        )}
      >
        <input ref={ref} id={inputId} type="radio" className="peer sr-only" {...props} />
        <span className="grid place-items-center h-[1.15rem] w-[1.15rem] shrink-0 rounded-full border-[1.5px] border-input bg-surface transition-all duration-150 peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/35 peer-checked:[&>span]:opacity-100 peer-checked:[&>span]:scale-100">
          <span className="h-2 w-2 rounded-full bg-primary-foreground opacity-0 scale-[0.4] transition-all duration-150" />
        </span>
        {label}
      </label>
    );
  }
);
Radio.displayName = "Radio";

import { Hint } from "./field";

export interface CheckboxFieldProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  label: React.ReactNode;
  hint?: string;
  error?: string;
}

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    const id = React.useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    return (
      <div className={cn("flex flex-col gap-1 w-full", className)}>
        <Checkbox
          ref={ref}
          id={id}
          label={label}
          aria-describedby={cn(hint && hintId, error && errorId) || undefined}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {hint && !error && (
          <Hint id={hintId} className="pl-[1.8rem]">
            {hint}
          </Hint>
        )}
        {error && (
          <Hint id={errorId} error className="pl-[1.8rem]">
            {error}
          </Hint>
        )}
      </div>
    );
  }
);
CheckboxField.displayName = "CheckboxField";
