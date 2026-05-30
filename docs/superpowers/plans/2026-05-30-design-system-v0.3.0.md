# Design System v0.3.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 6 targeted improvements to `@kjaniec-dev/ui` and `@kjaniec-dev/design` as a single `v0.3.0` release.

**Architecture:** All changes are isolated to individual component files in `packages/ui/src/components/` and CSS token files in `packages/design/src/`. No cross-package dependencies are introduced. Stories are updated alongside each component change for visual verification in Storybook.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, CVA (class-variance-authority), Storybook 8, tsup

---

## File Map

| File | Change |
|------|--------|
| `packages/ui/src/components/accordion.tsx` | Grid bug fix + `"use client"` |
| `packages/ui/src/components/checkbox.tsx` | `"use client"` |
| `packages/ui/src/components/dropdown-menu.tsx` | `"use client"` |
| `packages/ui/src/components/modal.tsx` | `"use client"` |
| `packages/ui/src/components/progress.tsx` | `"use client"` + `barClassName` prop |
| `packages/ui/src/components/segmented.tsx` | `"use client"` |
| `packages/ui/src/components/select.tsx` | `"use client"` |
| `packages/ui/src/components/slider.tsx` | `"use client"` |
| `packages/ui/src/components/switch.tsx` | `"use client"` |
| `packages/ui/src/components/tabs.tsx` | `"use client"` |
| `packages/ui/src/components/toast.tsx` | `"use client"` |
| `packages/ui/src/components/tooltip.tsx` | `"use client"` |
| `packages/ui/src/components/badge.tsx` | `secondary` variant |
| `packages/ui/src/components/badge.stories.tsx` | Show `secondary` variant |
| `packages/ui/src/components/card.tsx` | Polymorphic `as` prop |
| `packages/ui/src/components/card.stories.tsx` | Show `as="article"` usage |
| `packages/ui/src/components/feedback.stories.tsx` | Show `barClassName` usage |
| `packages/design/src/theme.css` | Primary + secondary 50–950 scales |
| `packages/design/src/tailwind.css` | Expose scales as Tailwind tokens |
| `packages/ui/package.json` | Bump to `0.3.0` |
| `packages/design/package.json` | Bump to `0.3.0` |
| `package.json` (root) | Bump to `0.3.0` |

---

## Task 1: Fix Accordion grid-template-rows bug (Tailwind v4)

**Files:**
- Modify: `packages/ui/src/components/accordion.tsx`

**Context:** Tailwind v4 compiles `grid-rows-[0fr]` to `grid-template-rows: repeat(0fr, ...)` which is invalid CSS. Browser discards it, all accordions stay permanently open. Fix: use arbitrary CSS property syntax instead.

- [ ] **Step 1: Open `accordion.tsx` and find the broken classes**

In `AccordionContent`, locate:
```tsx
className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
```

- [ ] **Step 2: Replace with arbitrary CSS property syntax**

Replace that className line with:
```tsx
className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]")}
```

- [ ] **Step 3: Add `"use client"` as first line of the file**

The file currently starts with `import * as React from "react";`. Add above it:
```tsx
"use client";

import * as React from "react";
```

- [ ] **Step 4: Verify in Storybook**

```bash
cd packages/ui && npm run storybook
```

Navigate to **Layout/Accordion**. Click a trigger — the panel should collapse and expand smoothly. Previously it would stay permanently open.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/accordion.tsx
git commit -m "fix(ui): accordion grid-template-rows Tailwind v4 compat + use client"
```

---

## Task 2: Add `"use client"` to remaining stateful components

**Files:**
- Modify: `packages/ui/src/components/checkbox.tsx`
- Modify: `packages/ui/src/components/dropdown-menu.tsx`
- Modify: `packages/ui/src/components/modal.tsx`
- Modify: `packages/ui/src/components/progress.tsx`
- Modify: `packages/ui/src/components/segmented.tsx`
- Modify: `packages/ui/src/components/select.tsx`
- Modify: `packages/ui/src/components/slider.tsx`
- Modify: `packages/ui/src/components/switch.tsx`
- Modify: `packages/ui/src/components/tabs.tsx`
- Modify: `packages/ui/src/components/toast.tsx`
- Modify: `packages/ui/src/components/tooltip.tsx`

**Context:** Each of these uses React hooks or context. Without `"use client"`, importing them in a Next.js Server Component causes a build crash.

- [ ] **Step 1: Add `"use client";` to each file**

For each of the 11 files listed above, add `"use client";` as the very first line, followed by a blank line. Example — the top of `tabs.tsx` should become:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";
// ... rest of file unchanged
```

Repeat for all 11 files. The only change in each file is inserting `"use client";\n` at line 1.

- [ ] **Step 2: Build to confirm no TypeScript errors**

```bash
cd packages/ui && npm run build
```

Expected: build completes, `dist/` updated, no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/checkbox.tsx \
        packages/ui/src/components/dropdown-menu.tsx \
        packages/ui/src/components/modal.tsx \
        packages/ui/src/components/progress.tsx \
        packages/ui/src/components/segmented.tsx \
        packages/ui/src/components/select.tsx \
        packages/ui/src/components/slider.tsx \
        packages/ui/src/components/switch.tsx \
        packages/ui/src/components/tabs.tsx \
        packages/ui/src/components/toast.tsx \
        packages/ui/src/components/tooltip.tsx
git commit -m "feat(ui): add use client to all stateful components for RSC compatibility"
```

---

## Task 3: Badge `secondary` variant

**Files:**
- Modify: `packages/ui/src/components/badge.tsx`
- Modify: `packages/ui/src/components/badge.stories.tsx`

- [ ] **Step 1: Add `secondary` to `badgeVariants` in `badge.tsx`**

Locate the `variants.variant` object in `badgeVariants`. After the `primary` entry:
```tsx
primary: "bg-primary/15 text-primary-hover dark:text-primary",
```
Add:
```tsx
secondary: "bg-secondary/15 text-secondary-hover dark:text-secondary",
```

The full variants block becomes:
```tsx
variants: {
  variant: {
    neutral:   "bg-muted text-muted-foreground",
    primary:   "bg-primary/15 text-primary-hover dark:text-primary",
    secondary: "bg-secondary/15 text-secondary-hover dark:text-secondary",
    success:   "bg-success-surface text-success",
    warning:   "bg-warning-surface text-warning",
    danger:    "bg-danger-surface text-danger",
    info:      "bg-info-surface text-info",
    solid:     "bg-primary text-primary-foreground",
  },
},
```

- [ ] **Step 2: Update `badge.stories.tsx` to expose `secondary`**

In `argTypes.variant.options`, add `"secondary"`:
```tsx
options: ["neutral", "primary", "secondary", "success", "warning", "danger", "info", "solid"],
```

In the `AllVariants` story render, add after the primary badge:
```tsx
<Badge variant="secondary">Secondary</Badge>
```

- [ ] **Step 3: Verify in Storybook**

```bash
cd packages/ui && npm run storybook
```

Navigate to **Status/Badge → AllVariants**. A teal `Secondary` badge should appear next to the amber `Primary` badge.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/badge.tsx \
        packages/ui/src/components/badge.stories.tsx
git commit -m "feat(ui): add secondary variant to Badge"
```

---

## Task 4: Card polymorphic `as` prop

**Files:**
- Modify: `packages/ui/src/components/card.tsx`
- Modify: `packages/ui/src/components/card.stories.tsx`

- [ ] **Step 1: Update `CardProps` interface and component in `card.tsx`**

Replace the existing `CardProps` interface and `Card` component with:

```tsx
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  /** Drop the border + heavier shadow for a floating look. */
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ as: Tag = "div", className, elevated, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "bg-card text-card-foreground rounded-kj-xl overflow-hidden border",
        elevated ? "border-transparent shadow-kj-lg" : "border-border shadow-kj-sm",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
```

The only changes from the original: `HTMLDivElement` → `HTMLElement`, add `as?: React.ElementType`, rename destructured `as` to `Tag`, use `Tag` in JSX instead of `div`.

- [ ] **Step 2: Add a story demonstrating `as="article"` in `card.stories.tsx`**

Add this story after the existing `Elevated` story:

```tsx
export const AsArticle: Story = {
  render: () => (
    <Card as="article">
      <CardHeader>
        <CardTitle>Semantic Article Card</CardTitle>
        <CardDescription>This card renders as an &lt;article&gt; element.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "0.85rem", color: "var(--kj-muted-foreground)" }}>
          Inspect the DOM — the root element is an article, not a div.
        </p>
      </CardContent>
    </Card>
  ),
};
```

- [ ] **Step 3: Build to confirm no TypeScript errors**

```bash
cd packages/ui && npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Verify in Storybook**

```bash
cd packages/ui && npm run storybook
```

Navigate to **Layout/Card → AsArticle**. Open browser DevTools and inspect the root element — it should be `<article>` not `<div>`.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/card.tsx \
        packages/ui/src/components/card.stories.tsx
git commit -m "feat(ui): add polymorphic as prop to Card"
```

---

## Task 5: Progress `barClassName` prop

**Files:**
- Modify: `packages/ui/src/components/progress.tsx`
- Modify: `packages/ui/src/components/feedback.stories.tsx`

- [ ] **Step 1: Add `barClassName` to `ProgressProps` and apply it in `progress.tsx`**

Replace the current interface and component with:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  tone?: "primary" | "secondary";
  /** Extra classes applied to the inner bar span — use for animation, transform-origin, etc. */
  barClassName?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, tone = "primary", barClassName, ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <span
          className={cn(
            "block h-full rounded-full transition-[width] duration-500 ease-out",
            tone === "secondary" ? "bg-secondary" : "bg-primary",
            barClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
```

- [ ] **Step 2: Add a `BarClassName` story to `feedback.stories.tsx`**

Add after the `ProgressTones` story:

```tsx
export const WithBarClassName: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
      <Progress
        value={75}
        barClassName="origin-left"
        style={{ '--delay': '0s' } as React.CSSProperties}
      />
      <Progress
        value={50}
        tone="secondary"
        barClassName="origin-left"
        style={{ '--delay': '0.2s' } as React.CSSProperties}
      />
    </div>
  ),
};
```

- [ ] **Step 3: Verify in Storybook**

```bash
cd packages/ui && npm run storybook
```

Navigate to **Status/Feedback → WithBarClassName**. Bars should render normally (no visible difference without keyframe CSS — the prop is available for consumers to hook into).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/progress.tsx \
        packages/ui/src/components/feedback.stories.tsx
git commit -m "feat(ui): add barClassName prop to Progress for consumer animation control"
```

---

## Task 6: Color shade scales 50–950 for primary and secondary

**Files:**
- Modify: `packages/design/src/theme.css`
- Modify: `packages/design/src/tailwind.css`

**Context:** Adding full Tailwind-aligned amber (primary) and teal (secondary) shade scales. Values match the Tailwind v3/v4 amber-* and teal-* palettes. Existing flat tokens (`--kj-primary`, `--kj-secondary`) are untouched.

- [ ] **Step 1: Add shade variables to `:root` in `packages/design/src/theme.css`**

After the existing `--kj-primary-hover` line, add the primary scale:

```css
/* Primary (amber) scale */
--kj-primary-50:  #fffbeb;
--kj-primary-100: #fef3c7;
--kj-primary-200: #fde68a;
--kj-primary-300: #fcd34d;
--kj-primary-400: #fbbf24;
--kj-primary-500: #f59e0b;
--kj-primary-600: #d97706;
--kj-primary-700: #b45309;
--kj-primary-800: #92400e;
--kj-primary-900: #78350f;
--kj-primary-950: #451a03;
```

After the existing `--kj-secondary-hover` line, add the secondary scale:

```css
/* Secondary (teal) scale */
--kj-secondary-50:  #f0fdfa;
--kj-secondary-100: #ccfbf1;
--kj-secondary-200: #99f6e4;
--kj-secondary-300: #5eead4;
--kj-secondary-400: #2dd4bf;
--kj-secondary-500: #14b8a6;
--kj-secondary-600: #0d9488;
--kj-secondary-700: #0f766e;
--kj-secondary-800: #115e59;
--kj-secondary-900: #134e4a;
--kj-secondary-950: #042f2e;
```

- [ ] **Step 2: Expose scales as Tailwind tokens in `packages/design/src/tailwind.css`**

In the `@theme` block, after `--color-primary-foreground: var(--kj-primary-foreground);`, add:

```css
--color-primary-50:  var(--kj-primary-50);
--color-primary-100: var(--kj-primary-100);
--color-primary-200: var(--kj-primary-200);
--color-primary-300: var(--kj-primary-300);
--color-primary-400: var(--kj-primary-400);
--color-primary-500: var(--kj-primary-500);
--color-primary-600: var(--kj-primary-600);
--color-primary-700: var(--kj-primary-700);
--color-primary-800: var(--kj-primary-800);
--color-primary-900: var(--kj-primary-900);
--color-primary-950: var(--kj-primary-950);
```

After `--color-secondary-foreground: var(--kj-secondary-foreground);`, add:

```css
--color-secondary-50:  var(--kj-secondary-50);
--color-secondary-100: var(--kj-secondary-100);
--color-secondary-200: var(--kj-secondary-200);
--color-secondary-300: var(--kj-secondary-300);
--color-secondary-400: var(--kj-secondary-400);
--color-secondary-500: var(--kj-secondary-500);
--color-secondary-600: var(--kj-secondary-600);
--color-secondary-700: var(--kj-secondary-700);
--color-secondary-800: var(--kj-secondary-800);
--color-secondary-900: var(--kj-secondary-900);
--color-secondary-950: var(--kj-secondary-950);
```

- [ ] **Step 3: Verify the tokens are exported**

```bash
cd packages/design && cat tailwind.css | grep "primary-50"
```

Expected output: `--color-primary-50: var(--kj-primary-50);`

- [ ] **Step 4: Commit**

```bash
git add packages/design/src/theme.css \
        packages/design/src/tailwind.css
git commit -m "feat(design): add primary and secondary 50-950 color shade scales"
```

---

## Task 7: Version bump to 0.3.0 and final build

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `packages/design/package.json`
- Modify: `package.json` (root)

- [ ] **Step 1: Bump `packages/ui/package.json`**

Change `"version": "0.2.0"` to `"version": "0.3.0"`.

- [ ] **Step 2: Bump `packages/design/package.json`**

Change `"version": "0.2.0"` to `"version": "0.3.0"`.

- [ ] **Step 3: Bump root `package.json`**

Change `"version": "0.2.0"` to `"version": "0.3.0"`.

- [ ] **Step 4: Full build of both packages**

```bash
npm run build -w packages/design && npm run build -w packages/ui
```

Expected: both build cleanly, `dist/` folders updated in each package.

- [ ] **Step 5: Confirm Storybook loads all stories without errors**

```bash
cd packages/ui && npm run storybook
```

Check: Badge (secondary visible), Card (AsArticle story), Feedback (WithBarClassName story), Accordion (collapses correctly).

- [ ] **Step 6: Commit version bumps**

```bash
git add package.json packages/ui/package.json packages/design/package.json
git commit -m "chore: bump packages to v0.3.0"
```
