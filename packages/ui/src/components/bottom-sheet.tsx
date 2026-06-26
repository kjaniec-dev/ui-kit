import * as React from "react";
import { cn } from "../lib/cn";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
}

const BottomSheetContext = React.createContext<{ titleId: string; descId: string } | null>(null);

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {children}
      </div>
    </BottomSheetContext.Provider>
  );
}

export function BottomSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function BottomSheetTitle({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <h2 id={id ?? ctx?.titleId} className={cn("text-lg font-semibold", className)} {...props} />;
}

export function BottomSheetDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <p id={id ?? ctx?.descId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function BottomSheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 overflow-y-auto", className)} {...props} />;
}

export function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-t border-border", className)} {...props} />;
}
