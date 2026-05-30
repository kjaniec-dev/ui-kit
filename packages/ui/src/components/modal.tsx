import * as React from "react";
import { cn } from "../lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width of the panel. Default 440px. */
  width?: number;
  className?: string;
}

/** Centered overlay dialog. Closes on backdrop click and Escape. */
export function Modal({ open, onClose, children, width = 440, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
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
      <div
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: width }}
        className={cn(
          "w-full p-7 rounded-kj-2xl bg-surface border border-border shadow-kj-lg transition-transform duration-200",
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("m-0 mb-2 text-[1.15rem] font-bold tracking-[-0.01em]", className)} {...props} />;
}

export function ModalDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 text-[0.9rem] text-muted-foreground", className)} {...props} />;
}

export function ModalActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2.5 justify-end mt-6", className)} {...props} />;
}
