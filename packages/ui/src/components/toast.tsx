"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export type ToastTone = "default" | "success" | "danger";
export interface ToastOptions {
  message: React.ReactNode;
  tone?: ToastTone;
  /** Auto-dismiss after ms. Default 3200. Pass 0 to keep open. */
  duration?: number;
}
interface ToastItem extends Required<Omit<ToastOptions, "duration">> {
  id: number;
  duration: number;
  leaving?: boolean;
}

interface ToastCtx {
  toast: (opts: ToastOptions) => void;
}
const ToastContext = React.createContext<ToastCtx | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const icons: Record<ToastTone, React.ReactNode> = {
  default: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  success: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-success"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  danger: (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-danger"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
};

const toneBorder: Record<ToastTone, string> = {
  default: "border-l-primary",
  success: "border-l-success",
  danger: "border-l-danger",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const remove = React.useCallback((id: number) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 250);
  }, []);

  const toast = React.useCallback(
    ({ message, tone = "default", duration = 3200 }: ToastOptions) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, message, tone, duration }]);
      if (duration > 0) setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => remove(t.id)}
            className={cn(
              "flex items-center gap-2.5 min-w-[280px] px-4 py-3 cursor-pointer",
              "bg-surface border border-border border-l-[3px] rounded-kj-md shadow-kj-lg text-[0.85rem] font-medium",
              toneBorder[t.tone],
              t.leaving
                ? "animate-[kjtoastout_.25s_ease_forwards]"
                : "animate-[kjtoastin_.25s_ease]"
            )}
          >
            <span className="grid place-items-center">{icons[t.tone]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
