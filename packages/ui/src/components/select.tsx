import * as React from "react";
import { cn } from "../lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const chevron =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E";

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, style, children, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "w-full appearance-none cursor-pointer font-sans text-sm text-foreground bg-surface",
        "border rounded-kj-md py-[calc(0.6rem*var(--kj-density,1))] pl-[0.85rem] pr-9",
        "transition-[border-color,box-shadow] duration-150",
        "focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/30",
        "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
        error ? "border-danger" : "border-input",
        className
      )}
      style={{
        backgroundImage: `url("${chevron}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "1rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
