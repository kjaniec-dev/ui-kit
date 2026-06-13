"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
  contentWidth?: "default" | "wide" | "full";
  stickyTopbar?: boolean;
  mobileSidebar?: React.ReactNode;
}

export const DashboardShell = React.forwardRef<HTMLDivElement, DashboardShellProps>(
  (
    {
      className,
      sidebar,
      topbar,
      children,
      sidebarWidth = "md:w-64",
      contentWidth = "default",
      stickyTopbar = true,
      mobileSidebar,
      ...props
    },
    ref
  ) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const contentWidthClass = {
      default: "max-w-7xl w-full mx-auto",
      wide: "max-w-screen-2xl w-full mx-auto",
      full: "max-w-none w-full",
    }[contentWidth];

    return (
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
          <aside
            className={cn(
              "border-r border-border bg-surface shrink-0 z-20",
              mobileSidebar ? "hidden md:flex" : "w-full md:flex",
              sidebarWidth
            )}
          >
            <div className={cn("sticky top-0 w-full flex flex-col", mobileSidebar ? "h-screen" : "h-auto md:h-screen")}>
              {sidebar}
            </div>
          </aside>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileSidebar && mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 md:hidden bg-[color-mix(in_oklch,#09090b_45%,transparent)] backdrop-blur-[2px] transition-opacity duration-300"
          >
            <aside
              onClick={(e) => e.stopPropagation()}
              className="w-72 h-full bg-surface border-r border-border flex flex-col shadow-kj-lg"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {mobileSidebar}
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Navigation */}
          {topbar && (
            <header
              className={cn(
                "h-14 border-b border-border bg-surface flex items-center px-6 z-10 shrink-0 gap-4",
                stickyTopbar && "sticky top-0"
              )}
            >
              {mobileSidebar && (
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden p-1.5 -ml-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  aria-label="Open navigation"
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              )}
              {topbar}
            </header>
          )}

          {/* Inner page container */}
          <main className={cn("flex-1 p-6 md:p-8", contentWidthClass)}>
            {children}
          </main>
        </div>
      </div>
    );
  }
);
DashboardShell.displayName = "DashboardShell";
