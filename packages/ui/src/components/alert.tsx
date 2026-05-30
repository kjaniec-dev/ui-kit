import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const alertVariants = cva(
  "flex gap-3 items-start p-[0.9rem_1.1rem] rounded-kj-md border text-sm",
  {
    variants: {
      variant: {
        info: "bg-info-surface border-info/30",
        success: "bg-success-surface border-success/30",
        warning: "bg-warning-surface border-warning/30",
        danger: "bg-danger-surface border-danger/30",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const iconColor = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  /** Optional leading icon (e.g. an SVG). Inherits the variant color. */
  icon?: React.ReactNode;
  title?: React.ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", icon, title, children, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && (
        <span className={cn("shrink-0 mt-0.5 [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]", iconColor[variant ?? "info"])}>
          {icon}
        </span>
      )}
      <div className="text-foreground">
        {title && <p className="font-bold m-0 mb-0.5 text-sm">{title}</p>}
        {children && <p className="m-0 opacity-85">{children}</p>}
      </div>
    </div>
  )
);
Alert.displayName = "Alert";
