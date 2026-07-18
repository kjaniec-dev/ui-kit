# Rating Component Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a modern, accessible, and flexible Rating component suite (`Rating`, `RatingField`, and `RatingSummary`) in `@kjaniec-dev/ui` with Vitest unit tests and showcase gallery exam1
1ples.

**Architecture:** Create modular components under `packages/ui/src/components/rating/`. `<Rating />` acts as the core primitive supporting fractional fills (via SVG linear gradients), hover states, size variants, custom icons, keyboard navigation, and form compatibility. `<RatingField />` wraps `Rating` with accessibility labels and error/helper text. `<RatingSummary />` provides aggregate ratings with 5-to-1 star distribution progress bars.

**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Lucide icons, Vitest, React Testing Library.

---

### Task 1: Implement Core `<Rating />` Primitive with TDD

**Files:**
- Create: `packages/ui/src/components/rating/rating.tsx`
- Create: `packages/ui/src/components/rating/rating.test.tsx`

- [ ] **Step 1: Write failing tests for `<Rating />`**

Create `packages/ui/src/components/rating/rating.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Rating } from './rating';

describe('Rating', () => {
  it('renders default 5 stars', () => {
    render(<Rating value={3} readOnly data-testid="rating-test" />);
    const container = screen.getByTestId('rating-test');
    expect(container).toBeInTheDocument();
  });

  it('handles click to select rating in interactive mode', () => {
    const handleChange = vi.fn();
    render(<Rating defaultValue={0} onChange={handleChange} />);
    const starButtons = screen.getAllByRole('radio');
    expect(starButtons.length).toBe(5);

    fireEvent.click(starButtons[3]); // 4th star
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('supports keyboard navigation (ArrowRight / ArrowLeft)', () => {
    const handleChange = vi.fn();
    render(<Rating value={2} onChange={handleChange} />);
    const radioGroup = screen.getByRole('radiogroup');

    fireEvent.keyDown(radioGroup, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith(3);

    fireEvent.keyDown(radioGroup, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('resets to 0 when clicking active value if allowClear is true', () => {
    const handleChange = vi.fn();
    render(<Rating value={3} allowClear onChange={handleChange} />);
    const starButtons = screen.getAllByRole('radio');

    fireEvent.click(starButtons[2]); // 3rd star (already active value)
    expect(handleChange).toHaveBeenCalledWith(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: FAIL with "Cannot find module './rating'"

- [ ] **Step 3: Implement core `<Rating />` component**

Create `packages/ui/src/components/rating/rating.tsx`:
```tsx
import React, { useState, useId } from 'react';
import { Star, Heart, Flame, Shield, ThumbsUp } from 'lucide-react';

export type RatingSize = 'sm' | 'md' | 'lg' | 'xl';
export type RatingIconType = 'star' | 'heart' | 'flame' | 'shield' | 'thumb';

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: number;
  size?: RatingSize;
  icon?: RatingIconType | React.ComponentType<{ className?: string; filledPercent?: number }>;
  color?: string;
  emptyColor?: string;
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  showValue?: boolean;
  showCount?: boolean | number;
  name?: string;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number | null) => void;
}

const sizeClasses: Record<RatingSize, { icon: string; gap: string; text: string }> = {
  sm: { icon: 'w-4 h-4', gap: 'gap-0.5', text: 'text-xs' },
  md: { icon: 'w-5 h-5', gap: 'gap-1', text: 'text-sm' },
  lg: { icon: 'w-6 h-6', gap: 'gap-1.5', text: 'text-base' },
  xl: { icon: 'w-8 h-8', gap: 'gap-2', text: 'text-lg' },
};

const builtinIcons: Record<RatingIconType, React.ComponentType<{ className?: string }>> = {
  star: Star,
  heart: Heart,
  flame: Flame,
  shield: Shield,
  thumb: ThumbsUp,
};

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(({
  value: controlledValue,
  defaultValue = 0,
  max = 5,
  precision = 1,
  size = 'md',
  icon = 'star',
  color = 'text-amber-400 fill-amber-400',
  emptyColor = 'text-slate-300 dark:text-slate-700 fill-slate-200/50 dark:fill-slate-800',
  readOnly = false,
  disabled = false,
  allowClear = true,
  showValue = false,
  showCount,
  name,
  onChange,
  onHoverChange,
  className = '',
  ...props
}, ref) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<number>(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const maskId = useId();

  const currentValue = isControlled ? controlledValue : internalValue;
  const displayValue = hoverValue !== null ? hoverValue : currentValue;

  const handleSelect = (val: number) => {
    if (readOnly || disabled) return;
    const newValue = allowClear && currentValue === val ? 0 : val;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly || disabled) return;
    let nextVal = currentValue;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextVal = Math.min(max, currentValue + precision);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextVal = Math.max(0, currentValue - precision);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextVal = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextVal = max;
    }

    if (nextVal !== currentValue) {
      if (!isControlled) setInternalValue(nextVal);
      onChange?.(nextVal);
    }
  };

  const renderIcon = (index: number) => {
    const starNumber = index + 1;
    const fillAmount = Math.max(0, Math.min(1, displayValue - (starNumber - 1)));
    const percent = Math.round(fillAmount * 100);

    const IconComp = typeof icon === 'string' ? builtinIcons[icon] || Star : icon;
    const gradientId = `${maskId}-gradient-${index}`;

    return (
      <button
        key={index}
        type="button"
        disabled={readOnly || disabled}
        role={readOnly ? undefined : 'radio'}
        aria-checked={readOnly ? undefined : currentValue >= starNumber}
        aria-label={`${starNumber} star${starNumber > 1 ? 's' : ''}`}
        tabIndex={readOnly || disabled ? -1 : currentValue === starNumber || (currentValue === 0 && index === 0) ? 0 : -1}
        onClick={() => handleSelect(starNumber)}
        onMouseEnter={() => {
          if (!readOnly && !disabled) {
            setHoverValue(starNumber);
            onHoverChange?.(starNumber);
          }
        }}
        onMouseLeave={() => {
          if (!readOnly && !disabled) {
            setHoverValue(null);
            onHoverChange?.(null);
          }
        }}
        className={`relative inline-flex items-center justify-center transition-transform ${
          !readOnly && !disabled ? 'cursor-pointer hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded' : 'cursor-default'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <svg className={`${sizeClasses[size].icon} pointer-events-none`} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset={`${percent}%`} stopColor="currentColor" className={color} />
              <stop offset={`${percent}%`} stopColor="currentColor" className={emptyColor} />
            </linearGradient>
          </defs>
          <IconComp className={percent === 100 ? color : percent === 0 ? emptyColor : ''} style={percent > 0 && percent < 100 ? { fill: `url(#${gradientId})`, stroke: 'currentColor' } : undefined} />
        </svg>
      </button>
    );
  };

  return (
    <div
      ref={ref}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rated ${currentValue} out of ${max}` : 'Rating'}
      aria-valuenow={currentValue}
      aria-valuemin={0}
      aria-valuemax={max}
      tabIndex={readOnly || disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center ${sizeClasses[size].gap} select-none ${className}`}
      {...props}
    >
      {name && <input type="hidden" name={name} value={currentValue} />}
      <div className={`inline-flex items-center ${sizeClasses[size].gap}`}>
        {Array.from({ length: max }, (_, i) => renderIcon(i))}
      </div>
      {showValue && (
        <span className={`font-semibold ml-1.5 text-slate-900 dark:text-slate-100 ${sizeClasses[size].text}`}>
          {currentValue.toFixed(precision < 1 ? 1 : 0)}
        </span>
      )}
      {showCount !== undefined && showCount !== false && (
        <span className={`text-slate-500 dark:text-slate-400 ${sizeClasses[size].text}`}>
          ({typeof showCount === 'number' ? showCount : ''})
        </span>
      )}
    </div>
  );
});

Rating.displayName = 'Rating';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit core `<Rating />` primitive**

```bash
git add packages/ui/src/components/rating/rating.tsx packages/ui/src/components/rating/rating.test.tsx
git commit -m "feat(ui): add core Rating primitive with precision and keyboard support"
```

---

### Task 2: Implement `<RatingField />` Form Wrapper

**Files:**
- Create: `packages/ui/src/components/rating/rating-field.tsx`
- Modify: `packages/ui/src/components/rating/rating.test.tsx`

- [ ] **Step 1: Add unit tests for `<RatingField />`**

Append to `packages/ui/src/components/rating/rating.test.tsx`:
```tsx
import { RatingField } from './rating-field';

describe('RatingField', () => {
  it('renders label, helper text and error message', () => {
    render(
      <RatingField
        label="Service Quality"
        helperText="Rate your recent experience"
        errorMessage="Rating is required"
        required
      />
    );

    expect(screen.getByText('Service Quality')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Rate your recent experience')).toBeInTheDocument();
    expect(screen.getByText('Rating is required')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: FAIL with "Cannot find module './rating-field'"

- [ ] **Step 3: Implement `<RatingField />`**

Create `packages/ui/src/components/rating/rating-field.tsx`:
```tsx
import React, { useId } from 'react';
import { Rating, RatingProps } from './rating';

export interface RatingFieldProps extends RatingProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorMessage?: React.ReactNode;
  required?: boolean;
}

export const RatingField = React.forwardRef<HTMLDivElement, RatingFieldProps>(({
  label,
  helperText,
  errorMessage,
  required = false,
  className = '',
  id: customId,
  ...ratingProps
}, ref) => {
  const autoId = useId();
  const id = customId || autoId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        </label>
      )}

      <Rating
        ref={ref}
        id={id}
        aria-describedby={[helperText ? helperId : null, errorMessage ? errorId : null].filter(Boolean).join(' ') || undefined}
        {...ratingProps}
      />

      {errorMessage ? (
        <p id={errorId} className="text-xs text-rose-500 font-medium">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

RatingField.displayName = 'RatingField';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit `<RatingField />`**

```bash
git add packages/ui/src/components/rating/rating-field.tsx packages/ui/src/components/rating/rating.test.tsx
git commit -m "feat(ui): add RatingField wrapper with label and error states"
```

---

### Task 3: Implement `<RatingSummary />` Breakdown Card

**Files:**
- Create: `packages/ui/src/components/rating/rating-summary.tsx`
- Modify: `packages/ui/src/components/rating/rating.test.tsx`

- [ ] **Step 1: Add unit tests for `<RatingSummary />`**

Append to `packages/ui/src/components/rating/rating.test.tsx`:
```tsx
import { RatingSummary } from './rating-summary';

describe('RatingSummary', () => {
  it('renders aggregate score and percentage breakdown rows', () => {
    const distribution = [
      { stars: 5, count: 80 },
      { stars: 4, count: 10 },
      { stars: 3, count: 5 },
      { stars: 2, count: 3 },
      { stars: 1, count: 2 },
    ];

    render(
      <RatingSummary
        average={4.6}
        totalCount={100}
        distribution={distribution}
      />
    );

    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('Based on 100 ratings')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: FAIL with "Cannot find module './rating-summary'"

- [ ] **Step 3: Implement `<RatingSummary />`**

Create `packages/ui/src/components/rating/rating-summary.tsx`:
```tsx
import React from 'react';
import { Rating, RatingSize, RatingIconType } from './rating';

export interface RatingDistributionItem {
  stars: number;
  count: number;
  percentage?: number;
}

export interface RatingSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  average: number;
  totalCount: number;
  distribution?: RatingDistributionItem[];
  max?: number;
  size?: RatingSize;
  icon?: RatingIconType;
}

export const RatingSummary = React.forwardRef<HTMLDivElement, RatingSummaryProps>(({
  average,
  totalCount,
  distribution = [],
  max = 5,
  size = 'lg',
  icon = 'star',
  className = '',
  ...props
}, ref) => {
  // Ensure default distribution for max stars down to 1
  const sortedDistribution = Array.from({ length: max }, (_, i) => {
    const stars = max - i;
    const found = distribution.find((d) => d.stars === stars);
    const count = found ? found.count : 0;
    const percentage = found?.percentage !== undefined
      ? found.percentage
      : totalCount > 0
        ? Math.round((count / totalCount) * 100)
        : 0;
    return { stars, count, percentage };
  });

  return (
    <div
      ref={ref}
      className={`p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center gap-6 ${className}`}
      {...props}
    >
      {/* Aggregate Score Side */}
      <div className="flex flex-col items-center justify-center text-center sm:border-r border-slate-200 dark:border-slate-800 sm:pr-6 min-w-[140px]">
        <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {average.toFixed(1)}
        </span>
        <Rating value={average} precision={0.5} size={size} icon={icon} readOnly className="my-1.5" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Based on {totalCount.toLocaleString()} ratings
        </span>
      </div>

      {/* Star Distribution Progress Rows */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {sortedDistribution.map(({ stars, percentage, count }) => (
          <div key={stars} className="flex items-center gap-3 text-xs">
            <span className="w-6 font-medium text-slate-600 dark:text-slate-300 text-right">
              {stars}★
            </span>
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${stars} star ratings percentage`}
              />
            </div>
            <span className="w-10 text-right text-slate-500 dark:text-slate-400 font-mono">
              {percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

RatingSummary.displayName = 'RatingSummary';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run packages/ui/src/components/rating/rating.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit `<RatingSummary />`**

```bash
git add packages/ui/src/components/rating/rating-summary.tsx packages/ui/src/components/rating/rating.test.tsx
git commit -m "feat(ui): add RatingSummary component with distribution progress bars"
```

---

### Task 4: Package Exports & Build Verification

**Files:**
- Create: `packages/ui/src/components/rating/index.ts`
- Modify: `packages/ui/src/components/index.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `docs/BACKLOG.md:41`

- [ ] **Step 1: Export component suite**

Create `packages/ui/src/components/rating/index.ts`:
```typescript
export * from './rating';
export * from './rating-field';
export * from './rating-summary';
```

Modify `packages/ui/src/components/index.ts` to add:
```typescript
export * from './rating';
```

Modify `packages/ui/src/index.ts` to re-export from `components`:
Ensure `export * from './components/rating';` is present.

- [ ] **Step 2: Check off BACKLOG item**

Update `docs/BACKLOG.md`:
Change `- [ ] Rating` to `- [x] Rating — interactive star/icon input, RatingField wrapper, and RatingSummary score distribution breakdown.`

- [ ] **Step 3: Run full typecheck and build validation**

Run: `npm run typecheck && npm run build`  
Expected: Clean build with 0 TypeScript/build errors.

- [ ] **Step 4: Commit exports and backlog update**

```bash
git add packages/ui/src/components/rating/index.ts packages/ui/src/components/index.ts packages/ui/src/index.ts docs/BACKLOG.md
git commit -m "feat(ui): export Rating component suite and update backlog"
```

---

### Task 5: Showcase Gallery Integration in `site/`

**Files:**
- Modify: `site/src/main.tsx` (or gallery section component)

- [ ] **Step 1: Add Rating showcase section**

In `site/src/main.tsx`, import `Rating`, `RatingField`, `RatingSummary` from `@kjaniec-dev/ui` and render a live showcase section featuring:
- Interactive Rating size & color variants
- Custom Icon variants (Hearts, Flames, Shields)
- `RatingField` form input with error state
- `RatingSummary` aggregate review card

- [ ] **Step 2: Run site build and test suite**

Run: `npm run test && npm run build`  
Expected: All tests pass, build completes successfully.

- [ ] **Step 3: Commit showcase gallery integration**

```bash
git add site/src/main.tsx
git commit -m "docs(site): add Rating component suite to showcase gallery"
```
