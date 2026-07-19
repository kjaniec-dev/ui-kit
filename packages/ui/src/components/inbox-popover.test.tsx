import { describe, it, expect, afterEach, vi } from "vitest";
import { formatRelativeTime } from "./inbox-popover";

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
