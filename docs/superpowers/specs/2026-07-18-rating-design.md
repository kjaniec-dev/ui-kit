# Rating Component Suite Design Specification

**Date:** 2026-07-18  
**Status:** Approved  
**Target Package:** `@kjaniec-dev/ui`  

---

## 1. Overview & Objectives

The `Rating` suite provides a complete, accessible, and customizable star and icon rating solution for `@kjaniec-dev/ui`. It covers interactive form inputs, read-only product rating displays, form field integration, and aggregate score summary cards with percentage distribution bars.

### Key Deliverables:
1. `Rating` — Core star/icon rating primitive supporting interactive rating selection, half-star/fractional precision, variable sizes, and custom icons.
2. `RatingField` — Form field wrapper with label, helper text, required indicator, and error message integration.
3. `RatingSummary` — Aggregate rating display card featuring overall rating score, star display, total review count, and 5-star to 1-star percentage distribution progress bars.
4. Unit Tests — Comprehensive Vitest / React Testing Library coverage for interactive states, keyboard navigation, precision filling, form binding, and summary calculations.
5. Storybook / Showcase integration in `site/`.

---

## 2. Architecture & File Structure

All component files will reside in `packages/ui/src/components/rating/`:

```
packages/ui/src/components/rating/
├── rating.tsx            # Core Rating primitive component
├── rating-field.tsx      # RatingField wrapper component
├── rating-summary.tsx    # RatingSummary aggregate component
├── rating.test.tsx       # Vitest / RTL unit & accessibility tests
└── index.ts              # Exports components and type definitions
```

Exported in `packages/ui/src/components/index.ts` and `packages/ui/src/index.ts`.

---

## 3. Detailed Component Specifications

### 3.1 `Rating` (`packages/ui/src/components/rating/rating.tsx`)

#### Props Interface
```typescript
export type RatingSize = 'sm' | 'md' | 'lg' | 'xl';
export type RatingIconType = 'star' | 'heart' | 'flame' | 'shield' | 'thumb';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled value */
  value?: number;
  /** Initial uncontrolled value */
  defaultValue?: number;
  /** Maximum rating count (default: 5) */
  max?: number;
  /** Step precision: 1, 0.5, or 0.1 (default: 1) */
  precision?: number;
  /** Size variant (default: 'md') */
  size?: RatingSize;
  /** Icon preset or custom SVG component */
  icon?: RatingIconType | React.ComponentType<{ className?: string; filledPercent?: number }>;
  /** Color class for filled icons (default: 'text-amber-400') */
  color?: string;
  /** Color class for empty icons (default: 'text-slate-300 dark:text-slate-700') */
  emptyColor?: string;
  /** Read-only display mode */
  readOnly?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Clicking current active value resets to 0 (default: true) */
  allowClear?: boolean;
  /** Show numerical value label alongside stars */
  showValue?: boolean;
  /** Show review count or custom formatted count label */
  showCount?: boolean | number;
  /** Form name attribute */
  name?: string;
  /** Callback fired when rating value changes */
  onChange?: (value: number) => void;
  /** Callback fired on hover change */
  onHoverChange?: (value: number | null) => void;
}
```

#### Size Specs:
- `sm`: 16px icon, `gap-0.5`
- `md`: 20px icon, `gap-1`
- `lg`: 24px icon, `gap-1.5`
- `xl`: 32px icon, `gap-2`

#### Fractional / Precision Filling:
Using SVG linear gradient masks with unique IDs, each item renders exact clip fills based on `precision` (e.g. 0.5 half-star or 0.1 granular precision).

---

### 3.2 `RatingField` (`packages/ui/src/components/rating/rating-field.tsx`)

#### Props Interface
```typescript
export interface RatingFieldProps extends RatingProps {
  /** Label content */
  label?: React.ReactNode;
  /** Helper text displayed below rating */
  helperText?: React.ReactNode;
  /** Error message displayed below rating in error state */
  errorMessage?: React.ReactNode;
  /** Required field indicator */
  required?: boolean;
}
```

Renders structured HTML label, rating input control, and helper/error text with `aria-describedby` linking.

---

### 3.3 `RatingSummary` (`packages/ui/src/components/rating/rating-summary.tsx`)

#### Props Interface
```typescript
export interface RatingDistributionItem {
  stars: number;       // 5, 4, 3, 2, 1
  count: number;       // Review count for this star rating
  percentage?: number; // Optional explicit percentage (auto-calculated if omitted)
}

export interface RatingSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Overall average score (e.g. 4.8) */
  average: number;
  /** Total count of all reviews (e.g. 2419) */
  totalCount: number;
  /** Distribution breakdown for 5★ to 1★ */
  distribution?: RatingDistributionItem[];
  /** Maximum rating scale (default: 5) */
  max?: number;
  /** Size of aggregate star display (default: 'lg') */
  size?: RatingSize;
  /** Icon preset (default: 'star') */
  icon?: RatingIconType;
}
```

Renders aggregate rating header:
- Left / Top: Large average rating value (e.g. `4.8`), `Rating` component (readOnly), total review count note (`Based on 2,419 ratings`).
- Right / Bottom: 5 progress bar rows (5★ to 1★), displaying star label, progress bar filled proportionally, and count/percentage.

---

## 4. Accessibility & Keyboard Support

- `role="radiogroup"` for interactive ratings.
- Keyboard navigation:
  - `ArrowRight` / `ArrowUp`: Increase value by `precision`.
  - `ArrowLeft` / `ArrowDown`: Decrease value by `precision`.
  - `Home`: Reset to min/0.
  - `End`: Set to `max`.
  - `Space` / `Enter`: Commit rating value.
- `role="img"` or `role="meter"` for read-only displays with `aria-label="Rated 4.8 out of 5 stars"`.

---

## 5. Verification Plan

1. **Unit Tests (`rating.test.tsx`)**:
   - Render default state and size variants.
   - Click to select rating and test `onChange`.
   - Hover state and `onHoverChange`.
   - Half-star and fractional value clip calculations.
   - Read-only and disabled non-interactive behavior.
   - Keyboard arrow key navigation.
   - `RatingField` label and error message rendering.
   - `RatingSummary` aggregate score & distribution percentage calculations.
2. **Build & Type Checking**:
   - `npm run typecheck`
   - `npm run build`
3. **Showcase Integration**:
   - Add `<Rating />`, `<RatingField />`, and `<RatingSummary />` examples to showcase gallery in `site/`.
