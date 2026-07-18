# Card Suite Design Spec (`PricingCard`, `BlogCard`, `ProjectCard`)

**Date:** 2026-07-18  
**Author:** Antigravity  
**Status:** Approved  

---

## 1. Overview

To close the `docs/DESIGN.md` and `docs/BACKLOG.md` P1 component gaps, this specification outlines three dedicated, domain-specific card components for `@kjaniec-dev/ui`:

1. **`PricingCard`** — SaaS pricing plan card supporting tiered plans, popular/highlight badges, feature lists with included/excluded indicators, and action buttons.
2. **`BlogCard`** — Article and editorial preview card supporting cover images, author metadata, tags, reading time, and horizontal/vertical responsive layouts.
3. **`ProjectCard`** — Developer portfolio and console project card displaying status indicators, tech stack tags, repository metrics (stars/forks/views), and action link slots.

Each component is built on top of the base `Card` primitive and styled with `@kjaniec-dev/design` tokens.

---

## 2. Architecture & File Structure

The new components will be located in `packages/ui/src/components/`:

```
packages/ui/src/components/
├── pricing-card.tsx
├── pricing-card.test.tsx
├── pricing-card.stories.tsx
├── blog-card.tsx
├── blog-card.test.tsx
├── blog-card.stories.tsx
├── project-card.tsx
├── project-card.test.tsx
└── project-card.stories.tsx
```

All three components will be exported from `packages/ui/src/index.ts` and showcased in `site/`.

---

## 3. Detailed Component Contracts

### 3.1 `PricingCard`

#### Props (`PricingCardProps`)

```typescript
export type PricingFeatureItem = string | {
  text: string;
  included?: boolean; // default true
  tooltip?: string;
};

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  price: string | number;
  period?: string; // e.g. "/ month", "/ year"
  description?: string;
  features?: PricingFeatureItem[];
  variant?: "default" | "featured" | "outline"; // default "default"
  badge?: string; // e.g. "Most Popular"
  popular?: boolean; // shorthand to set variant="featured" and default badge="Most Popular"
  ctaText?: string; // default "Get Started"
  onCtaClick?: React.MouseEventHandler<HTMLButtonElement>;
  ctaHref?: string;
  cta?: React.ReactNode; // custom CTA element fallback
  disabled?: boolean;
}
```

#### Behavior & Styling
- **`featured` variant**: Uses `border-amber-500` (or `border-primary`) with subtle background glow, elevated shadow, and prominent top badge.
- **Features list**: Render checkmarks (`✓`) in success/amber accent for `included: true`, strikethrough/dimmed for `included: false`.
- **CTA**: Uses `Button` component internally with primary amber variant for `featured`, secondary/outline for standard.

---

### 3.2 `BlogCard`

#### Props (`BlogCardProps`)

```typescript
export interface BlogCardAuthor {
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface BlogCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  coverUrl?: string;
  coverAlt?: string;
  category?: string;
  readTime?: string;
  publishedAt?: string;
  author?: BlogCardAuthor;
  orientation?: "vertical" | "horizontal"; // default "vertical"
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

#### Behavior & Styling
- **`vertical` orientation**: Aspect-ratio cover image on top, padding body below.
- **`horizontal` orientation**: Side-by-side flex layout on `sm:` breakpoints with cover image on left.
- **Hover micro-animation**: Image smoothly scales (`scale-105 transition-transform duration-300`) when wrapped in an interactive card link.

---

### 3.3 `ProjectCard`

#### Props (`ProjectCardProps`)

```typescript
export interface ProjectCardMetric {
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface ProjectCardStatus {
  label: string;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
}

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  status?: ProjectCardStatus;
  techStack?: string[];
  metrics?: ProjectCardMetric[];
  updatedAt?: string;
  actions?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}
```

#### Behavior & Styling
- **Status badge**: Rendered as a pill badge using badge token colors (`bg-success-surface text-success`, etc.).
- **Tech Stack**: Rendered using `Badge` or small tag pills.
- **Footer**: Displays repository/project metrics (`★ 248`, `⑂ 34`) alongside `updatedAt` timestamp.

---

## 4. Accessibility (a11y)

- All interactive card triggers (`href` or `onClick`) render proper semantic `<a>` or `<button>` wrappers or `as="a"`.
- Cover images receive `alt` attributes (`coverAlt` or fallback to `title`).
- Focus rings are styled using `--ring` tokens (`focus-visible:ring-2 focus-visible:ring-amber-500`).

---

## 5. Testing & Verification Plan

1. **Unit Tests (Vitest + React Testing Library)**
   - `pricing-card.test.tsx`: Render price, period, feature checkmarks, click handlers, badge presence.
   - `blog-card.test.tsx`: Render author details, cover image, category badge, vertical/horizontal layout classes.
   - `project-card.test.tsx`: Render status badge, tech stack tags, metrics list, action buttons.

2. **Storybook Stories**
   - Interactive stories demonstrating variants, dark mode, responsive layouts.

3. **Documentation & Backlog Sync**
   - Update `docs/BACKLOG.md` checking off `BlogCard`, `ProjectCard`, `PricingCard`.
   - Update `packages/ui/src/index.ts`.
