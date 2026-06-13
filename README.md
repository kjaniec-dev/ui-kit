# KJ Product Kit

Design tokens and React component library for building consistent KJ apps.

**[⚡ Live Demo Component Gallery](https://kj-product-kit.netlify.app)**

---

## 🎨 Gallery Preview

<p align="center">
  <img src="./after-desktop2.png" width="800" alt="KJ Product Kit Desktop Gallery" />
</p>
<p align="center">
  <img src="./site-table-nav.png" width="800" alt="KJ Product Kit DataTable Navigation" />
</p>

---

## ✨ Features & Architecture

### Built for B2B Dashboards & Admin Panels
The kit is designed specifically for SaaS platforms, admin interfaces, and data-dense business apps. It includes key layout systems (`DashboardShell`, `SettingsLayout`, `DetailPageLayout`) and data grids (`DataTable` with selection, search, pagination, and sorting) that make building internal tools and B2B products extremely fast and visually coherent.

### Premium B2B Product Patterns
We provide realistic business dashboard patterns out-of-the-box:
- **Invoice & Accounting Dashboard**: Built using `DataTable` selection for bulk downloads, `TableToolbar` with date filters, and `MetricCard` for MRR and outstanding invoices.
- **Tenant & Property Manager**: Uses `Drawer` / `Sheet` for quick tenant settings, `DetailPageLayout` to inspect property stats, and `ConfirmDialog` to manage leases safely.
- **Project & Dev Console**: Outfitted with `CommandPalette` (`⌘K`) for fast developer navigation and keyboard-driven page redirects.

### AI-Assisted Product Development & MCP Server
KJ Product Kit features a first-class **Model Context Protocol (MCP) server** (`@kjaniec-dev/ui-mcp`). When using AI coding agents (like Gemini, Claude, or Cursor), the agent can query the design tokens and component specifications directly to write accurate, error-free UI code using this library.

#### MCP Query Example
AI agents can interact with the system by requesting information dynamically:
- `List Components`: Returns all components, variants, and descriptions.
- `Get Component (name: "DataTable")`: Fetches the API specifications, JSDoc parameters, and correct code examples for the requested component.
- `Get Design Tokens`: Returns the exact Tailwind v4 classes and CSS custom properties mapping.

---

## Packages

| Package | Description |
|---|---|
| [`@kjaniec-dev/design`](./packages/design) | Design tokens, CSS variables, Tailwind v4 theme |
| [`@kjaniec-dev/ui`](./packages/ui) | React component library built on the token system |

## Repo structure

```
packages/
  design/       ← design tokens and build script
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

# design package (auto-builds via prepublishOnly)
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

The gallery app in `site/` is a Vite React application. Netlify will build it and deploy `site/dist`.

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod     # reads netlify.toml, runs build and deploys site/dist
```
