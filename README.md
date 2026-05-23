# KJ Product Kit

My product UI kit for building consistent KJ apps.

This repository is the source of truth for design tokens, theme styles,
Tailwind integration, reusable UI patterns, and documentation for agents.

## Structure

```txt
tokens/kj.tokens.json
packages/design/src/theme.css
packages/design/src/tailwind.css
docs/DESIGN.md
```

## What is included

- design tokens in JSON
- CSS variables for the theme
- Tailwind v4 bridge
- design guidelines in `docs/DESIGN.md`
- a base for future React UI components and playground examples

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

