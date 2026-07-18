# InboxPopover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `InboxPopover` notification-inbox suite — bell trigger with unread badge, scrollable notification panel, per-item dismiss, mark-all-read, empty state, relative timestamps, and a `useInboxState` helper hook — with full unit tests, a Storybook story, and a live showcase demo.

**Architecture:** A single `inbox-popover.tsx` file containing all exports, built on top of the existing `Popover` + context-open pattern (same as `popover.tsx`). The component is purely presentational / headless-state; consumers own the data array. `useInboxState` is an optional local-state convenience hook for demos and simple apps.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (kit tokens), Vitest + React Testing Library, Storybook 8.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/ui/src/components/inbox-popover.tsx` | All component + hook exports |
| Create | `packages/ui/src/components/inbox-popover.test.tsx` | Unit tests |
| Create | `packages/ui/src/components/inbox-popover.stories.tsx` | Storybook stories |
| Modify | `packages/ui/src/index.ts` | Add barrel exports |
| Modify | `site/src/main.tsx` | Add showcase demo section |

---

## Task 1: `formatRelativeTime` utility + data types

**Files:**
- Create: `packages/ui/src/components/inbox-popover.tsx` (initial skeleton)
- Create: `packages/ui/src/components/inbox-popover.test.tsx` (utility tests only)

- [ ] **Step 1.1: Write failing tests for `formatRelativeTime`**

Create `packages/ui/src/components/inbox-popover.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";

// Helper to import the private utility – we'll re-export it for tests only.
// We test it by importing from the module after it exists.

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function makeDate(msAgo: number): Date {
    return new Date(Date.now() - msAgo);
  }

  it('returns "Just now" for dates less than 60 seconds ago', async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    expect(formatRelativeTime(makeDate(30_000))).toBe("Just now");
  });

  it('returns "X min ago" for dates 1–59 minutes ago', async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    expect(formatRelativeTime(makeDate(5 * 60_000))).toBe("5 min ago");
    expect(formatRelativeTime(makeDate(59 * 60_000))).toBe("59 min ago");
  });

  it('returns "X hour ago" / "X hours ago" for 1–23 hours ago', async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    expect(formatRelativeTime(makeDate(1 * 3_600_000))).toBe("1 hour ago");
    expect(formatRelativeTime(makeDate(3 * 3_600_000))).toBe("3 hours ago");
  });

  it('returns "Yesterday" for dates 1 day ago', async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    expect(formatRelativeTime(makeDate(24 * 3_600_000))).toBe("Yesterday");
  });

  it('returns "X days ago" for 2–6 days ago', async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    expect(formatRelativeTime(makeDate(3 * 86_400_000))).toBe("3 days ago");
  });

  it("returns a short locale date for dates 7+ days ago", async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    const result = formatRelativeTime(makeDate(10 * 86_400_000));
    // e.g. "Jul 8" — just check it's not one of the relative strings
    expect(result).not.toMatch(/ago|now|Yesterday/);
    expect(result.length).toBeGreaterThan(2);
  });

  it("accepts a string timestamp", async () => {
    const { formatRelativeTime } = await import("./inbox-popover");
    const iso = new Date(Date.now() - 2 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2 min ago");
  });
});
```

- [ ] **Step 1.2: Run tests to confirm they fail**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 1.3: Create the skeleton file with types and `formatRelativeTime`**

Create `packages/ui/src/components/inbox-popover.tsx`:

```tsx
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
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffH < 24) return diffH === 1 ? "1 hour ago" : `${diffH} hours ago`;
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
```

- [ ] **Step 1.4: Run tests to confirm utility tests pass**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: 7 tests pass (the utility describe block).

- [ ] **Step 1.5: Commit**

```bash
git add packages/ui/src/components/inbox-popover.tsx packages/ui/src/components/inbox-popover.test.tsx
git commit -m "feat(inbox-popover): add NotificationItemData types and formatRelativeTime utility"
```

---

## Task 2: `useInboxState` hook

**Files:**
- Modify: `packages/ui/src/components/inbox-popover.tsx` (append hook)
- Modify: `packages/ui/src/components/inbox-popover.test.tsx` (append hook tests)

- [ ] **Step 2.1: Write failing tests for `useInboxState`**

Append to `packages/ui/src/components/inbox-popover.test.tsx`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { useInboxState, type NotificationItemData } from "./inbox-popover";

const ITEMS: NotificationItemData[] = [
  { id: "1", title: "First", timestamp: new Date(), read: false },
  { id: "2", title: "Second", timestamp: new Date(), read: false },
  { id: "3", title: "Third", timestamp: new Date(), read: true },
];

describe("useInboxState", () => {
  it("initialises with correct unreadCount", () => {
    const { result } = renderHook(() => useInboxState(ITEMS));
    expect(result.current.unreadCount).toBe(2);
  });

  it("markRead sets a single item to read and decrements unreadCount", () => {
    const { result } = renderHook(() => useInboxState(ITEMS));
    act(() => result.current.markRead("1"));
    expect(result.current.items.find((i) => i.id === "1")?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it("markAllRead sets all items to read", () => {
    const { result } = renderHook(() => useInboxState(ITEMS));
    act(() => result.current.markAllRead());
    expect(result.current.items.every((i) => i.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("dismiss removes the item from the list", () => {
    const { result } = renderHook(() => useInboxState(ITEMS));
    act(() => result.current.dismiss("2"));
    expect(result.current.items.find((i) => i.id === "2")).toBeUndefined();
    expect(result.current.items).toHaveLength(2);
  });

  it("dismiss of an unread item decrements unreadCount", () => {
    const { result } = renderHook(() => useInboxState(ITEMS));
    act(() => result.current.dismiss("1")); // id "1" is unread
    expect(result.current.unreadCount).toBe(1);
  });
});
```

- [ ] **Step 2.2: Run tests to confirm they fail**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: FAIL — `useInboxState` not exported.

- [ ] **Step 2.3: Implement `useInboxState`**

Append to `packages/ui/src/components/inbox-popover.tsx` (after `formatRelativeTime`):

```tsx
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
```

- [ ] **Step 2.4: Run tests to confirm hook tests pass**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: all hook tests pass.

- [ ] **Step 2.5: Commit**

```bash
git add packages/ui/src/components/inbox-popover.tsx packages/ui/src/components/inbox-popover.test.tsx
git commit -m "feat(inbox-popover): add useInboxState hook"
```

---

## Task 3: `InboxPopover` context + `InboxTrigger`

**Files:**
- Modify: `packages/ui/src/components/inbox-popover.tsx` (append context + trigger)
- Modify: `packages/ui/src/components/inbox-popover.test.tsx` (append trigger tests)

- [ ] **Step 3.1: Write failing tests for `InboxTrigger`**

Append to `packages/ui/src/components/inbox-popover.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  InboxPopover,
  InboxTrigger,
  InboxContent,
} from "./inbox-popover";

describe("InboxTrigger", () => {
  it("renders a button with aria-label 'Notifications'", () => {
    render(
      <InboxPopover>
        <InboxTrigger />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("shows the unread badge with count when unreadCount > 0", () => {
    render(
      <InboxPopover>
        <InboxTrigger unreadCount={5} />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("hides the badge when unreadCount is 0", () => {
    render(
      <InboxPopover>
        <InboxTrigger unreadCount={0} />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows '99+' when unreadCount exceeds 99", () => {
    render(
      <InboxPopover>
        <InboxTrigger unreadCount={150} />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("toggles the panel open on click", async () => {
    render(
      <InboxPopover>
        <InboxTrigger />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    const trigger = screen.getByRole("button", { name: "Notifications" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the panel on Escape and returns focus to the trigger", async () => {
    render(
      <InboxPopover>
        <InboxTrigger />
        <InboxContent items={[]} />
      </InboxPopover>
    );
    const trigger = screen.getByRole("button", { name: "Notifications" });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
```

- [ ] **Step 3.2: Run tests to confirm they fail**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: FAIL — `InboxPopover`, `InboxTrigger`, `InboxContent` not exported.

- [ ] **Step 3.3: Implement `InboxPopover` context and `InboxTrigger`**

Append to `packages/ui/src/components/inbox-popover.tsx`:

```tsx
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
```

- [ ] **Step 3.4: Add a minimal `InboxContent` stub so the file compiles**

Append to `packages/ui/src/components/inbox-popover.tsx`:

```tsx
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
      {/* full implementation coming in Task 4 */}
    </div>
  );
}
```

- [ ] **Step 3.5: Run tests to confirm trigger tests pass**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: all trigger + utility + hook tests pass.

- [ ] **Step 3.6: Commit**

```bash
git add packages/ui/src/components/inbox-popover.tsx packages/ui/src/components/inbox-popover.test.tsx
git commit -m "feat(inbox-popover): add InboxPopover context and InboxTrigger"
```

---

## Task 4: `NotificationItem` + full `InboxContent`

**Files:**
- Modify: `packages/ui/src/components/inbox-popover.tsx` (replace stub, add NotificationItem)
- Modify: `packages/ui/src/components/inbox-popover.test.tsx` (append item + content tests)

- [ ] **Step 4.1: Write failing tests for `NotificationItem` and `InboxContent`**

Append to `packages/ui/src/components/inbox-popover.test.tsx`:

```tsx
import { fireEvent } from "@testing-library/react";
import { NotificationItem } from "./inbox-popover";

const NOW = new Date();
const UNREAD_ITEM: NotificationItemData = {
  id: "n1",
  title: "Deployment succeeded",
  timestamp: NOW,
  read: false,
};
const READ_ITEM: NotificationItemData = {
  id: "n2",
  title: "Invoice paid",
  body: "Invoice #1042",
  timestamp: NOW,
  read: true,
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <InboxPopover>
      <InboxTrigger />
      {children}
    </InboxPopover>
  );
}

async function openPanel(items: NotificationItemData[], props: Partial<InboxContentProps> = {}) {
  const utils = render(
    <Wrapper>
      <InboxContent items={items} {...props} />
    </Wrapper>
  );
  await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
  return utils;
}

describe("InboxContent — empty state", () => {
  it("shows the default empty state when items is empty", async () => {
    await openPanel([]);
    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });

  it("renders a custom emptyState when provided", async () => {
    await openPanel([], { emptyState: <p>Nothing here</p> });
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("'Mark all read' is disabled when items is empty", async () => {
    await openPanel([]);
    const btn = screen.getByRole("button", { name: /mark all read/i });
    expect(btn).toBeDisabled();
  });

  it("does not show the footer link when viewAllHref is not provided", async () => {
    await openPanel([]);
    expect(screen.queryByRole("link", { name: /view all/i })).not.toBeInTheDocument();
  });
});

describe("InboxContent — with items", () => {
  it("renders notification titles", async () => {
    await openPanel([UNREAD_ITEM, READ_ITEM]);
    expect(screen.getByText("Deployment succeeded")).toBeInTheDocument();
    expect(screen.getByText("Invoice paid")).toBeInTheDocument();
  });

  it("renders the body when provided", async () => {
    await openPanel([READ_ITEM]);
    expect(screen.getByText("Invoice #1042")).toBeInTheDocument();
  });

  it("calls onMarkAllRead when 'Mark all read' is clicked", async () => {
    const onMarkAllRead = vi.fn();
    await openPanel([UNREAD_ITEM], { onMarkAllRead });
    await userEvent.click(screen.getByRole("button", { name: /mark all read/i }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("'Mark all read' is disabled when all items are read", async () => {
    await openPanel([READ_ITEM]);
    expect(screen.getByRole("button", { name: /mark all read/i })).toBeDisabled();
  });

  it("renders the 'View all' footer link when viewAllHref is provided", async () => {
    await openPanel([UNREAD_ITEM], { viewAllHref: "/notifications" });
    const link = screen.getByRole("link", { name: /view all/i });
    expect(link).toHaveAttribute("href", "/notifications");
  });
});

describe("NotificationItem", () => {
  it("calls onDismiss with the item id when × is clicked", async () => {
    const onDismiss = vi.fn();
    render(<NotificationItem item={UNREAD_ITEM} onDismiss={onDismiss} />);
    const dismissBtn = screen.getByRole("button", { name: "Dismiss" });
    await userEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledWith("n1");
  });

  it("clicking dismiss does not also fire onClick on the row", async () => {
    const onClick = vi.fn();
    const item = { ...UNREAD_ITEM, onClick };
    const onDismiss = vi.fn();
    render(<NotificationItem item={item} onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the row as a link when href is provided", () => {
    const item = { ...UNREAD_ITEM, href: "/deploy/123" };
    render(<NotificationItem item={item} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/deploy/123");
  });

  it("renders the row as a button when href is absent", () => {
    render(<NotificationItem item={UNREAD_ITEM} />);
    // There are two buttons: the row itself and the dismiss button.
    // The row button does NOT have aria-label "Dismiss".
    const buttons = screen.getAllByRole("button");
    const rowBtn = buttons.find((b) => b.getAttribute("aria-label") !== "Dismiss");
    expect(rowBtn).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const item = {
      ...UNREAD_ITEM,
      icon: <svg data-testid="custom-icon" />,
    };
    render(<NotificationItem item={item} />);
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders avatar image when avatarSrc is provided", () => {
    const item = { ...UNREAD_ITEM, avatarSrc: "https://example.com/avatar.png", avatarFallback: "KJ" };
    render(<NotificationItem item={item} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("renders initials when avatarFallback is provided without avatarSrc", () => {
    const item = { ...UNREAD_ITEM, avatarFallback: "KJ" };
    render(<NotificationItem item={item} />);
    expect(screen.getByText("KJ")).toBeInTheDocument();
  });

  it("omits the icon/avatar slot when neither is provided", () => {
    render(<NotificationItem item={UNREAD_ITEM} />);
    // No img, no initials text visible independently
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 4.2: Run tests to confirm they fail**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: FAIL — `NotificationItem` not exported; `InboxContent` is stub.

- [ ] **Step 4.3: Implement `NotificationItem`**

Replace the `InboxContent` stub and append `NotificationItem` in `packages/ui/src/components/inbox-popover.tsx`:

```tsx
// ---------------------------------------------------------------------------
// NotificationItem
// ---------------------------------------------------------------------------

export interface NotificationItemProps {
  item: NotificationItemData;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function NotificationItem({ item, onDismiss, className }: NotificationItemProps) {
  const hasAvatar = item.avatarSrc || item.avatarFallback;

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
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss?.(item.id);
        }}
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "@media(hover:none){opacity-100}",
          "text-base leading-none p-0.5 rounded"
        )}
      >
        ×
      </button>
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
```

- [ ] **Step 4.4: Implement full `InboxContent` (replace stub)**

Replace the stub `InboxContent` function in `packages/ui/src/components/inbox-popover.tsx`:

```tsx
// ---------------------------------------------------------------------------
// InboxContent — full panel
// ---------------------------------------------------------------------------

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
```

- [ ] **Step 4.5: Run all tests**

```bash
cd packages/ui && npx vitest run src/components/inbox-popover.test.tsx
```

Expected: all tests pass.

- [ ] **Step 4.6: Commit**

```bash
git add packages/ui/src/components/inbox-popover.tsx packages/ui/src/components/inbox-popover.test.tsx
git commit -m "feat(inbox-popover): add NotificationItem and full InboxContent panel"
```

---

## Task 5: Barrel exports

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 5.1: Add exports to `packages/ui/src/index.ts`**

Append after the `ProjectCard` export block (around line 221):

```ts
export {
  InboxPopover,
  InboxTrigger,
  InboxContent,
  NotificationItem,
  useInboxState,
  formatRelativeTime,
  type InboxPopoverProps,
  type InboxTriggerProps,
  type InboxContentProps,
  type NotificationItemProps,
  type NotificationItemData,
  type InboxStateReturn,
} from "./components/inbox-popover";
```

- [ ] **Step 5.2: Typecheck and build**

```bash
cd packages/ui && npm run typecheck && npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 5.3: Run full test suite**

```bash
npm test --workspace=packages/ui
```

Expected: all tests pass.

- [ ] **Step 5.4: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(inbox-popover): add barrel exports to @kjaniec-dev/ui"
```

---

## Task 6: Storybook stories

**Files:**
- Create: `packages/ui/src/components/inbox-popover.stories.tsx`

- [ ] **Step 6.1: Create Storybook stories**

Create `packages/ui/src/components/inbox-popover.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  InboxPopover,
  InboxTrigger,
  InboxContent,
  useInboxState,
  type NotificationItemData,
} from "./inbox-popover";

const SAMPLE_ITEMS: NotificationItemData[] = [
  {
    id: "1",
    title: <span>Deployment <strong>prod-v3.2</strong> succeeded</span>,
    icon: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 2 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "2",
    title: <span><strong>KJ</strong> commented on Dashboard PR</span>,
    body: '"Looks great, just one nit on line 42..."',
    avatarFallback: "KJ",
    timestamp: new Date(Date.now() - 14 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "3",
    title: <span>Invoice <strong>#1042</strong> paid</span>,
    icon: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 3_600_000),
    read: true,
    href: "#",
  },
];

function LiveDemo({ initialItems }: { initialItems: NotificationItemData[] }) {
  const { items, unreadCount, markRead, markAllRead, dismiss } = useInboxState(initialItems);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "24px" }}>
      <InboxPopover>
        <InboxTrigger unreadCount={unreadCount} />
        <InboxContent
          items={items}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          viewAllHref="#"
        />
      </InboxPopover>
    </div>
  );
}

const meta: Meta = {
  title: "Components/InboxPopover",
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <LiveDemo initialItems={SAMPLE_ITEMS} />,
};

export const Empty: Story = {
  render: () => <LiveDemo initialItems={[]} />,
};

export const AllRead: Story = {
  render: () => (
    <LiveDemo initialItems={SAMPLE_ITEMS.map((i) => ({ ...i, read: true }))} />
  ),
};
```

- [ ] **Step 6.2: Commit**

```bash
git add packages/ui/src/components/inbox-popover.stories.tsx
git commit -m "feat(inbox-popover): add Storybook stories (Default, Empty, AllRead)"
```

---

## Task 7: Showcase demo in `site/`

**Files:**
- Modify: `site/src/main.tsx` (add InboxPopover demo section)

- [ ] **Step 7.1: Locate the correct insertion point**

```bash
grep -n "NotificationCenter\|InboxPopover\|Toast\|Overlay\|P2\|nice-to-have" site/src/main.tsx | head -20
```

Use the output to find where to add the new section. Look for a section near `Toast` or at the end of the component gallery.

- [ ] **Step 7.2: Add `InboxPopover` showcase section**

In `site/src/main.tsx`, import the component and add a demo section. Insert after the `Toast` section or at the end of the gallery, following the existing section pattern:

```tsx
// Add to imports at the top:
import {
  InboxPopover,
  InboxTrigger,
  InboxContent,
  useInboxState,
  type NotificationItemData,
} from "@kjaniec-dev/ui";

// Demo component (define near other demo components):
const INBOX_ITEMS: NotificationItemData[] = [
  {
    id: "i1",
    title: <span>Deployment <strong>prod-v3.2</strong> succeeded</span>,
    icon: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 2 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "i2",
    title: <span><strong>Alex</strong> approved your PR</span>,
    body: '"LGTM 🚀 Merging now."',
    avatarFallback: "AL",
    timestamp: new Date(Date.now() - 20 * 60_000),
    read: false,
    href: "#",
  },
  {
    id: "i3",
    title: <span>Invoice <strong>#1042</strong> paid</span>,
    icon: (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    timestamp: new Date(Date.now() - 3_600_000),
    read: true,
    href: "#",
  },
];

function InboxDemo() {
  const { items, unreadCount, markAllRead, dismiss } = useInboxState(INBOX_ITEMS);
  return (
    <InboxPopover>
      <InboxTrigger unreadCount={unreadCount} />
      <InboxContent
        items={items}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
        viewAllHref="#"
      />
    </InboxPopover>
  );
}

// Add section in the JSX (after the Toast section or at the end of the gallery):
<section id="inbox-popover">
  <h2>InboxPopover</h2>
  <p>Bell-triggered notification inbox with unread badge, mark-all-read, and per-item dismiss.</p>
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <InboxDemo />
  </div>
</section>
```

- [ ] **Step 7.3: Verify dev server renders the new section**

```bash
npm run dev --workspace=site
```

Open `http://localhost:5173` (or the port shown) and confirm the InboxPopover section appears and is interactive (click trigger, dismiss items, mark all read).

- [ ] **Step 7.4: Run full monorepo test suite**

```bash
npm test
```

Expected: all tests across `@kjaniec-dev/ui`, `@kjaniec-dev/ui-mcp`, and `@kjaniec-dev/site` pass.

- [ ] **Step 7.5: Commit**

```bash
git add site/src/main.tsx
git commit -m "feat(inbox-popover): add showcase demo section to site/"
```

---

## Task 8: Backlog + final verification

**Files:**
- Modify: `docs/BACKLOG.md`

- [ ] **Step 8.1: Mark `NotificationCenter / InboxPopover` as done in the backlog**

In `docs/BACKLOG.md`, change:
```
- [ ] `NotificationCenter` / `InboxPopover` — persistent notifications (bell icon in the top nav), complements the existing `Toast`.
```
to:
```
- [x] `NotificationCenter` / `InboxPopover` — persistent notifications (bell icon in the top nav), complements the existing `Toast`.
```

- [ ] **Step 8.2: Run the full monorepo test suite one final time**

```bash
npm test
```

Expected output includes:
```
> @kjaniec-dev/ui@x.x.x test
✓ src/components/inbox-popover.test.tsx (N tests)
...
Test Files  30 passed (30)
```

- [ ] **Step 8.3: Final commit**

```bash
git add docs/BACKLOG.md
git commit -m "chore: mark InboxPopover as complete in BACKLOG"
```
