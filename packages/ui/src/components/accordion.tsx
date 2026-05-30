import * as React from "react";
import { cn } from "../lib/cn";

interface AccordionCtx {
  open: string[];
  toggle: (v: string) => void;
}
const AccordionContext = React.createContext<AccordionCtx | null>(null);

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "single" closes others when one opens. */
  type?: "single" | "multiple";
  defaultValue?: string[];
}

export function Accordion({ type = "single", defaultValue = [], className, children, ...props }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(defaultValue);
  const toggle = React.useCallback(
    (v: string) => {
      setOpen((prev) => {
        const isOpen = prev.includes(v);
        if (type === "single") return isOpen ? [] : [v];
        return isOpen ? prev.filter((x) => x !== v) : [...prev, v];
      });
    },
    [type]
  );
  return (
    <AccordionContext.Provider value={{ open, toggle }}>
      <div className={cn("border border-border rounded-kj-lg overflow-hidden", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

const ItemContext = React.createContext<string>("");

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, ...props }, ref) => (
    <ItemContext.Provider value={value}>
      <div ref={ref} className={cn("border-t border-border first:border-t-0", className)} {...props} />
    </ItemContext.Provider>
  )
);
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext)!;
    const value = React.useContext(ItemContext);
    const isOpen = ctx.open.includes(value);
    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={isOpen}
        onClick={() => ctx.toggle(value)}
        className={cn(
          "w-full flex justify-between items-center gap-4 text-left px-[1.2rem] py-4 bg-card text-foreground text-[0.9rem] font-semibold cursor-pointer hover:bg-muted transition-colors",
          className
        )}
        {...props}
      >
        {children}
        <svg
          className={cn("shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
          width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(AccordionContext)!;
    const value = React.useContext(ItemContext);
    const isOpen = ctx.open.includes(value);
    return (
      <div
        ref={ref}
        className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
        {...props}
      >
        <div className="overflow-hidden">
          <div className={cn("px-[1.2rem] pb-[1.1rem] text-[0.85rem] text-muted-foreground", className)}>{children}</div>
        </div>
      </div>
    );
  }
);
AccordionContent.displayName = "AccordionContent";
