# Design System v0.3.0 — Spec

**Date:** 2026-05-30
**Scope:** `packages/ui` + `packages/design`
**Ship as:** single PR → `v0.3.0` version bump on both packages

---

## 1. Accordion grid bug fix (`packages/ui`)

**Problem:** `AccordionContent` uses `grid-rows-[0fr]` / `grid-rows-[1fr]` Tailwind arbitrary values. Under Tailwind CSS v4 these compile to `grid-template-rows: repeat(0fr, ...)` — invalid CSS, browser discards, all accordions stay permanently open.

**Fix:** Replace with arbitrary CSS property syntax in `accordion.tsx`:

```tsx
// before
isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"

// after
isOpen ? "[grid-template-rows:1fr]" : "[grid-template-rows:0fr]"
```

One line change. No API or token impact.

---

## 2. `"use client"` directives (`packages/ui`)

**Problem:** Components using React state, context, or browser events crash when imported directly in Next.js Server Components.

**Fix:** Add `"use client";` as the first line to these files:

- `accordion.tsx`
- `checkbox.tsx`
- `dropdown-menu.tsx`
- `modal.tsx`
- `progress.tsx`
- `segmented.tsx`
- `select.tsx`
- `slider.tsx`
- `switch.tsx`
- `tabs.tsx`
- `toast.tsx`
- `tooltip.tsx`

Stateless components (`badge`, `button`, `card`, `alert`, `avatar`, `breadcrumb`, `input`, `field`, `table`, `stat`, `spinner`) remain unchanged — RSC-safe as-is.

---

## 3. Badge `secondary` variant (`packages/ui`)

**Problem:** `Badge` has no `secondary` variant; consumers mapped it to `info` (wrong color).

**Fix:** Add to `badgeVariants` in `badge.tsx`, following the `primary` pattern:

```tsx
secondary: "bg-secondary/15 text-secondary-hover dark:text-secondary",
```

No new tokens needed. `--kj-secondary` and `--kj-secondary-hover` already exist.

---

## 4. Card polymorphic `as` prop (`packages/ui`)

**Problem:** `Card` is hardcoded to `div`; consumers need `article`, `section`, `li` for semantic HTML.

**Fix:** Add `as` prop with `"div"` default in `card.tsx`:

```tsx
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ as: Tag = "div", className, elevated, ...props }, ref) => (
    <Tag ref={ref} className={cn(...)} {...props} />
  )
);
```

`HTMLAttributes<HTMLElement>` (not `HTMLDivElement`) prevents TypeScript errors on non-div elements. Fully backwards compatible — default is still `div`.

---

## 5. Progress `barClassName` prop (`packages/ui`)

**Problem:** No way to target the inner bar `<span>` for animation without fragile CSS selectors.

**Fix:** Add `barClassName` to `ProgressProps` in `progress.tsx`, applied to the inner `<span>`:

```tsx
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  tone?: "primary" | "secondary";
  barClassName?: string;
}
// inner span:
className={cn("block h-full rounded-full ...", barClassName)}
```

No animation logic in the library. Consumer applies Tailwind keyframe utilities or custom CSS classes via `barClassName`. Example consumer usage:

```tsx
<Progress
  value={80}
  barClassName="origin-left animate-[skillBarIn_0.8s_ease-out_forwards]"
/>
```

---

## 6. Color shade scales 50–950 (`packages/design`)

**Problem:** Only flat tokens (`--kj-primary`, `--kj-secondary`) exist. Typography utilities and hover effects need full shade scales.

**Scope:** Primary (amber) + secondary (teal) only. Semantic colors (success/danger/warning/info) already have `-surface` tokens sufficient for their use cases.

**Fix — `packages/design/src/theme.css`:** Add under `:root`:

```css
/* Primary (amber) scale */
--kj-primary-50:  #fffbeb;
--kj-primary-100: #fef3c7;
--kj-primary-200: #fde68a;
--kj-primary-300: #fcd34d;
--kj-primary-400: #fbbf24;
--kj-primary-500: #f59e0b;
--kj-primary-600: #d97706;
--kj-primary-700: #b45309;
--kj-primary-800: #92400e;
--kj-primary-900: #78350f;
--kj-primary-950: #451a03;

/* Secondary (teal) scale */
--kj-secondary-50:  #f0fdfa;
--kj-secondary-100: #ccfbf1;
--kj-secondary-200: #99f6e4;
--kj-secondary-300: #5eead4;
--kj-secondary-400: #2dd4bf;
--kj-secondary-500: #14b8a6;
--kj-secondary-600: #0d9488;
--kj-secondary-700: #0f766e;
--kj-secondary-800: #115e59;
--kj-secondary-900: #134e4a;
--kj-secondary-950: #042f2e;
```

**Fix — `packages/design/src/tailwind.css`:** Add to `@theme` block:

```css
--color-primary-50:  var(--kj-primary-50);
/* ... through 950 */
--color-secondary-50:  var(--kj-secondary-50);
/* ... through 950 */
```

Existing `--kj-primary` / `--kj-secondary` flat tokens unchanged. Backwards compatible. Unlocks Tailwind utilities: `bg-primary-100`, `text-secondary-700`, etc.

---

## Version bump

Both packages bump to `v0.3.0`:
- `packages/ui/package.json`
- `packages/design/package.json`
- Root `package.json` (if it tracks versions)

---

## Out of scope

- Shade scales for success/danger/warning/info
- Radix `asChild` on Card
- Animation logic inside Progress
- Any component not listed above
