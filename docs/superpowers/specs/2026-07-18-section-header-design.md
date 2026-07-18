# Design Spec: SectionHeader Component

**Date:** 2026-07-18
**Status:** Approved
**Scope:** `@kjaniec-dev/ui` package

## Overview

`SectionHeader` is a versatile component used to introduce sections within pages, marketing views, and dashboard layouts. It closes a key gap identified in `docs/DESIGN.md` and `docs/BACKLOG.md`.

## Requirements & Goals

1. **Flexible API**: Supports both a single prop-driven component (`<SectionHeader title="..." kicker="..." description="..." actions="..." align="..." divider />`) and compound sub-components (`SectionHeader.Kicker`, `SectionHeader.Title`, etc.) for custom layout composition.
2. **Visual Alignment**: Follows the `DESIGN.md` token system (zinc/slate base, amber primary accent for kicker/eyebrow, subtle border dividers, light and dark mode compatibility).
3. **Responsive Layout**:
   - `align="left"` (default): Stacks elements vertically on small screens, aligns title/description on left and actions on right on medium+ screens (`md:flex-row md:items-end md:justify-between`).
   - `align="center"`: Center-aligned layout (`items-center text-center mx-auto max-w-3xl`).
4. **Semantics & Accessibility**: Customizable heading element level (`h2` by default, configurable to `h3` or `h4`).

## Component Specifications

### Interface & Types

```typescript
import * as React from "react";

export type SectionHeaderAlign = "left" | "center";
export type SectionHeaderHeadingLevel = "h2" | "h3" | "h4";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: SectionHeaderAlign;
  headingLevel?: SectionHeaderHeadingLevel;
  divider?: boolean;
}
```

### Sub-components API
- `SectionHeader`: Main container.
- `SectionHeader.Kicker`: Uppercase kicker/eyebrow text (`font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary`).
- `SectionHeader.Title`: Heading element with configurable tag (`h2`, `h3`, `h4`) and styling (`text-2xl sm:text-3xl font-bold tracking-tight text-foreground`).
- `SectionHeader.Description`: Description paragraph (`text-base text-muted-foreground leading-relaxed max-w-2xl`).
- `SectionHeader.Actions`: Action buttons/controls wrapper (`flex flex-wrap items-center gap-3`).

## Testing & Verification Plan

1. **Unit Tests (`packages/ui/src/components/section-header.test.tsx`)**:
   - Renders title, kicker, description, and actions correctly.
   - Applies `align="left"` and `align="center"` layout classes correctly.
   - Renders correct HTML heading tag based on `headingLevel` prop (`h2`, `h3`, `h4`).
   - Applies divider classes when `divider` is true.
   - Renders custom compound sub-components.

2. **Storybook (`packages/ui/src/components/section-header.stories.tsx`)**:
   - Default left-aligned header.
   - Centered header.
   - Header with actions and divider.
   - Compound sub-component composition example.

3. **Exports & Documentation**:
   - Re-export in `packages/ui/src/index.ts`.
   - Update `docs/BACKLOG.md` checking off `[x] SectionHeader`.
