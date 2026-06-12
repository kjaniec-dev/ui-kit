# KJ Product Kit

Design tokens and React component library for building consistent KJ apps.

## Packages

| Package | Description |
|---|---|
| [`@kjaniec-dev/design`](./packages/design) | Design tokens, CSS variables, Tailwind v4 theme |
| [`@kjaniec-dev/ui`](./packages/ui) | React component library built on the token system |

## Repo structure

```
packages/
  design/       ← tokens only, no build step
    theme.css       CSS custom properties (--kj-*)
    tailwind.css    Tailwind v4 @theme bridge
    tokens.json     Raw token values
  ui/           ← React components
    src/components/ All components + Storybook stories
    src/index.ts    Barrel export
    tsup.config.ts  Builds ESM + CJS + .d.ts into dist/
site/           ← Interactive component gallery (Vite React app)
docs/           ← Design guidelines
```

## Local development

```bash
npm install
```

**Component gallery** (Vite dev server):
```bash
npm run site:dev      # → http://localhost:5173
```

**Storybook** (live component dev):
```bash
npm run storybook     # → http://localhost:6006
```

## Using in a project

```bash
npm install @kjaniec-dev/ui @kjaniec-dev/design
```

Root CSS (import order matters):
```css
@import "tailwindcss";
@import "@kjaniec-dev/design/tailwind.css";
@import "@kjaniec-dev/ui/ui.css";
```

Components:
```tsx
import { Button, Card, ToastProvider, useToast } from "@kjaniec-dev/ui";

function SaveButton() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ message: "Saved!", tone: "success" })}>
      Save
    </Button>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Card className="p-6">
        <SaveButton />
      </Card>
    </ToastProvider>
  );
}
```

Tailwind utilities (`bg-primary`, `text-muted-foreground`, `rounded-kj-md`, `shadow-kj-sm`, …) are registered automatically via the `@theme` block in `tailwind.css`.

## Publishing to npm

```bash
npm login

# design package (no build needed)
cd packages/design && npm publish

# ui package (auto-builds via prepublishOnly)
cd packages/ui && npm publish
```

See [PUBLISHING.md](./PUBLISHING.md) for the full step-by-step guide.

## Chromatic (Storybook hosting)

Set your token in `.env.local` (gitignored):
```
CHROMATIC_PROJECT_TOKEN=chpt_xxxx
```

Publish:
```bash
source .env.local && npm run chromatic --workspace @kjaniec-dev/ui
```

## Deploy gallery to Netlify

The `site/` folder is a self-contained HTML file — no build step needed.

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod     # netlify.toml points publish = "site"
```

Or drag the `site/` folder onto [app.netlify.com](https://app.netlify.com).
