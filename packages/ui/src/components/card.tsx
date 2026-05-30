import * as React from "react";
import { cn } from "../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  /** Drop the border + heavier shadow for a floating look. */
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ as: Tag = "div", className, elevated, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "bg-card text-card-foreground rounded-kj-xl overflow-hidden border",
        elevated ? "border-transparent shadow-kj-lg" : "border-border shadow-kj-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-[1.35rem] flex flex-col gap-1", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("m-0 text-base font-bold tracking-[-0.01em]", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("m-0 text-[0.85rem] text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

/** Body region with default padding. */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-[1.35rem] pb-[1.35rem]", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex gap-2.5 px-[1.35rem] py-[1.1rem] border-t border-border bg-muted/40", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
