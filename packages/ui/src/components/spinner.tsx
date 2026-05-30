import * as React from "react";
import { cn } from "../lib/cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Diameter in px. Default 24. */
  size?: number;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = 24, style, ...props }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-[2.5px] border-muted border-t-primary animate-spin align-middle",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";
