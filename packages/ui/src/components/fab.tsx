import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const fabVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-sans font-semibold leading-none",
    "border border-transparent rounded-full cursor-pointer shadow-lg",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
    "active:translate-y-px active:shadow-md",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline: "bg-transparent text-foreground border-border hover:bg-muted hover:border-muted-foreground",
        danger: "bg-danger text-white hover:brightness-95",
      },
      size: {
        sm: "h-10 w-10 p-0 text-sm",
        md: "h-14 w-14 p-0 text-base",
        lg: "h-16 w-16 p-0 text-lg",
      },
      position: {
        "bottom-right": "fixed bottom-6 right-6 z-50",
        "bottom-left": "fixed bottom-6 left-6 z-50",
        "bottom-center": "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        none: "relative",
      },
    },
    defaultVariants: { variant: "primary", size: "md", position: "bottom-right" },
  }
);

export interface FabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof fabVariants> {
  /** Icon rendered inside the button. */
  icon: React.ReactNode;
  
  /** Text label for accessibility (aria-label). */
  label: string;
  
  /** If true, the FAB will only be visible on mobile screens (< 768px). */
  mobileOnly?: boolean;
  
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, size, position, mobileOnly, icon, label, loading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          fabVariants({ variant, size, position }),
          mobileOnly && "md:hidden",
          loading && "relative",
          className
        )}
        disabled={disabled || loading}
        aria-label={label}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span
            aria-hidden
            className="h-[1.2em] w-[1.2em] rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        ) : (
          <span className="[&_svg]:h-[1.35em] [&_svg]:w-[1.35em] flex items-center justify-center">
            {icon}
          </span>
        )}
      </button>
    );
  }
);
Fab.displayName = "Fab";
