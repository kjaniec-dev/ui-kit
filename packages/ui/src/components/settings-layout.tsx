import * as React from "react";
import { cn } from "../lib/cn";

export interface SettingsLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const SettingsLayout = React.forwardRef<HTMLDivElement, SettingsLayoutProps>(
  ({ className, sidebar, children, title, description, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-6 w-full", className)} {...props}>
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-border pb-4">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            )}
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        )}

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs / Navigation */}
          <aside className="lg:w-1/4 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {sidebar}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-3xl">{children}</div>
        </div>
      </div>
    );
  }
);
SettingsLayout.displayName = "SettingsLayout";
