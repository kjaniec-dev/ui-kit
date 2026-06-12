# Design System v0.5.0 — Spec

**Date:** 2026-06-12
**Scope:** `@kjaniec-dev/ui` (new components) and `@kjaniec-dev/design` (density tokens)
**Ship as:** single PR → `v0.5.0` bump on all packages

---

## 1. Density support (design tokens) & Theme Architecture

**Problem:** Dashboard applications and B2B SaaS tools require high data-density views (compact layout) in data-heavy screens, but clean, spacious layouts (comfortable layout) on marketing or simple settings pages. Additionally, the system must default to a high-productivity "KJ SaaS Dark" aesthetic (dark technical, amber gold/teal) while remaining flexible enough to be styled differently for other apps (e.g. landlord tenant portals, portfolios, or marketing landing pages).

**Fix:** 

### Density Multiplier Implementation
We define `--kj-density` as a dynamic CSS scale factor. Padding values inside spacing-sensitive components (such as Table Cells, Inputs, Buttons, and Selects) are defined using CSS `calc()` with this multiplier.

Under `packages/design/tokens.json` we register the density factors:
```json
  "density": {
    "default": {
      "$type": "dimension",
      "$value": "1.0"
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

This compiles into `theme.css`:
```css
:root {
  --kj-density-default: 1.0;
  --kj-density-compact: 0.82;
  --kj-density-comfortable: 1.18;
  --kj-density: var(--kj-density-default);
}

[data-density="compact"] {
  --kj-density: var(--kj-density-compact);
}

[data-density="comfortable"] {
  --kj-density: var(--kj-density-comfortable);
}
```

Components consume spacing variables that adapt dynamically:
```css
/* Example component usage */
.kj-input, .kj-button {
  padding: calc(0.5rem * var(--kj-density)) calc(1rem * var(--kj-density));
}
```

---

### Theme Customization & App Isolation
To support apps with different visual requirements (e.g. bright/approachable landlord tools or colorful accounting utilities), the design system is strictly built on **semantic abstractions** (`primary`, `secondary`, `surface`, `border`, `background`). 

By default, the `@kjaniec-dev/design` package configures:
- **`light` mode:** light gray backgrounds, amber actions, teal secondary indicators.
- **`dark` mode:** "KJ SaaS Dark" technical dark aesthetic (near-black, dark gray card surfaces, amber highlights).

For an app requiring a customized theme (e.g., slate/emerald), the consumer can override these CSS custom properties in their local stylesheet *without* having to modify or fork the React component library:
```css
/* Custom App Theme Overrides */
:root {
  --kj-primary: #10b981;             /* Emerald brand color */
  --kj-primary-hover: #059669;
  --kj-radius-lg: 1.25rem;           /* Rounder, friendlier cards */
  --kj-font-sans: 'Outfit', sans-serif; /* Soft geometric typography */
}
```

---

## 2. `EmptyState` component

**Problem:** Dashboard sections, tables, or search results often yield no data. A generic text is unprofessional. We need a modern, centered empty-state view with an icon, title, description, and action button.

**New file:** `packages/ui/src/components/empty-state.tsx`

**Interface:**
```tsx
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

**Markup:**
```tsx
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

---

## 3. `MetricCard` (KPI indicator)

**Problem:** SaaS apps require displaying numbers, earnings, and usage limits in visual grid cards, showing trends (e.g. +12% increase) and indicators.

**New file:** `packages/ui/src/components/metric-card.tsx`

**Interface:**
```tsx
export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
  icon?: React.ReactNode;
}
```

**Markup:**
```tsx
export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, trend, trendDirection = "neutral", description, icon, ...props }, ref) => {
    const trendColor = {
      up: "text-success bg-success-surface border-success/20",
      down: "text-danger bg-danger-surface border-danger/20",
      neutral: "text-muted-foreground bg-muted border-border/20",
    }[trendDirection];

    return (
      <Card ref={ref} className={cn("p-6", className)} {...props}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {title}
          </span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="flex items-baseline gap-2.5 mb-1.5">
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
          {trend && (
            <span className={cn("text-[0.75rem] font-bold px-2 py-0.5 rounded-full border", trendColor)}>
              {trend}
            </span>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";
```

---

## 4. `DataTable` (compound component)

**Problem:** Developers need to render grids of data with built-in empty states, loading indicator sheets, and error message layouts. Wiring standard `Table` elements together repeatedly is highly redundant.

**New file:** `packages/ui/src/components/data-table.tsx`

**Interface:**
```tsx
export interface DataTableColumn<T> {
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}
```

**Markup:**
```tsx
export function DataTable<T>({
  className,
  columns,
  data,
  loading = false,
  error,
  emptyTitle = "No data available",
  emptyDescription = "There are no records to display at this time.",
  emptyAction,
  ...props
}: DataTableProps<T>) {
  return (
    <TableWrap className={cn("relative overflow-hidden", className)} {...props}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Spinner size={32} />
                  <span className="text-sm text-muted-foreground">Loading dataset...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-8">
                <Alert variant="danger" title="Error loading data">
                  {error}
                </Alert>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  className="border-none bg-transparent rounded-none py-16"
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className}>
                    {col.accessor(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {loading && data.length > 0 && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] grid place-items-center z-10 transition-opacity duration-150">
          <Spinner size={36} />
        </div>
      )}
    </TableWrap>
  );
}
```

---

## Exports & Stories

### 1. Barrel Export
Add to `packages/ui/src/index.ts`:
```ts
export { EmptyState, type EmptyStateProps } from "./components/empty-state";
export { MetricCard, type MetricCardProps } from "./components/metric-card";
export { DataTable, type DataTableProps, type DataTableColumn } from "./components/data-table";
```

### 2. Storybook Stories
Provide standard and custom stories for each:
- `empty-state.stories.tsx` — basic empty state, empty state with custom icon, and empty state with action buttons.
- `metric-card.stories.tsx` — positive up-trend, negative down-trend, basic neutral metric, and layout grid of cards.
- `data-table.stories.tsx` — basic tabular data representation, active loading state overlay, error banner display, and empty table redirect.

---

## Out of scope

- Direct connection to state management libraries (Redux, Zustand) or fetch wrappers (React Query, RTK Query).
- Column sorting or filtering logic (handled externally by data mapping or consumer code).
- Virtualized lists or infinite scrolling for table views.
