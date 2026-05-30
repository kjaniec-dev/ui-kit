import * as React from "react";
import { cn } from "../lib/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Append a red required marker. */
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label ref={ref} className={cn("text-[0.8rem] font-semibold text-foreground", className)} {...props}>
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  )
);
Label.displayName = "Label";

export interface HintProps extends React.HTMLAttributes<HTMLSpanElement> {
  error?: boolean;
}

export const Hint = React.forwardRef<HTMLSpanElement, HintProps>(
  ({ className, error, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("text-[0.76rem]", error ? "text-danger" : "text-muted-foreground", className)}
      {...props}
    />
  )
);
Hint.displayName = "Hint";

/** Vertical label + control + hint group. */
export const Field = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  )
);
Field.displayName = "Field";
