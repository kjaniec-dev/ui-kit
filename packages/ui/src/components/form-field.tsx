import * as React from "react";
import { cn } from "../lib/cn";
import { Label, Hint } from "./field";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, hint, error, required, children, ...props }, ref) => {
    const id = React.useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const child = React.Children.only(children) as React.ReactElement;
    const clonedChild = React.cloneElement(child, {
      id: child.props.id ?? id,
      "aria-describedby": cn(
        hint && hintId,
        error && errorId,
        child.props["aria-describedby"]
      ) || undefined,
      "aria-invalid": error ? "true" : undefined,
      required: child.props.required ?? required,
    });

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {clonedChild}
        {hint && !error && <Hint id={hintId}>{hint}</Hint>}
        {error && (
          <Hint id={errorId} error>
            {error}
          </Hint>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";
