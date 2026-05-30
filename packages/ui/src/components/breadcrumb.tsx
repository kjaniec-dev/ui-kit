import * as React from "react";
import { cn } from "../lib/cn";

export const Breadcrumb = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => (
    <nav ref={ref} aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-[0.85rem] text-muted-foreground", className)} {...props}>
      {children}
    </nav>
  )
);
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks the trailing current page (non-link, emphasized). */
  current?: boolean;
}

export const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  ({ className, current, children, ...props }, ref) => {
    if (current) {
      return (
        <span aria-current="page" className={cn("text-foreground font-semibold", className)}>
          {children}
        </span>
      );
    }
    return (
      <a ref={ref} className={cn("text-inherit no-underline hover:text-foreground transition-colors", className)} {...props}>
        {children}
      </a>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export function BreadcrumbSeparator() {
  return <span aria-hidden className="text-muted-foreground/70">/</span>;
}
