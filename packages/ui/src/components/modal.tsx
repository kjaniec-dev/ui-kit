"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width of the panel. Default 440px. */
  width?: number;
  className?: string;
  showClose?: boolean;
}

const ModalContext = React.createContext<{ titleId: string; descId: string } | null>(null);

/** Centered overlay dialog. Closes on backdrop click and Escape. Includes focus trap and restore. */
export function Modal({ open, onClose, children, width = 440, className, showClose = true }: ModalProps) {
  const titleId = React.useId();
  const descId = React.useId();
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
        // Delay slightly for transition to complete
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

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center p-6 backdrop-blur-[3px] transition-opacity duration-200",
        "bg-[color-mix(in_oklch,#09090b_55%,transparent)]",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <ModalContext.Provider value={{ titleId, descId }}>
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          style={{ maxWidth: width }}
          className={cn(
            "relative w-full p-7 rounded-kj-2xl bg-surface border border-border shadow-kj-lg transition-transform duration-200 outline-none",
            open ? "scale-100 translate-y-0" : "scale-95 translate-y-2",
            className
          )}
        >
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </ModalContext.Provider>
    </div>
  );
}

export function ModalTitle({ className, id, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.useContext(ModalContext);
  return <h3 id={id ?? ctx?.titleId} className={cn("m-0 mb-2 text-[1.15rem] font-bold tracking-[-0.01em]", className)} {...props}>{children}</h3>;
}

export function ModalDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(ModalContext);
  return <p id={id ?? ctx?.descId} className={cn("m-0 text-[0.9rem] text-muted-foreground", className)} {...props} />;
}

export function ModalActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2.5 justify-end mt-6", className)} {...props} />;
}

