# KJ Product Kit Starter

Starter repo for KJ Product Kit.

## Structure

```txt
tokens/kj.tokens.json
packages/design/src/theme.css
packages/design/src/tailwind.css
docs/DESIGN.md
```

## How to use

In a Next.js app:

```tsx
import "@kj/design/theme.css"
```

Or with Tailwind v4:

```css
@import "@kj/design/tailwind.css";
```

Example:

```tsx
<div className="rounded-kj-2xl border border-border bg-card p-6 text-card-foreground shadow-kj-sm">
  <button className="rounded-kj-lg bg-primary px-4 py-2 text-primary-foreground">
    Save
  </button>
</div>
```

## Figma pages

```txt
01 Foundations
02 Components
03 Patterns
04 Portfolio
05 Dashboard
06 Mobile
07 Playground
```
