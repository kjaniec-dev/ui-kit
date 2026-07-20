"use client";

import * as React from "react";
import { cn } from "../lib/cn";

interface PopoverCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}
const PopoverContext = React.createContext<PopoverCtx | null>(null);

function usePopoverContext(part: string): PopoverCtx {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error(`${part} must be used inside <Popover>`);
  return ctx;
}

export interface PopoverProps {
  /** Trigger and content elements. */
  children: React.ReactNode;
  /** Additional classes for the positioning wrapper. */
  className?: string;
  /** Controlled open state. Omit for uncontrolled behavior. */
  open?: boolean;
  /** Called whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, className, open: openProp, onOpenChange }: PopoverProps) {
  const [openState, setOpenState] = React.useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!controlled) setOpenState(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, asChild, ...props }, ref) => {
  const ctx = usePopoverContext("PopoverTrigger");
  const setRefs = (node: HTMLButtonElement | null) => {
    // eslint-disable-next-line react-hooks/immutability
    ctx.triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };
  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement<
      React.ComponentPropsWithRef<"button">
    >;
    return React.cloneElement(child, {
      ref: setRefs,
      ...props,
      ...child.props,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
        child.props.onClick?.(e);
      },
      "aria-haspopup": "dialog",
      "aria-expanded": ctx.open,
    });
  }
  return (
    <button
      /* eslint-disable-next-line react-hooks/immutability */
      ref={setRefs}
      {...props}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      onClick={(e) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
      }}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const sideAlignClasses: Record<string, string> = {
  "bottom-start": "top-[calc(100%+6px)] left-0",
  "bottom-center": "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  "bottom-end": "top-[calc(100%+6px)] right-0",
  "top-start": "bottom-[calc(100%+6px)] left-0",
  "top-center": "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  "top-end": "bottom-[calc(100%+6px)] right-0",
  "left-start": "right-[calc(100%+6px)] top-0",
  "left-center": "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  "left-end": "right-[calc(100%+6px)] bottom-0",
  "right-start": "left-[calc(100%+6px)] top-0",
  "right-center": "left-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  "right-end": "left-[calc(100%+6px)] bottom-0",
};

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which side of the trigger the panel opens on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the chosen side. */
  align?: "start" | "center" | "end";
}

export function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  children,
  ...props
}: PopoverContentProps) {
  const ctx = usePopoverContext("PopoverContent");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ctx.open) ref.current?.focus();
  }, [ctx.open]);

  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      tabIndex={-1}
      className={cn(
        "absolute z-40 min-w-[200px] p-4 rounded-kj-md bg-surface border border-border shadow-kj-lg outline-none",
        "animate-[kjpop_.12s_ease]",
        sideAlignClasses[`${side}-${align}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
