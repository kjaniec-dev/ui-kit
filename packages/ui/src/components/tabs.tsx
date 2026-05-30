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
  ({ className, ...props }, ref) => (
    <div ref={ref} role="tablist" className={cn("flex gap-1 border-b border-border", className)} {...props} />
  )
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
        aria-selected={active}
        onClick={() => setValue(value)}
        className={cn(
          "relative px-[0.9rem] py-2.5 text-sm font-semibold cursor-pointer transition-colors duration-150",
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
    if (current !== value) return null;
    return (
      <div ref={ref} role="tabpanel" className={cn("pt-5 text-[0.9rem] text-muted-foreground", className)} {...props} />
    );
  }
);
TabsContent.displayName = "TabsContent";
