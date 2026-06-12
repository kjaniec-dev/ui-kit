# Design System v0.5.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement density support custom property tokens, and create `EmptyState`, `MetricCard`, and `DataTable` components, bumping versions to `0.5.0`.

---

## File Map

| File | Change |
|------|--------|
| `packages/design/tokens.json` | Add density configurations |
| `packages/ui/src/components/empty-state.tsx` | Create EmptyState component |
| `packages/ui/src/components/empty-state.stories.tsx` | Create EmptyState stories |
| `packages/ui/src/components/metric-card.tsx` | Create MetricCard component |
| `packages/ui/src/components/metric-card.stories.tsx` | Create MetricCard stories |
| `packages/ui/src/components/data-table.tsx` | Create DataTable component |
| `packages/ui/src/components/data-table.stories.tsx` | Create DataTable stories |
| `packages/ui/src/index.ts` | Export new components |
| `packages/design/package.json` | Bump to `0.5.0` |
| `packages/ui/package.json` | Bump to `0.5.0` |
| `packages/mcp/package.json` | Bump to `0.5.0` |
| `site/package.json` | Bump to `0.5.0` |
| `package.json` (root) | Bump to `0.5.0` |

---

## Task 1: Density Support Tokens

**Files:**
- Modify: `packages/design/tokens.json`
- Regenerate: CSS output files using `npm run build --workspace @kjaniec-dev/design`

- [ ] **Step 1: Edit `tokens.json` to insert density configuration**

Under the root JSON object of `packages/design/tokens.json`, add the density definition (factor scale):
```json
  "density": {
    "default": {
      "$type": "dimension",
      "$value": "1"
    },
    "compact": {
      "$type": "dimension",
      "$value": "0.82"
    },
    "comfortable": {
      "$type": "dimension",
      "$value": "1.18"
    }
  }
```

- [ ] **Step 2: Update `build-tokens.js` to compile the density properties**

Update `packages/design/build-tokens.js` to output:
```css
:root {
  --kj-density: var(--kj-density-default);
}
```
And add selectors for:
```css
[data-density="compact"] {
  --kj-density: var(--kj-density-compact);
}
[data-density="comfortable"] {
  --kj-density: var(--kj-density-comfortable);
}
```

- [ ] **Step 3: Run token builder and check generated theme.css**

```bash
npm run build --workspace @kjaniec-dev/design
```

Verify that `--kj-density` is declared.

---

## Task 2: EmptyState Component

**Files:**
- Create: `packages/ui/src/components/empty-state.tsx`
- Create: `packages/ui/src/components/empty-state.stories.tsx`

- [ ] **Step 1: Create `empty-state.tsx`**

Write the component structure using `cn()` and styling:
```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-kj-lg bg-muted/20 min-h-[300px]",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
);
EmptyState.displayName = "EmptyState";
```

- [ ] **Step 2: Create `empty-state.stories.tsx`**

Implement basic, custom icon, and action redirect story states.

---

## Task 3: MetricCard Component

**Files:**
- Create: `packages/ui/src/components/metric-card.tsx`
- Create: `packages/ui/src/components/metric-card.stories.tsx`

- [ ] **Step 1: Create `metric-card.tsx`**

Include visual color tags matching trend directions (`up` = green, `down` = red, `neutral` = gray).

- [ ] **Step 2: Create `metric-card.stories.tsx`**

Configure controls and stories showing growth, shrinkage, and visual grids.

---

## Task 4: DataTable Component

**Files:**
- Create: `packages/ui/src/components/data-table.tsx`
- Create: `packages/ui/src/components/data-table.stories.tsx`

- [ ] **Step 1: Create `data-table.tsx`**

Implement tabular representation supporting `loading` spinners, custom column accessors, empty state renders, and error alerts.

- [ ] **Step 2: Create `data-table.stories.tsx`**

Configure test datasets with loading, empty, and normal rendering states.

---

## Task 5: Exporting & Publishing Setup

**Files:**
- Modify: `packages/ui/src/index.ts`
- Modify: package manifests for version bumps

- [ ] **Step 1: Add new component barrel exports to `src/index.ts`**

```ts
export { EmptyState, type EmptyStateProps } from "./components/empty-state";
export { MetricCard, type MetricCardProps } from "./components/metric-card";
export { DataTable, type DataTableProps, type DataTableColumn } from "./components/data-table";
```

- [ ] **Step 2: Bump all package.json versions to `0.5.0`**

Update `version` key in:
- `packages/design/package.json`
- `packages/ui/package.json`
- `packages/mcp/package.json`
- `site/package.json`
- Root `package.json`

- [ ] **Step 3: Run comprehensive check**

Verify build, test execution, and TypeScript compilation:
```bash
npm run typecheck
npm run test
npm run build
```
