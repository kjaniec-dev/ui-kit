# Card Suite (`PricingCard`, `BlogCard`, `ProjectCard`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three dedicated, domain-specific card components (`PricingCard`, `BlogCard`, `ProjectCard`) for `@kjaniec-dev/ui` with TDD unit tests, Storybook stories, barrel exports, and backlog documentation sync.

**Architecture:** Wraps the base `Card` primitive component with standardized layout slots, typography, interactive states, and design tokens (`@kjaniec-dev/design`).

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, Storybook.

---

### Task 1: `PricingCard` Component & Unit Tests

**Files:**
- Create: `packages/ui/src/components/pricing-card.tsx`
- Create: `packages/ui/src/components/pricing-card.test.tsx`

- [ ] **Step 1: Write the failing test for `PricingCard`**

```tsx
// packages/ui/src/components/pricing-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PricingCard } from "./pricing-card";

describe("PricingCard", () => {
  it("renders name, price, period, and features", () => {
    render(
      <PricingCard
        name="Pro Plan"
        price="$49"
        period="/ month"
        description="For growing teams"
        features={[
          { text: "Unlimited components", included: true },
          { text: "Dedicated SLA", included: false },
        ]}
      />
    );

    expect(screen.getByText("Pro Plan")).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("/ month")).toBeInTheDocument();
    expect(screen.getByText("For growing teams")).toBeInTheDocument();
    expect(screen.getByText("Unlimited components")).toBeInTheDocument();
    expect(screen.getByText("Dedicated SLA")).toBeInTheDocument();
  });

  it("renders badge and handles CTA click", () => {
    const handleCta = vi.fn();
    render(
      <PricingCard
        name="Enterprise"
        price={199}
        popular
        badge="Best Value"
        ctaText="Contact Sales"
        onCtaClick={handleCta}
      />
    );

    expect(screen.getByText("Best Value")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "Contact Sales" });
    fireEvent.click(button);
    expect(handleCta).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/pricing-card.test.tsx`
Expected: FAIL with "Cannot find module './pricing-card'"

- [ ] **Step 3: Write implementation for `PricingCard`**

```tsx
// packages/ui/src/components/pricing-card.tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Button } from "./button";

export type PricingFeatureItem =
  | string
  | {
      text: string;
      included?: boolean;
      tooltip?: string;
    };

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  price: string | number;
  period?: string;
  description?: string;
  features?: PricingFeatureItem[];
  variant?: "default" | "featured" | "outline";
  badge?: string;
  popular?: boolean;
  ctaText?: string;
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>;
  ctaHref?: string;
  cta?: React.ReactNode;
  disabled?: boolean;
}

export const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      name,
      price,
      period,
      description,
      features = [],
      variant,
      badge,
      popular = false,
      ctaText = "Get Started",
      onCtaClick,
      ctaHref,
      cta,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const resolvedVariant = variant || (popular ? "featured" : "default");
    const displayBadge = badge || (popular ? "Most Popular" : undefined);

    const isFeatured = resolvedVariant === "featured";

    return (
      <Card
        ref={ref}
        className={cn(
          "relative flex flex-col p-6 transition-all duration-300",
          isFeatured
            ? "border-amber-500/80 shadow-kj-lg ring-1 ring-amber-500/30"
            : resolvedVariant === "outline"
            ? "border-border/80 bg-transparent shadow-none"
            : "border-border shadow-kj-sm",
          className
        )}
        {...props}
      >
        {displayBadge && (
          <div className="absolute -top-3 right-5 rounded-full bg-amber-500 px-3 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-black shadow-sm">
            {displayBadge}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-xl font-bold tracking-tight text-foreground">{name}</h3>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>

        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">{price}</span>
          {period && <span className="text-xs font-medium text-muted-foreground">{period}</span>}
        </div>

        {features.length > 0 && (
          <ul className="mb-6 flex flex-1 flex-col gap-2.5 p-0 text-xs list-none">
            {features.map((feature, idx) => {
              const text = typeof feature === "string" ? feature : feature.text;
              const included = typeof feature === "string" ? true : feature.included ?? true;

              return (
                <li key={idx} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold",
                      included
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-muted text-muted-foreground/60"
                    )}
                  >
                    {included ? "✓" : "✕"}
                  </span>
                  <span className={cn(included ? "text-foreground" : "text-muted-foreground line-through opacity-70")}>
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-auto pt-2">
          {cta ? (
            cta
          ) : ctaHref ? (
            <Button
              as="a"
              href={ctaHref}
              variant={isFeatured ? "primary" : "outline"}
              className="w-full justify-center"
              disabled={disabled}
            >
              {ctaText}
            </Button>
          ) : (
            <Button
              variant={isFeatured ? "primary" : "outline"}
              className="w-full justify-center"
              onClick={onCtaClick}
              disabled={disabled}
            >
              {ctaText}
            </Button>
          )}
        </div>
      </Card>
    );
  }
);
PricingCard.displayName = "PricingCard";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/pricing-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/pricing-card.tsx packages/ui/src/components/pricing-card.test.tsx
git commit -m "feat(ui): add PricingCard component with unit tests"
```

---

### Task 2: `BlogCard` Component & Unit Tests

**Files:**
- Create: `packages/ui/src/components/blog-card.tsx`
- Create: `packages/ui/src/components/blog-card.test.tsx`

- [ ] **Step 1: Write the failing test for `BlogCard`**

```tsx
// packages/ui/src/components/blog-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogCard } from "./blog-card";

describe("BlogCard", () => {
  it("renders title, category, author, and reading time", () => {
    render(
      <BlogCard
        title="Building Modern Monorepos"
        description="A practical guide to component libraries."
        category="Architecture"
        readTime="5 min read"
        author={{ name: "Krystian Janiec", role: "Staff Engineer" }}
      />
    );

    expect(screen.getByText("Building Modern Monorepos")).toBeInTheDocument();
    expect(screen.getByText("A practical guide to component libraries.")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    expect(screen.getByText("Krystian Janiec")).toBeInTheDocument();
  });

  it("renders image cover with alt text", () => {
    render(
      <BlogCard
        title="Design Systems"
        coverUrl="https://example.com/cover.png"
        coverAlt="Design system cover"
      />
    );

    const img = screen.getByAltText("Design system cover");
    expect(img).toHaveAttribute("src", "https://example.com/cover.png");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/blog-card.test.tsx`
Expected: FAIL with "Cannot find module './blog-card'"

- [ ] **Step 3: Write implementation for `BlogCard`**

```tsx
// packages/ui/src/components/blog-card.tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Badge } from "./badge";
import { Avatar } from "./avatar";

export interface BlogCardAuthor {
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface BlogCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  coverUrl?: string;
  coverAlt?: string;
  category?: string;
  readTime?: string;
  publishedAt?: string;
  author?: BlogCardAuthor;
  orientation?: "vertical" | "horizontal";
  href?: string;
}

export const BlogCard = React.forwardRef<HTMLElement, BlogCardProps>(
  (
    {
      className,
      title,
      description,
      coverUrl,
      coverAlt,
      category,
      readTime,
      publishedAt,
      author,
      orientation = "vertical",
      href,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";
    const isInteractive = Boolean(href || props.onClick);

    return (
      <Card
        ref={ref}
        as={href ? "a" : "div"}
        href={href}
        interactive={isInteractive}
        className={cn(
          "group flex overflow-hidden border border-border bg-card text-card-foreground transition-all duration-300",
          isHorizontal ? "flex-col sm:flex-row" : "flex-col",
          className
        )}
        {...props}
      >
        {coverUrl && (
          <div
            className={cn(
              "relative overflow-hidden bg-muted shrink-0",
              isHorizontal ? "w-full sm:w-2/5 min-h-[160px]" : "w-full aspect-[16/9]"
            )}
          >
            <img
              src={coverUrl}
              alt={coverAlt || title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.75rem] text-muted-foreground">
              {category && <Badge variant="secondary">{category}</Badge>}
              {(readTime || publishedAt) && (
                <span>
                  {publishedAt} {publishedAt && readTime && "•"} {readTime}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-amber-500">
              {title}
            </h3>

            {description && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>

          {author && (
            <div className="mt-4 flex items-center gap-2.5 border-t border-border/60 pt-3">
              <Avatar name={author.name} src={author.avatarUrl} size="sm" />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-foreground">{author.name}</span>
                {author.role && <span className="text-[0.7rem] text-muted-foreground">{author.role}</span>}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
);
BlogCard.displayName = "BlogCard";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/blog-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/blog-card.tsx packages/ui/src/components/blog-card.test.tsx
git commit -m "feat(ui): add BlogCard component with unit tests"
```

---

### Task 3: `ProjectCard` Component & Unit Tests

**Files:**
- Create: `packages/ui/src/components/project-card.tsx`
- Create: `packages/ui/src/components/project-card.test.tsx`

- [ ] **Step 1: Write the failing test for `ProjectCard`**

```tsx
// packages/ui/src/components/project-card.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProjectCard } from "./project-card";

describe("ProjectCard", () => {
  it("renders title, description, status, tech stack and metrics", () => {
    render(
      <ProjectCard
        title="kj-product-kit"
        description="Design system starter kit."
        status={{ label: "Active", variant: "success" }}
        techStack={["React", "TypeScript", "Tailwind"]}
        metrics={[
          { label: "stars", value: 248 },
          { label: "forks", value: 34 },
        ]}
        updatedAt="Updated 2h ago"
      />
    );

    expect(screen.getByText("kj-product-kit")).toBeInTheDocument();
    expect(screen.getByText("Design system starter kit.")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("248")).toBeInTheDocument();
    expect(screen.getByText("Updated 2h ago")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/project-card.test.tsx`
Expected: FAIL with "Cannot find module './project-card'"

- [ ] **Step 3: Write implementation for `ProjectCard`**

```tsx
// packages/ui/src/components/project-card.tsx
import * as React from "react";
import { cn } from "../lib/cn";
import { Card } from "./card";
import { Badge } from "./badge";

export interface ProjectCardMetric {
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface ProjectCardStatus {
  label: string;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
}

export interface ProjectCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  status?: ProjectCardStatus;
  techStack?: string[];
  metrics?: ProjectCardMetric[];
  updatedAt?: string;
  actions?: React.ReactNode;
  href?: string;
}

export const ProjectCard = React.forwardRef<HTMLElement, ProjectCardProps>(
  (
    {
      className,
      title,
      description,
      status,
      techStack = [],
      metrics = [],
      updatedAt,
      actions,
      href,
      ...props
    },
    ref
  ) => {
    const isInteractive = Boolean(href || props.onClick);

    return (
      <Card
        ref={ref}
        as={href ? "a" : "div"}
        href={href}
        interactive={isInteractive}
        className={cn("flex flex-col justify-between p-5 border border-border bg-card text-card-foreground", className)}
        {...props}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-amber-500">
              {title}
            </h3>
            {status && (
              <Badge variant={status.variant || "neutral"} className="shrink-0 text-[0.65rem]">
                {status.label}
              </Badge>
            )}
          </div>

          {description && (
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{description}</p>
          )}

          {techStack.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <Badge key={tech} variant="outline" className="text-[0.65rem] py-0 px-2 font-mono">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {(metrics.length > 0 || updatedAt || actions) && (
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[0.75rem] text-muted-foreground">
            <div className="flex items-center gap-3">
              {metrics.map((metric, idx) => (
                <span key={idx} className="flex items-center gap-1 font-mono font-medium">
                  {metric.icon && <span className="shrink-0">{metric.icon}</span>}
                  <span>{metric.value}</span>
                  {metric.label && <span className="text-muted-foreground/70">{metric.label}</span>}
                </span>
              ))}
              {updatedAt && <span>{updatedAt}</span>}
            </div>

            {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
          </div>
        )}
      </Card>
    );
  }
);
ProjectCard.displayName = "ProjectCard";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/project-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/project-card.tsx packages/ui/src/components/project-card.test.tsx
git commit -m "feat(ui): add ProjectCard component with unit tests"
```

---

### Task 4: Exports, Storybook Stories & Documentation Sync

**Files:**
- Modify: `packages/ui/src/index.ts`
- Create: `packages/ui/src/components/pricing-card.stories.tsx`
- Create: `packages/ui/src/components/blog-card.stories.tsx`
- Create: `packages/ui/src/components/project-card.stories.tsx`
- Modify: `docs/BACKLOG.md:21-24`

- [ ] **Step 1: Add exports to `packages/ui/src/index.ts`**

Add exports for `PricingCard`, `BlogCard`, `ProjectCard` to `packages/ui/src/index.ts`.

```typescript
export { PricingCard, type PricingCardProps, type PricingFeatureItem } from "./components/pricing-card";
export { BlogCard, type BlogCardProps, type BlogCardAuthor } from "./components/blog-card";
export { ProjectCard, type ProjectCardProps, type ProjectCardStatus, type ProjectCardMetric } from "./components/project-card";
```

- [ ] **Step 2: Add Storybook stories**

Create `pricing-card.stories.tsx`, `blog-card.stories.tsx`, `project-card.stories.tsx`.

- [ ] **Step 3: Run full test suite & typecheck**

Run: `npm run typecheck && npm run test`
Expected: PASS with 0 errors.

- [ ] **Step 4: Update `docs/BACKLOG.md`**

Mark `PricingCard`, `BlogCard`, `ProjectCard` as `[x]` under P1 gap list.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/index.ts packages/ui/src/components/*.stories.tsx docs/BACKLOG.md
git commit -m "docs(ui): export Card Suite components, add Storybook stories, and update backlog"
```
