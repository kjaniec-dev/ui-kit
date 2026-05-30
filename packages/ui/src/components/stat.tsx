import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** e.g. "+12.3% mdm" */
  delta?: React.ReactNode;
  trend?: "up" | "down";
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, delta, trend, ...props }, ref) => (
    <Card ref={ref} className={cn("p-[1.35rem] flex flex-col gap-2", className)} {...props}>
      <span className="text-[0.78rem] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[2rem] font-bold tracking-[-0.03em] tabular-nums leading-none">
        {value}
      </span>
      {delta && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[0.8rem] font-semibold",
            trend === "down" ? "text-danger" : "text-success"
          )}
        >
          {trend === "down" ? "▼" : "▲"} {delta}
        </span>
      )}
    </Card>
  )
);
Stat.displayName = "Stat";
