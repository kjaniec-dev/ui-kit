import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  formatRelativeTime,
  useInboxState,
  InboxPopover,
  InboxTrigger,
  InboxContent,
  type NotificationItemData,
} from "./inbox-popover";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function makeDate(msAgo: number): Date {
    return new Date(Date.now() - msAgo);
  }

  it('returns "Just now" for dates less than 60 seconds ago', () => {
    expect(formatRelativeTime(makeDate(30_000))).toBe("Just now");
  });

  it('returns "X min ago" for dates 1–59 minutes ago', () => {
    expect(formatRelativeTime(makeDate(5 * 60_000))).toBe("5 min ago");
    expect(formatRelativeTime(makeDate(59 * 60_000))).toBe("59 min ago");
  });

  it('returns "X hour ago" / "X hours ago" for 1–23 hours ago', () => {
    expect(formatRelativeTime(makeDate(1 * 3_600_000))).toBe("1 hour ago");
    expect(formatRelativeTime(makeDate(3 * 3_600_000))).toBe("3 hours ago");
  });

  it('returns "Yesterday" for dates 1 day ago', () => {
    expect(formatRelativeTime(makeDate(24 * 3_600_000))).toBe("Yesterday");
  });

  it('returns "X days ago" for 2–6 days ago', () => {
    expect(formatRelativeTime(makeDate(3 * 86_400_000))).toBe("3 days ago");
  });

  it("returns a short locale date for dates 7+ days ago", () => {
    const result = formatRelativeTime(makeDate(10 * 86_400_000));
    // e.g. "Jul 8" — just check it's not one of the relative strings
    expect(result).not.toMatch(/ago|now|Yesterday/);
    expect(result.length).toBeGreaterThan(2);
  });

  it("accepts a string timestamp", () => {
    const iso = new Date(Date.now() - 2 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2 min ago");
  });

  it("returns empty string for unparseable date strings", () => {
    expect(formatRelativeTime("not-a-date")).toBe("");
  });

  it('still returns "Yesterday" for dates 47 hours ago (upper bound of floor window)', () => {
    expect(formatRelativeTime(makeDate(47 * 3_600_000))).toBe("Yesterday");
  });
});

// ---------------------------------------------------------------------------
// useInboxState tests
// ---------------------------------------------------------------------------

const makeItems = (): NotificationItemData[] => [
  { id: "1", title: "First", timestamp: new Date(), read: false },
  { id: "2", title: "Second", timestamp: new Date(), read: false },
  { id: "3", title: "Third", timestamp: new Date(), read: true },
];

describe("useInboxState", () => {
  it("initialises with correct unreadCount", () => {
    const { result } = renderHook(() => useInboxState(makeItems()));
    expect(result.current.unreadCount).toBe(2);
  });

  it("markRead sets a single item to read and decrements unreadCount", () => {
    const { result } = renderHook(() => useInboxState(makeItems()));
    act(() => result.current.markRead("1"));
    expect(result.current.items.find((i) => i.id === "1")?.read).toBe(true);
    expect(result.current.unreadCount).toBe(1);
  });

  it("markAllRead sets all items to read", () => {
    const { result } = renderHook(() => useInboxState(makeItems()));
    act(() => result.current.markAllRead());
    expect(result.current.items.every((i) => i.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("dismiss removes the item from the list", () => {
    const { result } = renderHook(() => useInboxState(makeItems()));
    act(() => result.current.dismiss("2"));
    expect(result.current.items.find((i) => i.id === "2")).toBeUndefined();
    expect(result.current.items).toHaveLength(2);
  });

  it("dismiss of an unread item decrements unreadCount", () => {
    const { result } = renderHook(() => useInboxState(makeItems()));
    act(() => result.current.dismiss("1")); // id "1" is unread
    expect(result.current.unreadCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// InboxTrigger tests
// ---------------------------------------------------------------------------

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
