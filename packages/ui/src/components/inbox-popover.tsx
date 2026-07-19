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
// InboxPopover component skeleton (to be completed in subsequent tasks)
// ---------------------------------------------------------------------------

export interface InboxPopoverProps {
  /** The list of notification items to display. */
  items: NotificationItemData[];
  /** Called when the user clicks "Mark all as read". */
  onMarkAllRead?: () => void;
  /** Optional className for the popover panel. */
  className?: string;
}

/**
 * InboxPopover — skeleton placeholder.
 * Full implementation added in subsequent tasks.
 */
export function InboxPopover({ items, onMarkAllRead, className }: InboxPopoverProps) {
  return (
    <div className={cn("inbox-popover", className)} aria-label="Notifications">
      {/* Full implementation coming in Task 2 */}
    </div>
  );
}
