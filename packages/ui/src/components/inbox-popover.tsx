"use client";

import * as React from "react";
import { cn } from "../lib/cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotificationItemData {
  /** Unique stable identifier. */
  id: string;
  /** Primary notification text. */
  title: React.ReactNode;
  /** Optional second line (preview, quote, etc.). */
  body?: React.ReactNode;
  /**
   * Leading visual (28×28 circle).
   * SVG ReactNode → icon mode. If avatarSrc is also provided, avatarSrc wins.
   */
  icon?: React.ReactNode;
  /** Image URL for avatar mode. */
  avatarSrc?: string;
  /** 1–2 character initials for avatar fallback. */
  avatarFallback?: string;
  /** Shown as a relative time string. */
  timestamp: Date | string;
  /** Defaults to false (unread). */
  read?: boolean;
  /**
   * If provided, the row renders as <a href={href}>.
   * Clicking marks the item read and navigates.
   */
  href?: string;
  /** Called after the row is clicked (after mark-read). */
  onClick?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Relative timestamp utility (exported for unit tests)
// ---------------------------------------------------------------------------

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffH < 24) return diffH === 1 ? "1 hour ago" : `${diffH} hours ago`;
  // "Yesterday" fires from 24h to 47h59m (floor-based). Intentional — matches common app conventions.
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// useInboxState — optional local-state convenience hook
// ---------------------------------------------------------------------------

export interface InboxStateReturn {
  items: NotificationItemData[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

/**
 * Local-state convenience hook for InboxPopover.
 * Intended for demos, Storybook stories, and simple apps.
 *
 * NOTE: `initial` is used only as the seed value for `useState`.
 * Re-rendering the parent with a new `initial` array does NOT reset
 * the hook's state. This is intentional — the hook owns its state
 * independently after mount. To reset from the outside, remount the
 * component using a `key` prop.
 */
export function useInboxState(initial: NotificationItemData[]): InboxStateReturn {
  const [items, setItems] = React.useState<NotificationItemData[]>(initial);

  const unreadCount = items.filter((i) => !i.read).length;

  const markRead = React.useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllRead = React.useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, unreadCount, markRead, markAllRead, dismiss };
}

// ---------------------------------------------------------------------------
// InboxPopover — context + root
// ---------------------------------------------------------------------------

interface InboxCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}
const InboxContext = React.createContext<InboxCtx | null>(null);

function useInboxContext(part: string): InboxCtx {
  const ctx = React.useContext(InboxContext);
  if (!ctx) throw new Error(`${part} must be used inside <InboxPopover>`);
  return ctx;
}

export interface InboxPopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function InboxPopover({
  children,
  className,
  open: openProp,
  onOpenChange,
}: InboxPopoverProps) {
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
    <InboxContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </InboxContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// InboxTrigger — bell button with unread badge
// ---------------------------------------------------------------------------

export interface InboxTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Badge count. Hidden when 0 or undefined. */
  unreadCount?: number;
  /** Accessible label (default: "Notifications"). */
  label?: string;
}

export function InboxTrigger({
  unreadCount,
  label = "Notifications",
  className,
  onClick,
  ...props
}: InboxTriggerProps) {
  const ctx = useInboxContext("InboxTrigger");
  const setRef = (node: HTMLButtonElement | null) => {
    ctx.triggerRef.current = node;
  };

  const displayCount =
    unreadCount == null || unreadCount <= 0
      ? null
      : unreadCount > 99
      ? "99+"
      : String(unreadCount);

  return (
    <button
      ref={setRef}
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-full",
        "bg-surface border border-border text-muted-foreground",
        "hover:bg-muted hover:text-foreground transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      onClick={(e) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    >
      {/* Bell icon */}
      <svg
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Unread badge */}
      {displayCount != null && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1",
            "rounded-full bg-primary text-primary-foreground",
            "text-[9px] font-bold leading-4 flex items-center justify-center"
          )}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// InboxContent — stub (full implementation in Task 4)
// ---------------------------------------------------------------------------

export interface InboxContentProps {
  items: NotificationItemData[];
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyState?: React.ReactNode;
  width?: number | string;
  maxHeight?: number | string;
  className?: string;
}

export function InboxContent(_props: InboxContentProps) {
  const ctx = useInboxContext("InboxContent");
  if (!ctx.open) return null;
  return (
    <div role="dialog" aria-label="Notifications" tabIndex={-1}>
      {/* full implementation in Task 4 */}
    </div>
  );
}
