import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
  icon?: React.ReactNode;
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    { className, title, value, trend, trendDirection = "neutral", description, icon, ...props },
    ref
  ) => {
    const trendColor = {
      up: "text-success bg-success-surface border-success/20",
      down: "text-danger bg-danger-surface border-danger/20",
      neutral: "text-muted-foreground bg-muted border-border/20",
    }[trendDirection];

    return (
      <Card ref={ref} className={cn("p-6", className)} {...props}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {title}
          </span>
          {icon && (
            <span className="text-muted-foreground shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
          )}
        </div>
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
          {trend && (
            <span
              className={cn("text-[0.75rem] font-bold px-2 py-0.5 rounded-full border", trendColor)}
            >
              {trend}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";
