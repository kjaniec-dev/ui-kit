import * as React from "react";
import { cn } from "../lib/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  tone?: "primary" | "secondary";
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, tone = "primary", ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500 ease-out",
            tone === "secondary" ? "bg-secondary" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
