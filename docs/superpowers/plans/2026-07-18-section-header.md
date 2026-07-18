# SectionHeader Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `SectionHeader` component in `@kjaniec-dev/ui`, complete with compound sub-components, unit tests, storybook stories, package re-exports, and updating backlog tracking.

**Architecture:** Component provided as both a single prop-driven component (`<SectionHeader title="..." kicker="..." description="..." actions="..." align="..." divider />`) and compound sub-components (`SectionHeader.Kicker`, `SectionHeader.Title`, `SectionHeader.Description`, `SectionHeader.Actions`) for full layout composition flexibility. Styled using Tailwind CSS classes aligned with `@kjaniec-dev/design` tokens.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vitest, React Testing Library, Storybook.

---

### Task 1: Create Unit Tests for `SectionHeader` (TDD)

**Files:**
- Create: `packages/ui/src/components/section-header.test.tsx`

- [ ] **Step 1: Write the failing unit tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("renders title, kicker, description, and actions correctly via props", () => {
    render(
      <SectionHeader
        kicker="Overview"
        title="Main Features"
        description="A list of awesome features"
        actions={<button>Click Me</button>}
      />
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Main Features" })).toBeInTheDocument();
    expect(screen.getByText("A list of awesome features")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
  });

  it("supports custom heading levels", () => {
    render(<SectionHeader title="Subsection" headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Subsection" })).toBeInTheDocument();
  });

  it("applies center alignment classes when align='center'", () => {
    const { container } = render(<SectionHeader title="Centered Title" align="center" />);
    const rootEl = container.firstElementChild;
    expect(rootEl).toHaveClass("text-center");
  });

  it("applies divider border class when divider is true", () => {
    const { container } = render(<SectionHeader title="Divided Header" divider />);
    const rootEl = container.firstElementChild;
    expect(rootEl).toHaveClass("border-b");
  });

  it("supports compound sub-component composition", () => {
    render(
      <SectionHeader align="center">
        <SectionHeader.Kicker>Custom Kicker</SectionHeader.Kicker>
        <SectionHeader.Title as="h4">Custom Title</SectionHeader.Title>
        <SectionHeader.Description>Custom Description</SectionHeader.Description>
        <SectionHeader.Actions>
          <button>Custom Action</button>
        </SectionHeader.Actions>
      </SectionHeader>
    );

    expect(screen.getByText("Custom Kicker")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Custom Title" })).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom Action" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/section-header.test.tsx`
Expected: FAIL with "Cannot find module './section-header'"

---

### Task 2: Implement `SectionHeader` Component

**Files:**
- Create: `packages/ui/src/components/section-header.tsx`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Write `SectionHeader` implementation**

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export type SectionHeaderAlign = "left" | "center";
export type SectionHeaderHeadingLevel = "h2" | "h3" | "h4";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: SectionHeaderAlign;
  headingLevel?: SectionHeaderHeadingLevel;
  divider?: boolean;
}

export interface SectionHeaderKickerProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface SectionHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: SectionHeaderHeadingLevel;
}
export interface SectionHeaderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface SectionHeaderActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const SectionHeaderKicker = React.forwardRef<HTMLParagraphElement, SectionHeaderKickerProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <p
        ref={ref}
        className={cn(
          "font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary",
          className
        )}
        {...props}
      >
        {children}
      </p>
    );
  }
);
SectionHeaderKicker.displayName = "SectionHeaderKicker";

const SectionHeaderTitle = React.forwardRef<HTMLHeadingElement, SectionHeaderTitleProps>(
  ({ className, as: Component = "h2", children, ...props }, ref) => {
    if (!children) return null;
    return (
      <Component
        ref={ref}
        className={cn("text-2xl font-bold tracking-tight text-foreground sm:text-3xl", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
SectionHeaderTitle.displayName = "SectionHeaderTitle";

const SectionHeaderDescription = React.forwardRef<
  HTMLParagraphElement,
  SectionHeaderDescriptionProps
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  return (
    <p
      ref={ref}
      className={cn("text-base leading-relaxed text-muted-foreground max-w-2xl", className)}
      {...props}
    >
      {children}
    </p>
  );
});
SectionHeaderDescription.displayName = "SectionHeaderDescription";

const SectionHeaderActions = React.forwardRef<HTMLDivElement, SectionHeaderActionsProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null;
    return (
      <div ref={ref} className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
        {children}
      </div>
    );
  }
);
SectionHeaderActions.displayName = "SectionHeaderActions";

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      kicker,
      title,
      description,
      actions,
      align = "left",
      headingLevel = "h2",
      divider = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isCentered = align === "center";

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-4",
          isCentered ? "text-center items-center mx-auto max-w-3xl" : "md:flex md:items-end md:justify-between md:space-y-0",
          divider && "border-b border-border pb-6",
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            <div
              className={cn(
                "space-y-2",
                isCentered && "flex flex-col items-center"
              )}
            >
              {kicker && <SectionHeaderKicker>{kicker}</SectionHeaderKicker>}
              {title && <SectionHeaderTitle as={headingLevel}>{title}</SectionHeaderTitle>}
              {description && (
                <SectionHeaderDescription>{description}</SectionHeaderDescription>
              )}
            </div>
            {actions && (
              <SectionHeaderActions className={cn(isCentered && "justify-center mt-4")}>
                {actions}
              </SectionHeaderActions>
            )}
          </>
        )}
      </div>
    );
  }
) as React.ForwardRefExoticComponent<SectionHeaderProps & React.RefAttributes<HTMLDivElement>> & {
  Kicker: typeof SectionHeaderKicker;
  Title: typeof SectionHeaderTitle;
  Description: typeof SectionHeaderDescription;
  Actions: typeof SectionHeaderActions;
};

SectionHeader.displayName = "SectionHeader";
SectionHeader.Kicker = SectionHeaderKicker;
SectionHeader.Title = SectionHeaderTitle;
SectionHeader.Description = SectionHeaderDescription;
SectionHeader.Actions = SectionHeaderActions;
```

- [ ] **Step 2: Re-export in `packages/ui/src/index.ts`**

Export `SectionHeader` and its type definitions from `packages/ui/src/index.ts`.

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/section-header.test.tsx`
Expected: PASS (5 tests passed)

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/section-header.tsx packages/ui/src/components/section-header.test.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add SectionHeader component with compound sub-components"
```

---

### Task 3: Create Storybook Stories & Update Backlog

**Files:**
- Create: `packages/ui/src/components/section-header.stories.tsx`
- Modify: `docs/BACKLOG.md`

- [ ] **Step 1: Create Storybook stories for `SectionHeader`**

Create `packages/ui/src/components/section-header.stories.tsx` with Default, Centered, WithActions, WithDivider, and CompoundStories.

- [ ] **Step 2: Check off `SectionHeader` in `docs/BACKLOG.md`**

Update `docs/BACKLOG.md` under `## P1 — New components: close the DESIGN.md gap`:
`- [x] SectionHeader`

- [ ] **Step 3: Build verification**

Run: `npm run build --workspace @kjaniec-dev/ui` and `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: Success with no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/section-header.stories.tsx docs/BACKLOG.md
git commit -m "docs(ui): add Storybook stories for SectionHeader and check off backlog item"
```
