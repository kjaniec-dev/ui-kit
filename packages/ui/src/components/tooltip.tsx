"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** CSS-only hover/focus tooltip positioned above the trigger. */
export function Tooltip({ content, children, className }: TooltipProps) {
  return (
    <span className={cn("relative inline-flex group", className)} tabIndex={0}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap",
          "rounded-kj-sm bg-foreground text-background text-xs font-medium px-2.5 py-1.5 shadow-kj-md",
          "opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0",
          "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-foreground"
        )}
      >
        {content}
      </span>
    </span>
  );
}
