export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

// setMonth/setFullYear roll over into the next month when the target month is
// shorter than the current day-of-month (e.g. Jan 31 + 1 month -> Mar 3, not
// Feb 28). Clamp the day to the target month's actual length to avoid that.
function clampToMonth(year: number, month: number, day: number): Date {
  const daysInTarget = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, daysInTarget));
}

export function addMonthsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear(), d.getMonth() + n, d.getDate());
}

export function addYearsClamped(d: Date, n: number): Date {
  return clampToMonth(d.getFullYear() + n, d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfWeek(d: Date): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() - r.getDay());
  return r;
}

export function buildGridDays(viewMonth: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(viewMonth));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export const monthLabelFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
export const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });
const weekdayShortFormat = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const weekdayLongFormat = new Intl.DateTimeFormat(undefined, { weekday: "long" });

export const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
  const d = addDays(startOfWeek(new Date()), i);
  return { key: i, short: weekdayShortFormat.format(d), long: weekdayLongFormat.format(d) };
});
