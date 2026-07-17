# Timeline / ActivityFeed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compound `Timeline` / `ActivityFeed` component system to `@kjaniec-dev/ui` that supports left, right, and responsive alternating layouts, along with size and color status variants for dots.

**Architecture:** We use a compound component API (`Timeline`, `TimelineItem`, `TimelineSeparator`, `TimelineDot`, `TimelineConnector`, `TimelineContent`) communicating alignment down the tree via a `TimelineContext`. CSS Grid columns are used to handle positioning for left/right/alternating states, with responsive media queries collapsing alternating tracks to a left-aligned layout on mobile.

**Tech Stack:** React, Tailwind CSS v4, Storybook, Vitest, TypeScript

---

## File Structure

- Create: `packages/ui/src/components/timeline.tsx` — Main implementation file for the components.
- Create: `packages/ui/src/components/timeline.test.tsx` — Vitest unit tests verifying layouts, variants, connector visibility, and custom marker elements.
- Create: `packages/ui/src/components/timeline.stories.tsx` — Storybook examples demonstrating compact, alternating, and rich activity logs.
- Modify: `packages/ui/src/index.ts` — Export components and props from the package barrel.
- Modify: `site/src/main.tsx` — Add a new gallery section in the showcase site demonstrating the component in a SaaS context.
- Modify: `docs/BACKLOG.md` — Check off the Timeline item from the backlog.

---

### Task 1: Component Implementation

**Files:**
- Create: `packages/ui/src/components/timeline.tsx`

- [ ] **Step 1: Create the component file**
Write the following code to `packages/ui/src/components/timeline.tsx`:

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export type TimelineAlign = "left" | "right" | "alternate";
export type TimelineDotVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
export type TimelineDotSize = "sm" | "md" | "lg";

interface TimelineCtx {
  align: TimelineAlign;
}
const TimelineContext = React.createContext<TimelineCtx | null>(null);

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: TimelineAlign;
}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ align = "left", className, children, ...props }, ref) => {
    // Clone children to inject index so alternating items can position themselves odd/even
    const childrenWithIndex = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          index,
        });
      }
      return child;
    });

    return (
      <TimelineContext.Provider value={{ align }}>
        <div
          ref={ref}
          role="list"
          className={cn("flex flex-col gap-6 w-full", className)}
          {...props}
        >
          {childrenWithIndex}
        </div>
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, index = 0, children, ...props }, ref) => {
    const ctx = React.useContext(TimelineContext);
    if (!ctx) throw new Error("TimelineItem must be used within a Timeline");

    const { align } = ctx;
    const isEven = index % 2 === 0;

    // Grid config per alignment
    const gridClass = cn(
      "grid w-full gap-4 items-start group/timeline-item",
      align === "left" && "grid-cols-[auto_1fr]",
      align === "right" && "grid-cols-[1fr_auto] text-right",
      align === "alternate" && "md:grid-cols-[1fr_auto_1fr] grid-cols-[auto_1fr]"
    );

    // Pass isEven and align context properties down by mapping children
    const childrenWithLayout = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          isEven,
          align,
        });
      }
      return child;
    });

    return (
      <div
        ref={ref}
        role="listitem"
        className={cn(gridClass, className)}
        {...props}
      >
        {childrenWithLayout}
      </div>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

export interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isEven?: boolean;
  align?: TimelineAlign;
}

export const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ className, isEven, align, ...props }, ref) => {
    const separatorClass = cn(
      "flex flex-col items-center justify-self-center h-full min-h-[40px]",
      align === "alternate" && "md:col-start-2 col-start-1",
      align === "left" && "col-start-1",
      align === "right" && "col-start-2",
      className
    );

    return <div ref={ref} className={separatorClass} {...props} />;
  }
);
TimelineSeparator.displayName = "TimelineSeparator";

export interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  dashed?: boolean;
}

export const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, dashed, ...props }, ref) => {
    const connectorClass = cn(
      "grow bg-border group-last/timeline-item:hidden",
      dashed ? "w-0 border-l border-dashed border-border" : "w-0.5",
      className
    );

    return <div ref={ref} className={connectorClass} {...props} />;
  }
);
TimelineConnector.displayName = "TimelineConnector";

export interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TimelineDotVariant;
  size?: TimelineDotSize;
}

export const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-2.5 h-2.5 rounded-full my-1.5",
      md: "w-4 h-4 rounded-full my-1 border-2 bg-background border-border",
      lg: "w-8 h-8 rounded-full border flex items-center justify-center bg-background text-[0.8rem]",
    };

    const variantClasses = {
      default: "border-border text-muted-foreground",
      primary: "border-primary bg-primary/5 text-primary",
      secondary: "border-secondary bg-secondary/5 text-secondary",
      success: "border-success bg-success-surface text-success",
      warning: "border-warning bg-warning-surface text-warning",
      danger: "border-danger bg-danger-surface text-danger",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "shrink-0 select-none",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = "TimelineDot";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isEven?: boolean;
  align?: TimelineAlign;
}

export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, isEven, align, ...props }, ref) => {
    const contentClass = cn(
      "pb-8 flex flex-col gap-1 w-full",
      align === "left" && "col-start-2 text-left",
      align === "right" && "col-start-1 text-right",
      align === "alternate" && (
        isEven 
          ? "md:col-start-3 col-start-2 text-left" 
          : "md:col-start-1 col-start-2 md:text-right text-left"
      ),
      className
    );

    return <div ref={ref} className={contentClass} {...props} />;
  }
);
TimelineContent.displayName = "TimelineContent";

export const TimelineTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn("m-0 text-sm font-semibold tracking-[-0.01em] text-foreground", className)}
      {...props}
    />
  )
);
TimelineTitle.displayName = "TimelineTitle";

export const TimelineTime = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <time
      ref={ref}
      className={cn("text-[0.75rem] text-muted-foreground font-normal", className)}
      {...props}
    />
  )
);
TimelineTime.displayName = "TimelineTime";
```

- [ ] **Step 2: Add exports to the barrel file**
Modify `packages/ui/src/index.ts` to export the new components. Add the following block to the end of the file:

```typescript
export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
  type TimelineProps,
  type TimelineItemProps,
  type TimelineSeparatorProps,
  type TimelineConnectorProps,
  type TimelineDotProps,
  type TimelineContentProps,
  type TimelineAlign,
  type TimelineDotVariant,
  type TimelineDotSize,
} from "./components/timeline";
```

- [ ] **Step 3: Commit files**
```bash
git add packages/ui/src/components/timeline.tsx packages/ui/src/index.ts
git commit -m "feat(ui): implement Timeline compound components and context structure"
```

---

### Task 2: Unit Testing

**Files:**
- Create: `packages/ui/src/components/timeline.test.tsx`

- [ ] **Step 1: Create the test file**
Write the following test cases to `packages/ui/src/components/timeline.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
} from "./timeline";

describe("Timeline", () => {
  it("renders a semantic list structure with correct classes", () => {
    const { getByRole, getAllByRole } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <TimelineTitle>Step 1</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const list = getByRole("list");
    const items = getAllByRole("listitem");

    expect(list.className).toContain("flex");
    expect(list.className).toContain("flex-col");
    expect(items).toHaveLength(1);
  });

  it("applies correct layout alignment classes to item and content columns", () => {
    const { container } = render(
      <Timeline align="alternate">
        <TimelineItem>
          <TimelineSeparator data-testid="sep-0">
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent data-testid="content-0">Item 1</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator data-testid="sep-1">
            <TimelineDot />
          </TimelineSeparator>
          <TimelineContent data-testid="content-1">Item 2</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const content0 = container.querySelector('[data-testid="content-0"]') as HTMLElement;
    const content1 = container.querySelector('[data-testid="content-1"]') as HTMLElement;
    
    // Index 0 (Even) -> right column in desktop, left column in mobile
    expect(content0.className).toContain("md:col-start-3");
    expect(content0.className).toContain("col-start-2");
    
    // Index 1 (Odd) -> left column in desktop, left column in mobile
    expect(content1.className).toContain("md:col-start-1");
    expect(content1.className).toContain("col-start-2");
  });

  it("hides connector on the last item", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector data-testid="conn-0" />
          </TimelineSeparator>
          <TimelineContent>Content 1</TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector data-testid="conn-1" />
          </TimelineSeparator>
          <TimelineContent>Content 2</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const conn0 = container.querySelector('[data-testid="conn-0"]') as HTMLElement;
    const conn1 = container.querySelector('[data-testid="conn-1"]') as HTMLElement;

    expect(conn0.className).not.toContain("group-last/timeline-item:hidden");
    expect(conn1.className).toContain("group-last/timeline-item:hidden");
  });

  it("renders dots with correct size and variant classes", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot size="lg" variant="success" data-testid="dot" />
          </TimelineSeparator>
          <TimelineContent>Content</TimelineContent>
        </TimelineItem>
      </Timeline>
    );

    const dot = container.querySelector('[data-testid="dot"]') as HTMLElement;
    expect(dot.className).toContain("w-8");
    expect(dot.className).toContain("border-success");
  });
});
```

- [ ] **Step 2: Run test suite to verify tests pass**
Run: `npm run test --workspace @kjaniec-dev/ui`
Expected output:
```
✓ packages/ui/src/components/timeline.test.tsx (4)
Test Files  1 passed (1)
Tests       4 passed (4)
```

- [ ] **Step 3: Commit tests**
```bash
git add packages/ui/src/components/timeline.test.tsx
git commit -m "test(ui): add unit tests for Timeline alignments, connector hiding, and variants"
```

---

### Task 3: Stories & MCP Metadata Generation

**Files:**
- Create: `packages/ui/src/components/timeline.stories.tsx`
- Modify: `packages/mcp/data/components.json`

- [ ] **Step 1: Create Storybook stories file**
Write the following code to `packages/ui/src/components/timeline.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineTime,
} from "./timeline";
import { Card } from "./card";

const meta = {
  title: "Display/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 500, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinimalLog: Story = {
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" variant="success" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Database Migrated</TimelineTitle>
            <TimelineTime>5m ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" variant="primary" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Server Started</TimelineTitle>
            <TimelineTime>15m ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="sm" />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Code Repository Created</TimelineTitle>
            <TimelineTime>1h ago</TimelineTime>
          </div>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const RichFeed: Story = {
  render: () => (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" variant="primary">
            <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>JD</span>
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>John Doe</span>
            <span style={{ color: "var(--kj-muted-foreground)", fontSize: "0.875rem" }}>pushed commit</span>
            <code style={{ fontSize: "0.75rem", background: "var(--kj-muted)", padding: "2px 4px", borderRadius: 4 }}>e1cdb7b</code>
            <TimelineTime style={{ marginLeft: "auto" }}>10m ago</TimelineTime>
          </div>
          <Card style={{ marginTop: 8 }}>
            <div style={{ padding: 12, fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
              feat(ui): add new separator divider style configuration options
            </div>
          </Card>
        </TimelineContent>
      </TimelineItem>
      
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="lg" variant="success">
            ✓
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <TimelineTitle>Production Release v1.2.0</TimelineTitle>
            <TimelineTime>Yesterday</TimelineTime>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Automatically deployed to server cluster via GitHub Actions.
          </p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};

export const Alternating: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 800, padding: 24 }}><Story /></div>],
  render: () => (
    <Timeline align="alternate">
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="primary" />
          <TimelineConnector dashed />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>Project Kickoff</TimelineTitle>
          <TimelineTime>Jan 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Initial brainstorming, specification documentation, and team sync.
          </p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="secondary" />
          <TimelineConnector dashed />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>Alpha Testing</TimelineTitle>
          <TimelineTime>Mar 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Internal release to design system team and selected SaaS developers.
          </p>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot size="md" variant="success" />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTitle>General Availability</TimelineTitle>
          <TimelineTime>Jul 2026</TimelineTime>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.8125rem", color: "var(--kj-muted-foreground)" }}>
            Published components to npm registry, integrated showcase app shell, full documentation complete.
          </p>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  ),
};
```

- [ ] **Step 2: Build the UI package and regenerate MCP data**
Run the root build command to compile `packages/ui` and trigger `packages/mcp`'s extractor:
Run: `npm run build`
Expected: Succeeds and output prints `TSX extraction and data generation completed successfully.` (meaning `components.json` is updated).

- [ ] **Step 3: Commit story and MCP data updates**
```bash
git add packages/ui/src/components/timeline.stories.tsx packages/mcp/data/components.json
git commit -m "feat(ui): add Storybook stories and regenerate MCP server metadata"
```

---

### Task 4: Showcase Integration, Backlog, & Verification

**Files:**
- Modify: `site/src/main.tsx`
- Modify: `docs/BACKLOG.md`

- [ ] **Step 1: Check existing main.tsx imports**
We will import `Timeline`, `TimelineItem`, `TimelineSeparator`, `TimelineConnector`, `TimelineDot`, `TimelineContent`, `TimelineTitle`, `TimelineTime` from `@kjaniec-dev/ui`.

- [ ] **Step 2: Add Showcase section in site/src/main.tsx**
Find a suitable location for a new showcase card/section in `site/src/main.tsx` (e.g., right next to `Separator` section at line 1320), and add a detailed activity feed demo card:

```tsx
            {/* Timeline Section */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-foreground">Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Compound timeline logs for audit trails, task logs, and roadmaps.
              </p>
              <Card className="p-6">
                <Timeline>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot size="lg" variant="primary">
                        <span className="text-xs font-bold">AK</span>
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Aleksandra Kowalska</span>
                        <span className="text-xs text-muted-foreground">pushed to main</span>
                        <TimelineTime className="ml-auto">10m ago</TimelineTime>
                      </div>
                      <div className="mt-2 text-xs bg-muted/50 border border-border p-3 rounded-lg font-mono text-muted-foreground">
                        feat(auth): add OAuth provider login options
                      </div>
                    </TimelineContent>
                  </TimelineItem>

                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot size="lg" variant="success">
                        ✓
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <div className="flex items-center gap-2">
                        <TimelineTitle>Build Succeeded</TimelineTitle>
                        <TimelineTime className="ml-auto">1h ago</TimelineTime>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compiled assets successfully in 42s.
                      </p>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              </Card>
            </section>
```

- [ ] **Step 3: Update docs/BACKLOG.md**
Update line 34 in `docs/BACKLOG.md` to check off the Timeline item:
```diff
- [ ] `Timeline` / `ActivityFeed` — fits "Tenant & Property Manager" and "Project & Dev Console" patterns (event history, activity log).
+ [x] `Timeline` / `ActivityFeed` — fits "Tenant & Property Manager" and "Project & Dev Console" patterns (event history, activity log).
```

- [ ] **Step 4: Run dev server to verify site loads correctly**
Run the site development server in the background:
Run: `npm run site:dev`
And verify visually or using Storybook:
Run: `npm run storybook`

- [ ] **Step 5: Verify types and clean build**
Run all validation checks in the root workspace:
Run: `npm run typecheck && npm run test`
Expected: Both pass cleanly.

- [ ] **Step 6: Commit showcase site and backlog changes**
```bash
git add site/src/main.tsx docs/BACKLOG.md
git commit -m "feat(site): showcase Timeline component and mark backlog item complete"
```
