# Mobile View Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance mobile responsiveness across 5 core UI Kit components (`DateRangePicker`, `DataTable`, `Stepper`, `InboxPopover`, `AppShell`) for small-screen devices (< 640px).

**Architecture:** Implement responsive Tailwind CSS utilities and responsive React component states/props to adapt layouts automatically on mobile screens, preserving desktop behavior while optimizing touch targets and scroll containers.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Vitest, Testing Library.

---

### Task 1: DateRangePicker & RangeCalendar Mobile Responsiveness

**Files:**
- Modify: `packages/ui/src/components/range-calendar.tsx:150-184`
- Modify: `packages/ui/src/components/date-range-picker.tsx:168-176`
- Modify: `packages/ui/src/components/calendar-grid.tsx`
- Test: `packages/ui/src/components/date-range-picker.test.tsx`

- [ ] **Step 1: Write failing test for mobile single-month rendering capability**

Add a test in `packages/ui/src/components/date-range-picker.test.tsx`:
```tsx
it("renders single month grid when singleMonth prop is true on RangeCalendar", () => {
  render(<RangeCalendar singleMonth />);
  expect(screen.getAllByRole("grid")).toHaveLength(1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: FAIL with `singleMonth` property not supported or 2 grids returned.

- [ ] **Step 3: Implement singleMonth & responsive layout in RangeCalendar, CalendarGrid, and DateRangePicker**

In `packages/ui/src/components/range-calendar.tsx`:
Add `singleMonth?: boolean` prop to `RangeCalendarProps`.
Update layout container from hardcoded `flex gap-6` to conditional layout:
```tsx
export interface RangeCalendarProps {
  // ... existing props
  /** Force rendering 1 month instead of 2 side-by-side. Domyślnie false lub auto na mobile. */
  singleMonth?: boolean;
}
```
In `RangeCalendar` JSX:
```tsx
const showSingleMonth = singleMonth;

return (
  <div ref={ref} className={cn("flex flex-col sm:flex-row gap-4 sm:gap-6 select-none max-w-full overflow-hidden", className)}>
    <div className="w-full sm:w-[280px]">
      <div className="flex items-center justify-between mb-2">
        {navButton("prev")}
        <span className="text-sm font-medium text-foreground">{monthLabelFormat.format(leftMonth)}</span>
        {showSingleMonth ? navButton("next") : <span className="w-[26px]" aria-hidden="true" />}
      </div>
      <CalendarGrid
        viewMonth={leftMonth}
        isDayDisabled={isDayDisabled}
        cellState={cellState}
        onSelectDay={handleSelectDay}
        onFocusDay={handleFocusDay}
        initialFocusDate={pendingStart ?? range.start ?? new Date()}
      />
    </div>
    {!showSingleMonth && (
      <div className="hidden sm:block w-[280px]">
        <div className="flex items-center justify-between mb-2">
          <span className="w-[26px]" aria-hidden="true" />
          <span className="text-sm font-medium text-foreground">{monthLabelFormat.format(rightMonth)}</span>
          {navButton("next")}
        </div>
        <CalendarGrid
          viewMonth={rightMonth}
          isDayDisabled={isDayDisabled}
          cellState={cellState}
          onSelectDay={handleSelectDay}
          onFocusDay={handleFocusDay}
          initialFocusDate={pendingStart ?? range.start ?? new Date()}
        />
      </div>
    )}
  </div>
);
```

In `packages/ui/src/components/date-range-picker.tsx`:
Update panel popup wrapper styling to be responsive on small screens:
```tsx
className="absolute z-40 top-[calc(100%+6px)] left-0 sm:left-auto right-0 sm:right-auto max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-kj-md shadow-kj-lg p-3 animate-[kjpop_.12s_ease]"
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add packages/ui/src/components/range-calendar.tsx packages/ui/src/components/date-range-picker.tsx packages/ui/src/components/date-range-picker.test.tsx
git commit -m "feat(ui): add responsive single-month mode to RangeCalendar and DateRangePicker"
```

---

### Task 2: DataTable Mobile Horizontal Scroll Fix

**Files:**
- Modify: `packages/ui/src/components/data-table.tsx:123`
- Modify: `packages/ui/src/components/table.tsx:5-10`
- Test: `packages/ui/src/components/data-table.test.tsx`

- [ ] **Step 1: Write failing unit test for DataTable container overflow-x-auto**

In `packages/ui/src/components/data-table.test.tsx`:
```tsx
it("renders TableWrap with horizontal scroll container enabled", () => {
  const { container } = render(
    <DataTable
      columns={[{ header: "Col 1", accessor: () => "Val 1" }]}
      data={[{ id: 1 }]}
    />
  );
  const tableWrap = container.querySelector(".overflow-x-auto");
  expect(tableWrap).toBeInTheDocument();
  expect(tableWrap).not.toHaveClass("overflow-hidden");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: FAIL (currently has `overflow-hidden` class overriding `overflow-x-auto`).

- [ ] **Step 3: Fix TableWrap className in DataTable**

In `packages/ui/src/components/data-table.tsx`:
Replace line 123:
```tsx
// Before:
<TableWrap className="relative overflow-hidden" {...props}>
// After:
<TableWrap className="relative overflow-x-auto overflow-y-hidden [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch]" {...props}>
```

In `packages/ui/src/components/table.tsx`:
Ensure `TableWrap` applies `w-full max-w-full overflow-x-auto`.

- [ ] **Step 4: Run test to verify pass**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add packages/ui/src/components/data-table.tsx packages/ui/src/components/table.tsx packages/ui/src/components/data-table.test.tsx
git commit -m "fix(ui): enable horizontal touch scroll on DataTable"
```

---

### Task 3: Stepper Responsive Vertical Orientation

**Files:**
- Modify: `packages/ui/src/components/stepper.tsx:103-225`
- Test: `packages/ui/src/components/stepper.test.tsx`

- [ ] **Step 1: Write failing unit test for responsive stepper list classes**

In `packages/ui/src/components/stepper.test.tsx`:
```tsx
it("applies responsive orientation classes when responsive prop is true", () => {
  render(
    <Stepper orientation="horizontal" responsive>
      <StepperList data-testid="stepper-list">
        <StepperItem value={0}>Step 1</StepperItem>
      </StepperList>
    </Stepper>
  );
  const list = screen.getByTestId("stepper-list");
  expect(list.className).toContain("flex-col");
  expect(list.className).toContain("sm:flex-row");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: FAIL (`responsive` prop not recognized / flex-col classes absent).

- [ ] **Step 3: Implement responsive prop & mobile vertical stacking in Stepper**

In `packages/ui/src/components/stepper.tsx`:
Add `responsive?: boolean` (default `true`) to `StepperProps` and context.
Update `StepperList` className calculation:
```tsx
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  responsive?: boolean;
  linear?: boolean;
}
```

In `StepperList`:
```tsx
const isResponsiveHorizontal = ctx.orientation === "horizontal" && (ctx.responsive ?? true);

const orientationClass = isResponsiveHorizontal
  ? "flex flex-col sm:flex-row items-start sm:items-center justify-between w-full relative gap-4"
  : ctx.orientation === "horizontal"
  ? "flex items-center justify-between w-full relative gap-4"
  : "flex flex-col items-start gap-6 relative w-full";
```

Update `StepperSeparator`:
```tsx
const isResponsiveHorizontal = ctx.orientation === "horizontal" && (ctx.responsive ?? true);

const separatorClass = isResponsiveHorizontal
  ? "w-[2px] h-6 sm:w-auto sm:h-[2px] sm:flex-1 bg-border transition-all duration-300 ml-4 sm:ml-0"
  : ctx.orientation === "horizontal"
  ? "flex-1 h-[2px] bg-border transition-all duration-300"
  : "w-[2px] bg-border absolute left-[17px] top-8 bottom-0 -ml-px z-0";
```

- [ ] **Step 4: Run test to verify pass**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add packages/ui/src/components/stepper.tsx packages/ui/src/components/stepper.test.tsx
git commit -m "feat(ui): add responsive vertical auto-stacking to Stepper"
```

---

### Task 4: InboxPopover Smart Responsive Alignment and Max Width

**Files:**
- Modify: `packages/ui/src/components/inbox-popover.tsx:374-485`
- Test: `packages/ui/src/components/inbox-popover.test.tsx`

- [ ] **Step 1: Write failing unit test for InboxContent responsive alignment and max-width**

In `packages/ui/src/components/inbox-popover.test.tsx`:
```tsx
it("renders InboxContent with responsive max-width and alignment props", () => {
  render(
    <InboxPopover open>
      <InboxTrigger unreadCount={2} />
      <InboxContent items={[]} align="start" data-testid="inbox-content" />
    </InboxPopover>
  );
  const content = screen.getByRole("dialog");
  expect(content.className).toContain("max-w-[calc(100vw-1.5rem)]");
  expect(content.className).toContain("left-0");
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: FAIL (`align` prop not supported / `left-0` / max-width classes missing).

- [ ] **Step 3: Implement align prop and responsive bounds in InboxContent**

In `packages/ui/src/components/inbox-popover.tsx`:
Add `align?: "auto" | "start" | "end"` (default `"auto"`) to `InboxContentProps`.
Update `InboxContent` wrapper className & style:
```tsx
export interface InboxContentProps {
  items: NotificationItemData[];
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyState?: React.ReactNode;
  align?: "auto" | "start" | "end";
  width?: number | string;
  maxHeight?: number | string;
  className?: string;
}
```

In `InboxContent` JSX:
```tsx
const alignClass = {
  start: "left-0 top-[calc(100%+6px)]",
  end: "right-0 top-[calc(100%+6px)]",
  auto: "right-0 sm:right-0 left-auto top-[calc(100%+6px)] max-sm:left-1/2 max-sm:-translate-x-1/2",
}[align ?? "auto"];

return (
  <div
    ref={ref}
    role="dialog"
    aria-label="Notifications"
    tabIndex={-1}
    style={{ width: typeof width === "number" ? `${width}px` : width }}
    className={cn(
      "absolute z-40 max-w-[calc(100vw-1.5rem)]",
      "bg-surface border border-border rounded-kj-md shadow-kj-lg outline-none",
      "animate-[kjpop_.12s_ease]",
      alignClass,
      className
    )}
  >
```

- [ ] **Step 4: Run test to verify pass**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add packages/ui/src/components/inbox-popover.tsx packages/ui/src/components/inbox-popover.test.tsx
git commit -m "fix(ui): add responsive alignment and max-width bounds to InboxPopover"
```

---

### Task 5: AppShell Mobile Padding, Scroll Lock, and BottomNav Slot

**Files:**
- Modify: `packages/ui/src/components/app-shell.tsx`
- Test: `packages/ui/src/components/app-shell.test.tsx`

- [ ] **Step 1: Write failing unit test for AppShell bottomNav rendering and scroll lock**

In `packages/ui/src/components/app-shell.test.tsx`:
```tsx
it("renders bottomNav slot when passed to AppShell", () => {
  render(
    <AppShell bottomNav={<nav data-testid="mobile-bottom-nav">Bottom Nav</nav>}>
      <div>Content</div>
    </AppShell>
  );
  expect(screen.getByTestId("mobile-bottom-nav")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: FAIL (`bottomNav` prop not recognized).

- [ ] **Step 3: Implement bottomNav slot, body scroll lock, and mobile main padding**

In `packages/ui/src/components/app-shell.tsx`:
1. Add `bottomNav?: React.ReactNode` to `AppShellProps`.
2. Update `AppShellMain` default padding from `px-4 sm:px-6 lg:px-8 py-8 md:py-12` to `px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-12`.
3. In `AppShellHeader`: Add body scroll lock effect when `mobileOpen` changes:
```tsx
React.useEffect(() => {
  if (mobileOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [mobileOpen]);
```
4. Render `bottomNav` in `AppShell` main container:
```tsx
{bottomNav && (
  <div className="md:hidden sticky bottom-0 z-30 w-full bg-surface border-t border-border">
    {bottomNav}
  </div>
)}
```

- [ ] **Step 4: Run test suite to verify pass**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add packages/ui/src/components/app-shell.tsx packages/ui/src/components/app-shell.test.tsx
git commit -m "feat(ui): update AppShell mobile padding, add body scroll lock and bottomNav slot"
```

---

### Task 6: Comprehensive Verification & Typecheck

- [ ] **Step 1: Run workspace typecheck**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 2: Run full test suite**

Run: `npm run test`
Expected: All tests PASS.

- [ ] **Step 3: Final Commit**

```bash
git commit --allow-empty -m "chore: complete mobile view improvements implementation"
```
