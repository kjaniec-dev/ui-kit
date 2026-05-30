# Design System v0.4.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `interactive` prop to Card and extract `PageHeader` as a new component, shipping as `@kjaniec-dev/ui@0.4.0`.

**Architecture:** Both changes are isolated to `packages/ui/src/components/`. Card gets a single new boolean prop. PageHeader is a new stateless file following existing component patterns. Both get Storybook stories. The barrel `src/index.ts` gets one new export line.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Storybook 8, tsup

---

## File Map

| File | Change |
|------|--------|
| `packages/ui/src/components/card.tsx` | Add `interactive?: boolean` prop |
| `packages/ui/src/components/card.stories.tsx` | Add `Interactive` story |
| `packages/ui/src/components/page-header.tsx` | Create new component |
| `packages/ui/src/components/page-header.stories.tsx` | Create new stories |
| `packages/ui/src/index.ts` | Export `PageHeader` |
| `packages/ui/package.json` | Bump to `0.4.0` |
| `package.json` (root) | Bump to `0.4.0` |

---

## Task 1: Card `interactive` prop

**Files:**
- Modify: `packages/ui/src/components/card.tsx`
- Modify: `packages/ui/src/components/card.stories.tsx`

- [ ] **Step 1: Read `card.tsx` to confirm current state**

The file currently has:
```tsx
export interface CardProps extends Omit<React.AllHTMLAttributes<HTMLElement>, "as"> {
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
```

- [ ] **Step 2: Add `interactive` prop to `CardProps` and `cn()` in `card.tsx`**

Replace the `CardProps` interface and `Card` component with:

```tsx
export interface CardProps extends Omit<React.AllHTMLAttributes<HTMLElement>, "as"> {
  as?: React.ElementType;
  /** Drop the border + heavier shadow for a floating look. */
  elevated?: boolean;
  /** Adds hover lift effect — translate-y + shadow. Use on clickable cards. */
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ as: Tag = "div", className, elevated, interactive, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        "bg-card text-card-foreground rounded-kj-xl overflow-hidden border",
        elevated ? "border-transparent shadow-kj-lg" : "border-border shadow-kj-sm",
        interactive && "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-kj-md",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";
```

Do NOT change CardHeader, CardTitle, CardDescription, CardContent, or CardFooter.

- [ ] **Step 3: Add `Interactive` story to `card.stories.tsx`**

Add after the `AsArticle` story and before the `Stats` story:

```tsx
export const Interactive: Story = {
  render: () => (
    <Card interactive>
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Hover to see the lift effect.</CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ fontSize: "0.85rem", color: "var(--kj-muted-foreground)" }}>
          This card uses the interactive prop — hover:-translate-y-1 and hover:shadow-kj-md.
        </p>
      </CardContent>
    </Card>
  ),
};
```

- [ ] **Step 4: Build to confirm no TypeScript errors**

```bash
cd /Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/card.tsx packages/ui/src/components/card.stories.tsx
git commit -m "feat(ui): add interactive prop to Card"
```

---

## Task 2: PageHeader component

**Files:**
- Create: `packages/ui/src/components/page-header.tsx`
- Create: `packages/ui/src/components/page-header.stories.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `packages/ui/src/components/page-header.tsx`**

Create the file with this exact content:

```tsx
"use client";

import * as React from "react";

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ eyebrow, title, description, actions }, ref) => (
    <header ref={ref} className="py-12 md:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3 max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </header>
  )
);
PageHeader.displayName = "PageHeader";
```

- [ ] **Step 2: Create `packages/ui/src/components/page-header.stories.tsx`**

Create the file with this exact content:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./page-header";
import { Button } from "./button";

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    eyebrow: "Portfolio",
    title: "Projects",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithDescription: Story = {
  args: {
    eyebrow: "About me",
    title: "Who I am",
    description: "Designer and developer building thoughtful digital products.",
  },
};

export const WithActions: Story = {
  render: () => (
    <PageHeader
      eyebrow="Open source"
      title="Projects"
      description="Things I've built and shipped."
      actions={
        <>
          <Button size="sm">View all</Button>
          <Button size="sm" variant="ghost">GitHub</Button>
        </>
      }
    />
  ),
};
```

- [ ] **Step 3: Export `PageHeader` from `packages/ui/src/index.ts`**

Add this line at the end of `src/index.ts`:

```ts
export { PageHeader, type PageHeaderProps } from "./components/page-header";
```

- [ ] **Step 4: Build to confirm no TypeScript errors**

```bash
cd /Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui && npm run build
```

Expected: clean build. `dist/index.d.ts` should now include `PageHeader`.

- [ ] **Step 5: Verify export is in built types**

```bash
grep "PageHeader" /Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui/dist/index.d.ts
```

Expected: at least one line mentioning `PageHeader`.

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/page-header.tsx \
        packages/ui/src/components/page-header.stories.tsx \
        packages/ui/src/index.ts
git commit -m "feat(ui): add PageHeader component"
```

---

## Task 3: Version bump to 0.4.0

**Files:**
- Modify: `packages/ui/package.json`
- Modify: `package.json` (root)

Note: `packages/design/package.json` stays at `0.3.1` — no changes to design package.

- [ ] **Step 1: Bump `packages/ui/package.json`**

Change `"version": "0.3.1"` to `"version": "0.4.0"`.

- [ ] **Step 2: Bump root `package.json`**

Change `"version": "0.3.1"` to `"version": "0.4.0"`.

- [ ] **Step 3: Final build**

```bash
cd /Users/kjaniec-dev/dev/projects/kj-product-kit-starter && npm run build -w packages/ui
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/package.json package.json
git commit -m "chore: bump ui to v0.4.0"
```
