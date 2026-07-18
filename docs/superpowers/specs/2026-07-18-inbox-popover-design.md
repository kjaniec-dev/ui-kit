# InboxPopover / NotificationCenter Design Specification

**Date:** 2026-07-18  
**Status:** Approved  
**Target Package:** `@kjaniec-dev/ui`  

---

## 1. Overview & Objectives

The `InboxPopover` suite provides a persistent, bell-triggered notification inbox for SaaS and dashboard UIs. It complements the existing ephemeral `Toast` component by offering a durable, scrollable list of notifications the user can revisit, mark as read, and dismiss.

### Key Deliverables

1. `InboxPopover` — Compound root built on the existing `Popover` primitive; positions the panel relative to the trigger.
2. `InboxTrigger` — Bell-icon button with an unread-count badge; badge hides when count is zero.
3. `InboxContent` — Panel shell: header ("Notifications" + "Mark all read"), scrollable notification list, empty state, and a "View all" footer link.
4. `NotificationItem` — Single notification row: flexible icon/avatar slot, title, optional body line, relative timestamp, unread indicator dot, and per-item dismiss button.
5. `useInboxState` — Optional convenience hook for managing a local `items[]` array with `markRead`, `markAllRead`, and `dismiss` helpers.
6. Unit tests — Vitest / RTL coverage for all interactive states and keyboard behaviour.
7. Storybook story + showcase integration in `site/`.

---

## 2. Architecture & File Structure

```
packages/ui/src/components/
├── inbox-popover.tsx        # All exports in one file (component is self-contained)
├── inbox-popover.test.tsx   # Vitest / RTL unit tests
└── inbox-popover.stories.tsx
```

All exports added to `packages/ui/src/index.ts` and `packages/ui/src/components/index.ts`.

### Why a single file

The component is moderately sized (~250–350 lines). A single file keeps imports trivial for consumers and avoids premature splitting. If it grows beyond ~400 lines in a future iteration, split into a `inbox-popover/` subdirectory mirroring the `rating/` pattern.

---

## 3. Data Types

```typescript
export interface NotificationItemData {
  /** Unique stable identifier. */
  id: string;
  /** Primary text — the notification message. Accepts ReactNode for bold spans. */
  title: React.ReactNode;
  /** Optional second line (quote, preview excerpt, etc.). */
  body?: React.ReactNode;
  /**
   * Leading visual. Rendered as a 28×28 rounded circle.
   * - SVG node → icon mode (coloured background auto-applied).
   * - String starting with "http" or "/" → avatar <img> mode.
   * - avatarFallback provided without avatarSrc → initials mode.
   * When both icon and avatarSrc are provided, avatarSrc wins.
   */
  icon?: React.ReactNode;
  avatarSrc?: string;
  /** 1–2 character initials shown when avatarSrc is absent. */
  avatarFallback?: string;
  /** Displayed as a relative time string ("2 min ago", "1 hour ago", "Yesterday"). */
  timestamp: Date | string;
  /** Defaults to false (unread). */
  read?: boolean;
  /**
   * If provided, clicking the item navigates to this URL (rendered as <a>).
   * If omitted, the row renders as a <button>.
   * In both cases, clicking marks the item read and calls onClick.
   */
  href?: string;
  /** Additional click handler called after mark-read. */
  onClick?: (id: string) => void;
}
```

---

## 4. Component API

### 4.1 `InboxPopover`

Thin wrapper around `Popover` — passes `open` / `onOpenChange` through.

```typescript
export interface InboxPopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
```

### 4.2 `InboxTrigger`

```typescript
export interface InboxTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number shown in the badge. Badge hidden when 0 or undefined. */
  unreadCount?: number;
  /** Accessible label (default: "Notifications"). */
  label?: string;
}
```

- Renders a `<button>` wrapping a bell SVG + absolute-positioned badge.
- Badge colour: `bg-primary` (matches the kit's primary token).
- Badge shape: pill (`rounded-full`), min-width 16 px, shows up to "99+" for counts > 99.
- Delegates open/close to `InboxPopover` via context (mirrors `PopoverTrigger` pattern).

### 4.3 `InboxContent`

```typescript
export interface InboxContentProps {
  /** Notification items to render. */
  items: NotificationItemData[];
  /** Called when "Mark all read" is clicked. */
  onMarkAllRead?: () => void;
  /** Called when a notification's dismiss button (×) is clicked. */
  onDismiss?: (id: string) => void;
  /**
   * If provided, renders a "View all notifications →" footer link.
   */
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Empty state content. Defaults to a bell icon + "All caught up" message. */
  emptyState?: React.ReactNode;
  /** Panel width (default: 360px). */
  width?: number | string;
  /** Max height of the scrollable list region (default: 320px). */
  maxHeight?: number | string;
  className?: string;
}
```

Layout structure:
```
┌─────────────────────────────────────┐
│ Notifications           Mark all read│  ← header
├─────────────────────────────────────┤
│ [icon]  Title text         2m ago ×  │  ← NotificationItem (unread)
│ [avtr]  Title + body       1h ago ×  │  ← NotificationItem (unread, with body)
│ [icon]  Title text         1d ago ×  │  ← NotificationItem (read)
│         …scrollable…                 │
├─────────────────────────────────────┤
│         View all notifications →    │  ← footer (optional)
└─────────────────────────────────────┘
```

- "Mark all read" button is `disabled` (visually muted, `cursor-not-allowed`) when all items are already read or `items` is empty.
- Empty state replaces the list region when `items.length === 0`; footer is hidden in empty state.

### 4.4 `NotificationItem`

```typescript
export interface NotificationItemProps {
  item: NotificationItemData;
  onDismiss?: (id: string) => void;
  className?: string;
}
```

Row anatomy (left → right):
1. **Icon/Avatar** — 28×28 circle. Icon mode: coloured `bg-primary/10` background + SVG. Avatar mode: `<img>` with `avatarFallback` initials as fallback. Both icon and avatar are optional; if neither is provided the slot is omitted.
2. **Text block** — `title` (always), `body` (optional, second line, muted), `timestamp` (third line, small muted text).
3. **Actions block** (right-aligned):
   - **Dismiss `×`** — `opacity-0 group-hover:opacity-100 focus:opacity-100`. On touch devices (no hover), always visible. Calls `onDismiss(id)` and stops event propagation.
   - **Unread dot** — 7×7 circle: `bg-primary` (unread), transparent ring `border border-border` (read).

Click behaviour:
- `href` provided → row wraps in `<a href={href}>`. Click marks read + navigates + calls `item.onClick?.(id)`.
- No `href` → row is `<button>`. Click calls `item.onClick?.(id)`.
- Mark-read is the consumer's responsibility in both cases — `onClick` receives the id and the consumer updates their state.

### 4.5 `useInboxState` (optional helper hook)

```typescript
export function useInboxState(initial: NotificationItemData[]): {
  items: NotificationItemData[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}
```

Pure client-side state — no persistence. Intended for demos, Storybook stories, and simple apps. Production apps will drive state from a server/store and pass items directly to `InboxContent`.

---

## 5. Relative Timestamp Formatting

A small pure `formatRelativeTime(date: Date | string): string` utility co-located in the file:

| Age | Display |
|---|---|
| < 1 min | "Just now" |
| 1–59 min | "X min ago" |
| 1–23 h | "X hour ago" / "X hours ago" |
| 1 day | "Yesterday" |
| 2–6 days | "X days ago" |
| ≥ 7 days | Short locale date (e.g. "Jul 11") |

No external date library — uses `Date.now()` arithmetic.

---

## 6. Accessibility & Keyboard Support

- `InboxTrigger` button: `aria-label` (default "Notifications"), `aria-haspopup="dialog"`, `aria-expanded`.
- `InboxContent` panel: `role="dialog"`, `aria-label="Notifications"`, `tabIndex={-1}`, receives focus on open.
- `NotificationItem` rows: keyboard-focusable (`tabIndex={0}`).
- Dismiss button: `aria-label="Dismiss"`.
- Escape closes the popover and returns focus to `InboxTrigger`.
- "Mark all read" button: `aria-disabled` when nothing to mark.
- Unread dot: `aria-label="Unread"` on unread items; `aria-hidden` on read items.

---

## 7. Styling Tokens

Follows existing kit conventions (no custom CSS, Tailwind utilities only):

| Element | Token |
|---|---|
| Panel background | `bg-surface` |
| Panel border | `border-border` |
| Panel shadow | `shadow-kj-lg` |
| Panel radius | `rounded-kj-md` |
| Unread row tint | `bg-primary/[0.04]` |
| Unread dot | `bg-primary` |
| Header/footer dividers | `border-border` |
| "Mark all read" / "View all" | `text-primary` |

---

## 8. Verification Plan

1. **Unit tests (`inbox-popover.test.tsx`)**
   - Renders trigger with badge showing unread count.
   - Badge hidden when unread count is 0.
   - Opens panel on trigger click; closes on Escape; closes on outside click.
   - Renders notification items: icon mode, avatar mode, no-icon mode.
   - Renders `body` when provided; omits it when absent.
   - `formatRelativeTime` utility covers all age buckets.
   - Clicking an item calls `onClick(id)`.
   - Dismiss button calls `onDismiss(id)` and does not trigger row click.
   - "Mark all read" calls `onMarkAllRead`.
   - "Mark all read" is disabled when all items are read.
   - Empty state renders when `items` is empty.
   - `useInboxState`: `markRead`, `markAllRead`, `dismiss` update state correctly and `unreadCount` is accurate.

2. **Build & type check**
   - `npm run typecheck`
   - `npm run build`

3. **Showcase + Storybook**
   - Add a live `InboxPopover` demo in `site/src/main.tsx` with interactive mark-read and dismiss.
   - Add `inbox-popover.stories.tsx` with Default (3 items, 2 unread), Empty, and AllRead variants.
