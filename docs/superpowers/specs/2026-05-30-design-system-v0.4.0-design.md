# Design System v0.4.0 — Spec

**Date:** 2026-05-30
**Scope:** `packages/ui` only
**Ship as:** single PR → `v0.4.0` bump on `@kjaniec-dev/ui`

---

## 1. Card `interactive` prop

**Problem:** Personal website uses `hover:-translate-y-1 hover:shadow-kj-md` lift effect on project and learning page cards. Currently done via a local `Card` wrapper component — no equivalent in `@kjaniec-dev/ui`.

**Fix:** Add `interactive?: boolean` to `CardProps` in `packages/ui/src/components/card.tsx`.

When `true`, append to the `cn()` call:
```
"cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-kj-md"
```

Full updated `cn()`:
```tsx
className={cn(
  "bg-card text-card-foreground rounded-kj-xl overflow-hidden border",
  elevated ? "border-transparent shadow-kj-lg" : "border-border shadow-kj-sm",
  interactive && "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-kj-md",
  className
)}
```

Backwards compatible — default `false`. Composes with `as`, `elevated`, `className`.

**Story:** Add `Interactive` story to `card.stories.tsx` showing `<Card interactive>` with a hover instruction.

---

## 2. `PageHeader` component

**Problem:** Every major page on the personal website uses an identical page header pattern (eyebrow label, large title, optional description, optional actions). Currently a local component — no equivalent in `@kjaniec-dev/ui`.

**New file:** `packages/ui/src/components/page-header.tsx`

**Interface:**
```tsx
export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
```

**Markup:**
```tsx
<header className="py-12 md:py-16">
  <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
    <div className="space-y-3 max-w-2xl">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
  </div>
</header>
```

No internal state. `"use client"` directive at top (barrel-level requirement).

**Export:** Add to `packages/ui/src/index.ts`:
```ts
export { PageHeader, type PageHeaderProps } from "./components/page-header";
```

**Story:** New file `packages/ui/src/components/page-header.stories.tsx` with:
- `Basic` — eyebrow + title only
- `WithDescription` — eyebrow + title + description
- `WithActions` — eyebrow + title + description + two Button actions

---

## Version bump

`packages/ui/package.json` → `v0.4.0`
Root `package.json` → `v0.4.0`
`packages/design` — no changes, version stays at `v0.3.1`

---

## Out of scope

- `ProgressRing` (dead code in personal website, replaced by linear `Progress`)
- `Timeline` / `TimelineItem` (dead code in personal website)
- `Card glow` prop
- Any changes to `packages/design`
