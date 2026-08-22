import * as React from "react";
import { cn } from "../lib/cn";
import { Input } from "./input";

export interface TableToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const TableToolbar = React.forwardRef<HTMLDivElement, TableToolbarProps>(
  (
    {
      className,
      searchQuery,
      onSearchChange,
      searchPlaceholder = "Search...",
      actions,
      filters,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full pb-1",
          className
        )}
        {...props}
      >
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl">
          {onSearchChange && (
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="sm:w-64"
              leadingIcon={
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
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              }
            />
          )}
          {filters && <div className="flex items-center gap-2">{filters}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 justify-end">{actions}</div>}
      </div>
    );
  }
);
TableToolbar.displayName = "TableToolbar";
