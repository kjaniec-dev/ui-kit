import * as React from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "animate-pulse bg-muted/40",
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
