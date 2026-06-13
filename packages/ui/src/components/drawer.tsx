import * as React from "react";
import { cn } from "../lib/cn";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  width?: string;
  side?: "right" | "left";
}

export function Drawer({
  open,
  onClose,
  children,
  title,
  description,
  width = "max-w-md",
  side = "right",
}: DrawerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      if (lastActiveElement.current) {
        lastActiveElement.current.focus();
        lastActiveElement.current = null;
      }
      return;
    }

    lastActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (container) {
      const focusables = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        setTimeout(() => focusables[0].focus(), 50);
      } else {
        container.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const container = containerRef.current;
        if (!container) return;

        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === container) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sideClasses = {
    right: cn(
      "right-0 h-full border-l",
      open ? "translate-x-0" : "translate-x-full"
    ),
    left: cn(
      "left-0 h-full border-r",
      open ? "translate-x-0" : "-translate-x-full"
    ),
  }[side];

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-[100] transition-opacity duration-300 backdrop-blur-[2px]",
        "bg-[color-mix(in_oklch,#09090b_45%,transparent)]",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={!title ? "Drawer" : undefined}
        aria-labelledby={title ? "drawer-title" : undefined}
        aria-describedby={description ? "drawer-description" : undefined}
        tabIndex={-1}
        className={cn(
          "fixed top-0 bottom-0 bg-surface border-border flex flex-col w-full shadow-kj-lg transition-transform duration-300 ease-spring outline-none",
          width,
          sideClasses
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="space-y-1">
              {title && <h2 id="drawer-title" className="text-lg font-bold tracking-tight text-foreground">{title}</h2>}
              {description && <p id="drawer-description" className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
Drawer.displayName = "Drawer";
