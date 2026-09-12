# Sprint 4: Component Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Achieve 100% component test coverage for all remaining 34 primitive and layout components in `packages/ui/src/components/`, ensuring behavioral reliability, accessibility compliance, and variant correctness.

**Architecture:** Each component receives a dedicated `[component-name].test.tsx` using Vitest and `@testing-library/react`. Tests verify standard DOM output, variant styling classes, accessibility attributes (`role`, `aria-*`, tabIndex), disabled/loading states, and interactive event handlers (`onClick`, `onChange`, keyboard navigation).

**Tech Stack:** Vitest, `@testing-library/react`, `@testing-library/jest-dom`, React 19, TypeScript.

**Spec:** `docs/ROADMAP.md` (Sprint 4: Pokrycie testami jednostkowymi brakujących 34 komponentów prymitywnych).

## Global Constraints
- Every test file must import from `./[component-name]` or the relevant local component file.
- Use `describe` and `it` from `vitest` and `render`, `screen`, `fireEvent` from `@testing-library/react`.
- Verify user-facing roles and accessible queries (`getByRole`, `getByText`, `getByLabelText`) rather than implementation details.
- Avoid loose `any` typing.
- Run `npm test` after each task to ensure zero regressions across the monorepo.

---

### Task 1: Batch 1A — Form Controls & Actions (Button, Input, Checkbox, Switch)

**Files:**
- Create: `packages/ui/src/components/button.test.tsx`
- Create: `packages/ui/src/components/input.test.tsx`
- Create: `packages/ui/src/components/checkbox.test.tsx`
- Create: `packages/ui/src/components/switch.test.tsx`

**Interfaces:**
- `Button`: `variant`, `size`, `loading`, `leadingIcon`, `trailingIcon`, `disabled`, `onClick`.
- `Input`: `error`, `leadingIcon`, `onChange`, plus `Textarea` and `TextField`.
- `Checkbox`: `label`, `id`, `checked`, `onChange`, plus `Radio` and `CheckboxField`.
- `Switch`: `label`, `id`, `checked`, `defaultChecked`, `onChange`, `aria-checked`.

- [x] **Step 1: Write tests for Button (`button.test.tsx`)**
- [x] **Step 2: Write tests for Input, Textarea, TextField (`input.test.tsx`)**
- [x] **Step 3: Write tests for Checkbox, Radio, CheckboxField (`checkbox.test.tsx`)**
- [x] **Step 4: Write tests for Switch (`switch.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 1A passes**
- [x] **Step 6: Commit Batch 1A**

---

### Task 2: Batch 1B — Sliders, Segmented & Form Helpers (Slider, Segmented, Field, FormField)

**Files:**
- Create: `packages/ui/src/components/slider.test.tsx`
- Create: `packages/ui/src/components/segmented.test.tsx`
- Create: `packages/ui/src/components/field.test.tsx`
- Create: `packages/ui/src/components/form-field.test.tsx`

**Interfaces:**
- `Slider`: `value`, `defaultValue`, `min`, `max`, `onChange`, linear gradient background calculation.
- `Segmented`: `options`, `value`, `onChange`, `role="tablist"`, `aria-selected`.
- `Field`: `Label` (with `required` asterisk), `Hint` (standard vs `error`), `Field` wrapper.
- `FormField`: `label`, `hint`, `error`, `required`, cloneElement attaching `aria-describedby` and `aria-invalid`.

- [x] **Step 1: Write tests for Slider (`slider.test.tsx`)**
- [x] **Step 2: Write tests for Segmented (`segmented.test.tsx`)**
- [x] **Step 3: Write tests for Field, Label, Hint (`field.test.tsx`)**
- [x] **Step 4: Write tests for FormField (`form-field.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 1B passes**
- [x] **Step 6: Commit Batch 1B**

---

### Task 3: Batch 1C — Indicators & Floating Action (Badge, Avatar, Spinner, Fab)

**Files:**
- Create: `packages/ui/src/components/badge.test.tsx`
- Create: `packages/ui/src/components/avatar.test.tsx`
- Create: `packages/ui/src/components/spinner.test.tsx`
- Create: `packages/ui/src/components/fab.test.tsx`

**Interfaces:**
- `Badge`: `variant` (neutral, primary, success, danger, etc.), `dot`.
- `Avatar`: `src`, `alt`, `size`, `tone`, `status` dot indicator, `AvatarGroup`.
- `Spinner`: `role="status"`, `aria-label="Loading"`, `size` styling.
- `Fab`: `icon`, `label`, `position`, `mobileOnly`, `loading`, `disabled`.

- [x] **Step 1: Write tests for Badge (`badge.test.tsx`)**
- [x] **Step 2: Write tests for Avatar & AvatarGroup (`avatar.test.tsx`)**
- [x] **Step 3: Write tests for Spinner (`spinner.test.tsx`)**
- [x] **Step 4: Write tests for Fab (`fab.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 1C passes**
- [x] **Step 6: Commit Batch 1C**

---

### Task 4: Batch 2A — Feedback & Disclosure (Alert, Accordion, Breadcrumb, Pagination)

**Files:**
- Create: `packages/ui/src/components/alert.test.tsx`
- Create: `packages/ui/src/components/accordion.test.tsx`
- Create: `packages/ui/src/components/breadcrumb.test.tsx`
- Create: `packages/ui/src/components/pagination.test.tsx`

**Interfaces:**
- `Alert`: `role="alert"`, `variant` (info, success, warning, danger), `title`, `icon`, children.
- `Accordion`: `type="single" | "multiple"`, default values, expanding/collapsing triggers and content.
- `Breadcrumb`: `role="navigation"`, `BreadcrumbItem` with `current` (`aria-current="page"`), `BreadcrumbSeparator`.
- `Pagination`: `page`, `pageCount`, `onPageChange`, previous/next navigation buttons, ellipsis rendering.

- [x] **Step 1: Write tests for Alert (`alert.test.tsx`)**
- [x] **Step 2: Write tests for Accordion (`accordion.test.tsx`)**
- [x] **Step 3: Write tests for Breadcrumb (`breadcrumb.test.tsx`)**
- [x] **Step 4: Write tests for Pagination (`pagination.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 2A passes**
- [x] **Step 6: Commit Batch 2A**

---

### Task 5: Batch 2B — Progress, Stats & Cards (Progress, Stat, MetricCard, Card)

**Files:**
- Create: `packages/ui/src/components/progress.test.tsx`
- Create: `packages/ui/src/components/stat.test.tsx`
- Create: `packages/ui/src/components/metric-card.test.tsx`
- Create: `packages/ui/src/components/card.test.tsx`

**Interfaces:**
- `Progress`: `role="progressbar"`, `aria-valuenow`, `value` clamped 0-100, `tone` variants.
- `Stat`: `label`, `value`, `delta`, `trend` (up/down).
- `MetricCard`: `title`, `value`, `trend`, `trendDirection`, `description`, `icon`.
- `Card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `elevated`, `interactive`, `as` polymorphism.

- [x] **Step 1: Write tests for Progress (`progress.test.tsx`)**
- [x] **Step 2: Write tests for Stat (`stat.test.tsx`)**
- [x] **Step 3: Write tests for MetricCard (`metric-card.test.tsx`)**
- [x] **Step 4: Write tests for Card suite (`card.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 2B passes**
- [x] **Step 6: Commit Batch 2B**

---

### Task 6: Batch 2C — Tables & Empty/Error States (Table, TableToolbar, EmptyState, ErrorState)

**Files:**
- Create: `packages/ui/src/components/table.test.tsx`
- Create: `packages/ui/src/components/table-toolbar.test.tsx`
- Create: `packages/ui/src/components/empty-state.test.tsx`
- Create: `packages/ui/src/components/error-state.test.tsx`

**Interfaces:**
- `Table`: `TableWrap`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` (numeric alignment).
- `TableToolbar`: `searchQuery`, `onSearchChange`, `actions`, `filters`.
- `EmptyState`: `icon`, `title`, `description`, `action`.
- `ErrorState`: `title`, `message`, `onRetry`, `retryLabel`.

- [x] **Step 1: Write tests for Table suite (`table.test.tsx`)**
- [x] **Step 2: Write tests for TableToolbar (`table-toolbar.test.tsx`)**
- [x] **Step 3: Write tests for EmptyState (`empty-state.test.tsx`)**
- [x] **Step 4: Write tests for ErrorState (`error-state.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 2C passes**
- [x] **Step 6: Commit Batch 2C**

---

### Task 7: Batch 3A — Headers & Navigation (PageHeader, SidebarNav, BottomNavigation)

**Files:**
- Create: `packages/ui/src/components/page-header.test.tsx`
- Create: `packages/ui/src/components/sidebar-nav.test.tsx`
- Create: `packages/ui/src/components/bottom-navigation.test.tsx`

**Interfaces:**
- `PageHeader`: `eyebrow`, `title`, `description`, `actions`.
- `SidebarNav`: `groups`, `currentHref`, item icons, active states, badges, link vs button rendering.
- `BottomNavigation`: `items`, `showLabels` ('always' | 'active' | 'never'), `fixed`, active item highlight, badges.

- [x] **Step 1: Write tests for PageHeader (`page-header.test.tsx`)**
- [x] **Step 2: Write tests for SidebarNav (`sidebar-nav.test.tsx`)**
- [x] **Step 3: Write tests for BottomNavigation (`bottom-navigation.test.tsx`)**
- [x] **Step 4: Run tests to verify Batch 3A passes**
- [x] **Step 5: Commit Batch 3A**

---

### Task 8: Batch 3B — Layout Shells (SettingsLayout, DashboardShell, DetailPageLayout)

**Files:**
- Create: `packages/ui/src/components/settings-layout.test.tsx`
- Create: `packages/ui/src/components/dashboard-shell.test.tsx`
- Create: `packages/ui/src/components/detail-page-layout.test.tsx`

**Interfaces:**
- `SettingsLayout`: `sidebar`, `title`, `description`, children.
- `DashboardShell`: `sidebar`, `topbar`, `mobileSidebar`, `contentWidth` ('default' | 'wide' | 'full'), mobile trigger toggle.
- `DetailPageLayout`: `title`, `description`, `backHref`, `backLabel`, `onBackClick`, `actions`, `aside`, children.

- [x] **Step 1: Write tests for SettingsLayout (`settings-layout.test.tsx`)**
- [x] **Step 2: Write tests for DashboardShell (`dashboard-shell.test.tsx`)**
- [x] **Step 3: Write tests for DetailPageLayout (`detail-page-layout.test.tsx`)**
- [x] **Step 4: Run tests to verify Batch 3B passes**
- [x] **Step 5: Commit Batch 3B**

---

### Task 9: Batch 3C — Grid, Dialog, Tooltip & Toast (CalendarGrid, ConfirmDialog, Tooltip, Toast)

**Files:**
- Create: `packages/ui/src/components/calendar-grid.test.tsx`
- Create: `packages/ui/src/components/confirm-dialog.test.tsx`
- Create: `packages/ui/src/components/tooltip.test.tsx`
- Create: `packages/ui/src/components/toast.test.tsx`

**Interfaces:**
- `CalendarGrid`: `viewMonth`, `isDayDisabled`, `cellState`, `onSelectDay`, roving keyboard navigation.
- `ConfirmDialog`: `open`, `onClose`, `onConfirm`, `title`, `description`, `tone`, `loading`.
- `Tooltip`: `content`, `children`, hover/focus trigger, `role="tooltip"`.
- `Toast`: `ToastProvider`, `useToast`, tone notifications, dismiss button, auto-timeout.

- [x] **Step 1: Write tests for CalendarGrid (`calendar-grid.test.tsx`)**
- [x] **Step 2: Write tests for ConfirmDialog (`confirm-dialog.test.tsx`)**
- [x] **Step 3: Write tests for Tooltip (`tooltip.test.tsx`)**
- [x] **Step 4: Write tests for Toast (`toast.test.tsx`)**
- [x] **Step 5: Run tests to verify Batch 3C passes**
- [x] **Step 6: Commit Batch 3C**

---

### Task 10: Final Verification & Coverage Check

- [x] **Step 1: Run complete test suite across monorepo**
- [x] **Step 2: Run typecheck across monorepo**
- [x] **Step 3: Run build across all packages**
- [x] **Step 4: Verify that missing tests count is 0**
- [x] **Step 5: Update `docs/ROADMAP.md` marking Sprint 4 completed**
