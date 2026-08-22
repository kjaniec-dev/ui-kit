import * as React from "react";
import { cn } from "../lib/cn";
import { Button, buttonVariants } from "./button";

export interface DetailPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export const DetailPageLayout = React.forwardRef<HTMLDivElement, DetailPageLayoutProps>(
  (
    {
      className,
      title,
      description,
      backHref,
      backLabel = "Back",
      onBackClick,
      actions,
      aside,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("space-y-6 w-full", className)} {...props}>
        {/* Header/Top Area */}
        <div className="flex flex-col gap-3">
          {(backHref || onBackClick) && (
            <div>
              {backHref ? (
                <a
                  href={backHref}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "-ml-3 h-8 text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  {backLabel}
                </a>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 text-muted-foreground hover:text-foreground"
                  onClick={onBackClick}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-4 w-4 mr-1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  {backLabel}
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className={cn("space-y-6", aside ? "lg:col-span-2" : "lg:col-span-3")}>
            {children}
          </div>
          {aside && (
            <aside className="space-y-6 lg:col-span-1 bg-surface border border-border rounded-kj-xl p-6 shadow-kj-xs">
              {aside}
            </aside>
          )}
        </div>
      </div>
    );
  }
);
DetailPageLayout.displayName = "DetailPageLayout";
