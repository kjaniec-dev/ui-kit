# Publishing @kjaniec-dev/design, @kjaniec-dev/ui, and @kjaniec-dev/ui-mcp

A step-by-step guide for publishing the design system packages to npm and deploying the interactive gallery to Netlify.

---

## 1. Repo Structure

The monorepo structure is as follows:

```
kj-product-kit/
├── packages/
│   ├── design/          ← Design tokens, CSS custom properties, and Tailwind theme
│   ├── ui/              ← React component library
│   └── mcp/             ← Model Context Protocol server for AI context
├── site/                ← Vite React interactive component gallery
├── netlify.toml         ← Netlify deployment configuration
└── package.json         ← Root workspace manifest
```

---

## 2. The Design Package

The design package at `packages/design` parses the source-of-truth `tokens.json` to generate the CSS custom properties in `src/theme.css` and the Tailwind CSS `@theme` bridge in `src/tailwind.css`.

To compile design tokens before publishing:
```bash
cd packages/design
npm run build
```

This runs the `build-tokens.js` script to ensure all CSS styles are synchronized.

---

## 3. The UI Package

The React components package at `packages/ui` contains:

- `tsup.config.ts`: Builds ESM, CommonJS, and TypeScript declaration files into `dist/`.
- `src/index.ts`: Barrel export of all components (excluding `"use client"` so that static components can be imported in React Server Components without overhead).
- `src/components/`: All components and Storybook stories.
- `.storybook/`: Storybook 8 config equipped with a11y tests, interaction tests, and Tailwind v4.

---

## 4. Authenticate with npm

Before publishing, ensure you are logged in to the registry with appropriate permissions:

```bash
npm login        # log in to npmjs.com
npm whoami       # verify your logged-in username
```

---

## 5. Publish @kjaniec-dev/design

To publish the design tokens package:

```bash
cd packages/design
npm run build      # ensure tokens are generated
npm publish
```

---

## 6. Publish @kjaniec-dev/ui

To publish the React UI components library:

```bash
cd packages/ui
npm publish
```

The `prepublishOnly` hook runs automatically:
1. Cleans the `dist` folder.
2. Compiles TypeScript source files into ESM, CJS, and `.d.ts` definitions.
3. Copies component stylesheet assets.

---

## 7. Publish @kjaniec-dev/ui-mcp

To publish the MCP server package:

```bash
cd packages/mcp
npm publish
```

The `prepublishOnly` hook compiles the MCP server executable into `dist/index.js` and packs metadata.

---

## 8. Using the packages in an app

Install the packages:
```bash
npm install @kjaniec-dev/ui @kjaniec-dev/design
```

In your root CSS stylesheet (import order matters):
```css
@import "tailwindcss";
@import "@kjaniec-dev/design/tailwind.css";
@import "@kjaniec-dev/ui/ui.css";
```

In your component files:
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

---

## 9. Deploy the gallery to Netlify

The component gallery (`site/`) is built using Vite and deployed automatically.

### Option A — Connected GitHub Repo (Recommended)

In Netlify → **Add new site → Import from Git**:
- **Repository**: `kjaniec-dev/ui-kit`
- **Branch**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `site/dist`

Every push to `main` will build the site and deploy it automatically.

### Option B — Netlify CLI

Run the following commands in the root of the project:

```bash
npm install -g netlify-cli   # install CLI once
netlify login
netlify deploy --prod        # reads netlify.toml and deploys site/dist
```

---

## 10. Bumping versions

For future releases, bump package versions inside their respective directories or using Workspace commands:

```bash
# Example patch release (0.4.0 -> 0.4.1)
npm version patch
npm publish
```
