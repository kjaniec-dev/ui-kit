import * as React from "react";
import { cn } from "../lib/cn";

export interface BottomNavigationItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  active?: boolean;
  badge?: React.ReactNode;
}

export interface BottomNavigationProps extends React.HTMLAttributes<HTMLElement> {
  items: BottomNavigationItem[];
  /** Mode for displaying labels:
   * - 'always': Always show labels for all items.
   * - 'active': Only show label for the active item, hiding others.
   * - 'never': Hide all labels (only show icons).
   */
  showLabels?: "always" | "active" | "never";
  /** If true, uses fixed positioning at the bottom of the viewport with backdrop-blur. */
  fixed?: boolean;
}

export const BottomNavigation = React.forwardRef<HTMLElement, BottomNavigationProps>(
  ({ className, items, showLabels = "always", fixed = true, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "bg-surface/90 border-t border-border flex items-center justify-around px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0))] shadow-kj-lg",
          fixed ? "fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md" : "relative w-full",
          className
        )}
        {...props}
      >
        {items.map((item) => {
          const isActive = item.active;
          const showLabel = showLabels !== "never" && (showLabels === "always" || isActive);

          const content = (
            <span className="flex flex-col items-center justify-center gap-1 w-full relative">
              <span
                className={cn(
                  "relative flex items-center justify-center p-1 rounded-full transition-all duration-200",
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground group-hover:text-foreground group-active:scale-95"
                )}
              >
                {item.icon}
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-surface">
                    {item.badge}
                  </span>
                )}
              </span>

              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide transition-all duration-200 select-none",
                  showLabel
                    ? "opacity-100 scale-100 h-auto"
                    : "opacity-0 scale-75 h-0 overflow-hidden",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>

              {/* Subtle active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary animate-fade-in" />
              )}
            </span>
          );

          const itemClass =
            "group flex-1 flex flex-col items-center justify-center py-1 cursor-pointer transition-all duration-150 relative focus:outline-none";

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                className={itemClass}
                aria-current={isActive ? "page" : undefined}
              >
                {content}
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={itemClass}
              aria-pressed={isActive}
            >
              {content}
            </button>
          );
        })}
      </nav>
    );
  }
);

BottomNavigation.displayName = "BottomNavigation";
