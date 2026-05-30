# Publishing @kjaniec-dev/design and @kjaniec-dev/ui

A step-by-step guide for publishing both packages and deploying the gallery to Netlify.

---

## 1. Repo structure

The monorepo at `github.com/kjaniec-dev/ui-kit` should look like this once the UI
package is added:

```
ui-kit/
├── packages/
│   ├── design/          ← already in repo — tokens only, no build step
│   └── ui/              ← copy kj-ui/ here from this project
├── site/                ← copy site/ here for Netlify gallery
├── netlify.toml         ← copy from this project
└── package.json         ← root workspace manifest (see below)
```

### Root package.json (add if missing)

```json
{
  "name": "kj-product-kit",
  "private": true,
  "workspaces": ["packages/*"]
}
```

---

## 2. Fix packages/design/package.json

The existing file is missing `publishConfig`. Replace it with the version in
`repo-snippets/packages/design/package.json` (in this project):

```json
{
  "publishConfig": { "access": "public" }
}
```

This is the only change needed — the design package has no build step (it ships
its CSS and JSON source files directly).

---

## 3. Add packages/ui

Copy the `kj-ui/` folder from this project into `packages/ui/` in the repo.
It already contains:

| File | Purpose |
|---|---|
| `package.json` | Correct exports, peerDeps, `publishConfig` |
| `tsup.config.ts` | Builds ESM + CJS + `.d.ts` into `dist/` |
| `src/index.ts` | Barrel export of every component |
| `src/components/*.tsx` | All components + Storybook stories |
| `.storybook/` | Storybook 8 config with a11y + Tailwind v4 |

---

## 4. Authenticate with npm

```bash
npm login        # log in to npmjs.com with the @kjaniec-dev org account
npm whoami       # should print your username
```

---

## 5. Publish @kjaniec-dev/design

```bash
cd packages/design
npm publish
# → Published @kjaniec-dev/design@0.1.0
```

No build step. The `files` array in `package.json` controls exactly what ships:
`theme.css`, `tailwind.css`, `tokens.json`, and `src/`.

---

## 6. Publish @kjaniec-dev/ui

```bash
cd packages/ui
npm publish
# prepublishOnly hook runs automatically:
#   1. rm -rf dist
#   2. tsup  → dist/index.js, dist/index.cjs, dist/index.d.ts
#   3. cp src/ui.css dist/ui.css
# → Published @kjaniec-dev/ui@0.1.0
```

> **Note:** If you get a 403, run `npm publish --access public` once to set the
> scope visibility, then future publishes won't need the flag.

---

## 7. Using the packages in an app

```bash
npm install @kjaniec-dev/ui @kjaniec-dev/design
```

In your root CSS (import order matters):

```css
@import "@kjaniec-dev/design/tailwind.css"; /* tokens → Tailwind theme */
@import "@kjaniec-dev/ui/ui.css";           /* component-specific styles (if any) */
```

In `tailwind.config.ts` (Tailwind v4, CSS-first — nothing extra needed):
the `@theme` block in `tailwind.css` registers all `--kj-*` tokens as utilities
(`bg-primary`, `text-muted-foreground`, `rounded-kj-md`, `shadow-kj-sm`, …).

In your component:

```tsx
import { Button, Badge, Card, toast } from "@kjaniec-dev/ui";

export default function App() {
  return (
    <Button onClick={() => toast({ message: "Saved!", tone: "success" })}>
      Save
    </Button>
  );
}
```

---

## 8. Deploy the gallery to Netlify

The `site/` folder is a single self-contained `index.html` — no build needed.

### Option A — Netlify CLI

```bash
npm install -g netlify-cli   # once
netlify login
netlify deploy --prod        # netlify.toml points publish = "site"
```

### Option B — Drag & drop

1. Open [app.netlify.com](https://app.netlify.com)
2. Drag the `site/` folder onto the deploy area
3. Done — you get a `*.netlify.app` URL instantly

### Option C — Connect the GitHub repo

In Netlify → **Add new site → Import from Git**:
- Repository: `kjaniec-dev/ui-kit`
- Branch: `main`
- Build command: *(leave empty)*
- Publish directory: `site`

Every push to `main` auto-deploys the gallery.

---

## 9. Bumping versions

Both packages start at `0.1.0`. For future releases:

```bash
# In packages/design or packages/ui:
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
npm publish
```
