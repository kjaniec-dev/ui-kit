import * as React from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual error state (red border + ring). */
  error?: boolean;
  /** Icon shown inside the field, leading edge. */
  leadingIcon?: React.ReactNode;
}

const baseField =
  "w-full font-sans text-sm text-foreground bg-surface border rounded-kj-md px-[0.85rem] " +
  "transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground " +
  "focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/30 " +
  "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leadingIcon, style, ...props }, ref) => {
    const field = (
      <input
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          baseField,
          "py-[calc(0.6rem*var(--kj-density,1))]",
          error
            ? "border-danger focus:border-danger focus:ring-danger/25"
            : "border-input",
          leadingIcon && "pl-[2.3rem]",
          className
        )}
        {...props}
      />
    );
    if (!leadingIcon) return field;
    return (
      <span className="relative flex items-center">
        <span className="absolute left-[0.8rem] text-muted-foreground [&_svg]:h-[1.05rem] [&_svg]:w-[1.05rem] pointer-events-none">
          {leadingIcon}
        </span>
        {field}
      </span>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        baseField,
        "py-[calc(0.6rem*var(--kj-density,1))] min-h-[84px] leading-relaxed resize-y",
        error ? "border-danger focus:border-danger focus:ring-danger/25" : "border-input",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
