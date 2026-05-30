import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-sans font-semibold leading-none",
    "border border-transparent rounded-kj-md cursor-pointer",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-150",
    "active:translate-y-px",
    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        outline: "bg-transparent text-foreground border-border hover:bg-muted hover:border-muted-foreground",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        danger: "bg-danger text-white hover:brightness-95",
      },
      size: {
        sm: "h-8 px-3 text-[0.8rem] rounded-kj-sm",
        md: "h-10 px-[1.1rem] text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-kj-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leadingIcon, trailingIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && "relative", className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            aria-hidden
            className="absolute h-[1em] w-[1em] rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        )}
        <span className={cn("contents", loading && "invisible")}>
          {leadingIcon && <span className="[&_svg]:h-[1.05em] [&_svg]:w-[1.05em]">{leadingIcon}</span>}
          {children}
          {trailingIcon && <span className="[&_svg]:h-[1.05em] [&_svg]:w-[1.05em]">{trailingIcon}</span>}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
