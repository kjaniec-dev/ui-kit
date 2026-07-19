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

  const ctxValue = React.useMemo(() => ({ open, setOpen, triggerRef }), [open, setOpen]);

  return (
    <InboxContext.Provider value={ctxValue}>
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

  const defaultLabel = displayCount ? `${label} (${displayCount} unread)` : label;

  return (
    <button
      ref={setRef}
      type="button"
      aria-label={defaultLabel}
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
// NotificationItem
// ---------------------------------------------------------------------------

export interface NotificationItemProps {
  item: NotificationItemData;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationItem({ item, onDismiss, className }: NotificationItemProps) {
  const leadingSlot = item.avatarSrc ? (
    <img
      src={item.avatarSrc}
      alt={item.avatarFallback ?? ""}
      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
    />
  ) : item.avatarFallback ? (
    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 select-none">
      {item.avatarFallback}
    </span>
  ) : item.icon ? (
    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
      {item.icon}
    </span>
  ) : null;

  const textBlock = (
    <div className="flex-1 min-w-0">
      <p className={cn("text-sm leading-snug", item.read ? "text-muted-foreground" : "text-foreground")}>
        {item.title}
      </p>
      {item.body && (
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.body}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(item.timestamp)}</p>
    </div>
  );

  const actionsBlock = (
    <div className="flex items-start gap-2 flex-shrink-0 mt-0.5">
      <span
        role="button"
        tabIndex={0}
        aria-label="Dismiss"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss?.(item.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onDismiss?.(item.id);
          }
        }}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "text-base leading-none p-0.5 rounded cursor-pointer"
        )}
      >
        ×
      </span>
      <span
        aria-label={item.read ? undefined : "Unread"}
        aria-hidden={item.read ? true : undefined}
        className={cn(
          "w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1",
          item.read ? "border border-border" : "bg-primary"
        )}
      />
    </div>
  );

  const innerContent = (
    <>
      {leadingSlot}
      {textBlock}
      {actionsBlock}
    </>
  );

  const sharedClass = cn(
    "group relative flex items-start gap-2.5 px-3.5 py-2.5 w-full text-left",
    "border-b border-border last:border-0",
    !item.read && "bg-primary/[0.04]",
    "hover:bg-muted/50 transition-colors",
    className
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        onClick={() => item.onClick?.(item.id)}
        className={sharedClass}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => item.onClick?.(item.id)}
      className={sharedClass}
    >
      {innerContent}
    </button>
  );
}

// ---------------------------------------------------------------------------
// InboxContent — full panel
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

export function InboxContent({
  items,
  onMarkAllRead,
  onDismiss,
  viewAllHref,
  viewAllLabel = "View all notifications",
  emptyState,
  width = 360,
  maxHeight = 320,
  className,
}: InboxContentProps) {
  const ctx = useInboxContext("InboxContent");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ctx.open) ref.current?.focus();
  }, [ctx.open]);

  if (!ctx.open) return null;

  const allRead = items.length === 0 || items.every((i) => i.read);

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
      <span className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </span>
      <p className="text-sm font-medium text-foreground">All caught up</p>
      <p className="text-xs text-muted-foreground mt-0.5">No new notifications</p>
    </div>
  );

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Notifications"
      tabIndex={-1}
      style={{ width }}
      className={cn(
        "absolute right-0 top-[calc(100%+6px)] z-40",
        "bg-surface border border-border rounded-kj-md shadow-kj-lg outline-none",
        "animate-[kjpop_.12s_ease]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Notifications</span>
        <button
          type="button"
          disabled={allRead}
          aria-disabled={allRead}
          onClick={allRead ? undefined : onMarkAllRead}
          className={cn(
            "text-xs font-medium transition-colors",
            allRead
              ? "text-muted-foreground cursor-not-allowed"
              : "text-primary hover:text-primary/80"
          )}
        >
          Mark all read
        </button>
      </div>

      {/* List or empty state */}
      {items.length === 0 ? (
        emptyState ?? defaultEmptyState
      ) : (
        <div
          className="overflow-y-auto"
          style={{ maxHeight }}
        >
          {items.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              onDismiss={onDismiss}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {items.length > 0 && viewAllHref && (
        <div className="border-t border-border px-3.5 py-2.5 text-center">
          <a
            href={viewAllHref}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {viewAllLabel} →
          </a>
        </div>
      )}
    </div>
  );
}

