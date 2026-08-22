import * as React from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  animation?: "shimmer" | "pulse" | "none";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant = "rectangular", animation = "shimmer", width, height, style, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "bg-muted-foreground/15 dark:bg-muted-foreground/20",
        animation === "pulse" && "animate-pulse",
        animation === "shimmer" &&
          "relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full after:animate-[kjshimmer_2s_ease-in-out_infinite_alternate] after:bg-gradient-to-r after:from-transparent after:via-foreground/10 after:to-transparent",
        variant === "text" && "h-3 w-4/5 rounded-sm my-1.5",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-kj-md",
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";
