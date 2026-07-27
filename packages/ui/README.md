# @kjaniec-dev/ui

React + TypeScript component library built on top of the **@kjaniec-dev/design** token system. Every component styles itself through the Tailwind theme mapping in `@kjaniec-dev/design/tailwind.css` — so light/dark mode and any token change flow through automatically with zero per-component overrides.

## Install (within the monorepo)

This package lives in `packages/ui` and depends on the sibling design package:

```jsonc
// peerDependencies
"react": ">=18",
"react-dom": ">=18",
"@kjaniec-dev/design": "*"
```

Runtime deps: `class-variance-authority`, `clsx`, `tailwind-merge`.

## Setup

In your app's global stylesheet, import the design tokens (Tailwind v4 `@theme`) and the small runtime stylesheet that ships keyframes + the slider thumb:

```css
@import "tailwindcss";
@source "../node_modules/@kjaniec-dev/ui";
@import "@kjaniec-dev/design/tailwind.css";
@import "@kjaniec-dev/ui/ui.css";
```

Toggle dark mode by adding the `.dark` class to `<html>` (the design package remaps every `--kj-*` variable under `.dark`).

## Usage

```tsx
import { Button, Card, CardHeader, CardTitle, Badge, ToastProvider, useToast } from "@kjaniec-dev/ui";

function Example() {
  const { toast } = useToast();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace</CardTitle>
        <Badge variant="success" dot>Active</Badge>
      </CardHeader>
      <Button onClick={() => toast({ message: "Saved!", tone: "success" })}>
        Save
      </Button>
    </Card>
  );
}

// Wrap the app once so useToast() works:
// <ToastProvider><App /></ToastProvider>
```

## Live demo

Two ways to preview:

- **Storybook** (recommended for development) — an isolated preview of every component, auto-generated prop docs from the TSX types, controls for clicking through variants, a light/dark toggle in the toolbar and an accessibility (a11y) audit tab on every page:

  ```bash
  npm install
  npm run storybook
  ```

- `demo.html` — a **standalone, runnable gallery** in a single file. Open it in a browser (no build) to see and click through every component in light/dark. It loads the real component source via Babel + the Tailwind token mapping, so it's the same code that ships in `src/`.

## Components

| Group | Exports |
|---|---|
| **Actions** | `Button` |
| **Status** | `Badge`, `Alert`, `Spinner`, `Progress` |
| **Forms** | `Input`, `Textarea`, `Select`, `Label`, `Hint`, `Field` |
| **Selection** | `Checkbox`, `Radio`, `Switch`, `Slider`, `Segmented` |
| **Layout** | `Card` (+ `CardHeader/Title/Description/Content/Footer`), `Stat`, `Avatar`, `AvatarGroup` |
| **Navigation** | `Tabs`, `Accordion`, `DropdownMenu`, `Breadcrumb`, `Pagination` |
| **Data** | `Table` (+ `TableWrap/Header/Body/Row/Head/Cell`) |
| **Overlays** | `Modal`, `Tooltip`, `ToastProvider` / `useToast` |

## Conventions

- **Variants via CVA.** Components with visual modes (`Button`, `Badge`, `Avatar`, `Alert`) expose a typed `variant` / `size` / `tone` prop through `class-variance-authority`.
- **`className` always merges.** Every component runs its classes through `cn()` (`clsx` + `tailwind-merge`), so a caller-supplied `className` reliably wins conflicts.
- **`forwardRef` everywhere** that wraps a single DOM node.
- **Controlled where it matters.** `Tabs`, `Accordion`, `Segmented`, `Pagination`, `Modal` accept controlled state; `Tabs`/`Accordion` also support an uncontrolled `defaultValue`.
- **Tokens, not hex.** Components reference Tailwind classes that map to `--kj-*` variables (`bg-primary`, `rounded-kj-md`, `shadow-kj-sm`), never literal colors — so the kit re-themes for free.

## Source of truth

The HTML/CSS reference (`KJ Product Kit.html` + `design/components.css` in the design repo) is the visual spec these components mirror. If a component's look should change, update both so the static gallery and the React library stay in sync.
