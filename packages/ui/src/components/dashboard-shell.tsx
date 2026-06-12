import * as React from "react";
import { cn } from "../lib/cn";

export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardShell = React.forwardRef<HTMLDivElement, DashboardShellProps>(
  ({ className, sidebar, topbar, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-h-screen bg-canvas text-foreground flex flex-col md:flex-row",
        className
      )}
      {...props}
    >
      {/* Sidebar (sticky desk, scrollable inside) */}
      {sidebar && (
        <aside className="w-full md:w-64 border-r border-border bg-surface shrink-0 z-20">
          <div className="sticky top-0 h-auto md:h-screen flex flex-col">
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        {topbar && (
          <header className="sticky top-0 h-14 border-b border-border bg-surface flex items-center px-6 z-10 shrink-0">
            {topbar}
          </header>
        )}

        {/* Inner page container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
);
DashboardShell.displayName = "DashboardShell";
