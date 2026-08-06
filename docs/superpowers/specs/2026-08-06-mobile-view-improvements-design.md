# Specification: Mobile View Improvements for UI Kit

**Date:** 2026-08-06  
**Status:** Approved  
**Scope:** `@kjaniec-dev/ui` package components (DateRangePicker, DataTable, Stepper, InboxPopover, AppShell)

---

## 1. Overview

This specification details mobile responsiveness fixes and layout enhancements across 5 core UI kit components to deliver a polished experience on small-screen devices (< 640px viewport width).

---

## 2. Component Specifications

### 2.1 DateRangePicker & RangeCalendar
* **Problem:** `RangeCalendar` forces two 280px calendar grids side-by-side (`flex gap-6` = ~584px width), causing severe horizontal overflow and cell squeezing on mobile devices (< 640px).
* **Changes:**
  * In `RangeCalendar`:
    * Add media query / responsive state logic so on viewports `< 640px` (or when `responsive={true}` is set), `RangeCalendar` displays **1 month** view with month-by-month navigation buttons instead of two side-by-side months.
    * Expand touch target height for calendar date cells to min 40px hit area on mobile viewports for effortless finger navigation.
  * In `DateRangePicker`:
    * Update the popover panel wrapper to use `max-w-[calc(100vw-2rem)]` and auto-fit positioning on mobile screens.

### 2.2 DataTable
* **Problem:** In `DataTable`, `TableWrap` is rendered with `className="relative overflow-hidden"`. In Tailwind CSS, `overflow-hidden` overrides `TableWrap`'s built-in `overflow-x-auto`, blocking horizontal scrolling.
* **Changes:**
  * Change `TableWrap` container props in `packages/ui/src/components/data-table.tsx` from `className="relative overflow-hidden"` to `className="relative overflow-x-auto overflow-y-hidden"`.
  * Add smooth touch scrolling (`-webkit-overflow-scrolling: touch`).
  * Add visual indicator (gradient shadow on the right edge of table wrapper when scrollable content extends offscreen).

### 2.3 Stepper
* **Problem:** Horizontal `Stepper` on mobile screens squishes step titles, icons, and connector lines.
* **Changes:**
  * In `Stepper`: Add prop `responsive?: boolean` (default `true`).
  * In `StepperList`: When `orientation="horizontal"` and `responsive={true}`, automatically apply `flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between` on small screens (`< sm`).
  * Ensure step connector lines and step titles smoothly adapt alignment in vertical responsive mode.

### 2.4 InboxPopover
* **Problem:** `InboxContent` relies on fixed `right-0` positioning and fixed width `width = 360`, causing the popover to extend past the left viewport edge ("wciete z lewej") when the trigger is on the left side or on narrow mobile screens.
* **Changes:**
  * In `InboxContent`:
    * Add `align?: "auto" | "start" | "end"` prop (defaulting to `"auto"`).
    * Add responsive max width `max-w-[calc(100vw-1.5rem)]` and safe margins (`left-0 sm:left-auto right-0` or boundary check) so the popover remains visible within viewport bounds regardless of trigger position.

### 2.5 AppShell
* **Problem:** Large vertical padding on mobile main content (`py-8 md:py-12`) reduces readable screen space; mobile menu drawer lacks scroll lock on background content.
* **Changes:**
  * In `AppShellMain`: Update default padding class to `py-4 sm:py-6 md:py-12`.
  * In `AppShellHeader`: Add `body scroll lock` (`document.body.style.overflow = "hidden"`) when `mobileOpen` is active.
  * In `AppShell`: Add optional `bottomNav?: React.ReactNode` prop and render slot to integrate mobile bottom navigation bars.

---

## 3. Verification & Testing Criteria

* All component unit tests (`*.test.tsx`) pass without regressions.
* Storybook stories updated for mobile responsive previews where relevant.
* Build succeeds clean without TypeScript errors (`npm run build`).
