import * as React from "react";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  if (!open) return null;
  return <div>{children}</div>;
}
