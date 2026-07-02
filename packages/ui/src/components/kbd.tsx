import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const kbdVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium text-muted-foreground bg-muted border border-border border-b-2 rounded-kj-sm select-none",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-[0.68rem]",
        md: "h-6 min-w-6 px-1.5 text-[0.78rem]",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  /** Render one <kbd> chip per key (separated by a small gap); children are ignored. */
  keys?: string[];
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size, keys, children, ...props }, ref) => {
    if (keys && keys.length > 0) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={cn("inline-flex items-center gap-1", className)}
          {...props}
        >
          {keys.map((k, i) => (
            <kbd key={i} className={kbdVariants({ size })}>
              {k}
            </kbd>
          ))}
        </span>
      );
    }
    return (
      <kbd ref={ref} className={cn(kbdVariants({ size }), className)} {...props}>
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = "Kbd";
