"use client";

import * as React from "react";
import { cn } from "../lib/cn";

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = React.createContext<TabsCtx | null>(null);
function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be used within <Tabs>");
  return ctx;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled active value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({ value, defaultValue, onValueChange, className, children, ...props }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const current = value ?? internal;
  const setValue = React.useCallback(
    (v: string) => {
      if (value === undefined) setInternal(v);
      onValueChange?.(v);
    },
    [value, onValueChange]
  );
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      if (tabs.length === 0) return;

      const activeIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
      let newIndex = activeIndex;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        newIndex = (activeIndex + 1) % tabs.length;
        tabs[newIndex].focus();
        tabs[newIndex].click();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        newIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        tabs[newIndex].focus();
        tabs[newIndex].click();
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
        tabs[newIndex].focus();
        tabs[newIndex].click();
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = tabs.length - 1;
        tabs[newIndex].focus();
        tabs[newIndex].click();
      }

      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn(
          "flex gap-1 border-b border-border overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
        {...props}
      />
    );
  }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: current, setValue } = useTabs();
    const active = current === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`tabs-trigger-${value}`}
        aria-controls={`tabs-panel-${value}`}
        aria-selected={active}
        tabIndex={active ? 0 : -1}
        onClick={() => setValue(value)}
        className={cn(
          "relative px-[0.9rem] py-2.5 text-sm font-semibold cursor-pointer transition-colors duration-150 outline-none shrink-0 whitespace-nowrap",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm",
          "after:content-[''] after:absolute after:left-[0.9rem] after:right-[0.9rem] after:-bottom-px after:h-0.5 after:rounded-sm after:transition-colors",
          active
            ? "text-foreground after:bg-primary"
            : "text-muted-foreground hover:text-foreground after:bg-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: current } = useTabs();
    const active = current === value;
    if (!active) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`tabs-panel-${value}`}
        aria-labelledby={`tabs-trigger-${value}`}
        tabIndex={0}
        className={cn("pt-5 text-[0.9rem] text-muted-foreground outline-none", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";
