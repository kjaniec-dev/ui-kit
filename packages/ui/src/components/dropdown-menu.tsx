import * as React from "react";
import { cn } from "../lib/cn";

interface MenuCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}
const MenuContext = React.createContext<MenuCtx | null>(null);

export function DropdownMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(MenuContext)!;
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      onClick={(e) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export function DropdownMenuContent({ className, align = "start", children, ...props }: DropdownMenuContentProps) {
  const ctx = React.useContext(MenuContext)!;
  if (!ctx.open) return null;
  return (
    <div
      role="menu"
      className={cn(
        "absolute top-[calc(100%+6px)] z-40 min-w-[200px] p-1.5 rounded-kj-md bg-surface border border-border shadow-kj-lg",
        "animate-[kjpop_.12s_ease]",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
  icon?: React.ReactNode;
}

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, danger, icon, children, onClick, ...props }, ref) => {
    const ctx = React.useContext(MenuContext)!;
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        onClick={(e) => {
          onClick?.(e);
          ctx.setOpen(false);
        }}
        className={cn(
          "w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-kj-sm text-[0.85rem] cursor-pointer transition-colors",
          "[&_svg]:h-4 [&_svg]:w-4",
          danger ? "text-danger hover:bg-danger-surface" : "text-foreground hover:bg-muted",
          className
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border my-1.5", className)} role="separator" />;
}
