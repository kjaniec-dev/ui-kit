import * as React from "react";
import { cn } from "../lib/cn";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl";
  className?: string;
  showClose?: boolean;
}

const BottomSheetContext = React.createContext<{ titleId: string; descId: string } | null>(null);

export function BottomSheet({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
  className,
  showClose = true,
}: BottomSheetProps) {
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <BottomSheetContext.Provider value={{ titleId, descId }}>
      {/* Backdrop overlay */}
      <div
        role="presentation"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className={cn(
          "fixed inset-0 z-[100] grid items-end sm:place-items-center p-0 sm:p-6 backdrop-blur-[3px] transition-opacity duration-200",
          "bg-[color-mix(in_oklch,#09090b_55%,transparent)]"
        )}
      >
        {/* Panel wrapper */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className={cn(
            "relative w-full bg-surface border-t sm:border border-border shadow-kj-lg transition-all outline-none",
            "rounded-t-kj-2xl sm:rounded-kj-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]",
            // Mobile styling vs Desktop styling
            "bottom-0 sm:bottom-auto",
            maxWidth,
            className
          )}
        >
          {/* Mobile Drag Handle */}
          <div className="flex justify-center py-2 sm:hidden cursor-grab">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Close button (rendered on top right for desktop modal look) */}
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer z-10"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
    </BottomSheetContext.Provider>
  );
}

export function BottomSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 flex flex-col gap-1.5 border-b border-border", className)} {...props} />;
}

export function BottomSheetTitle({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <h2 id={id ?? ctx?.titleId} className={cn("m-0 text-[1.15rem] font-bold tracking-[-0.01em]", className)} {...props} />;
}

export function BottomSheetDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <p id={id ?? ctx?.descId} className={cn("m-0 text-[0.9rem] text-muted-foreground", className)} {...props} />;
}

export function BottomSheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 overflow-y-auto flex-1", className)} {...props} />;
}

export function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 border-t border-border flex gap-2.5 justify-end mt-auto", className)} {...props} />;
}
