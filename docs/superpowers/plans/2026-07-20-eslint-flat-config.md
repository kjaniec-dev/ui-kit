# ESLint Flat Config & CI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure ESLint v9 Flat Config at the monorepo root with TypeScript, React Hooks, and `jsx-a11y` accessibility linting, add `lint` scripts across package.json files, fix any existing lint warnings, and integrate linting into CI.

**Architecture:** A single root `eslint.config.mjs` flat configuration file leveraging ESLint 9, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y`.

**Tech Stack:** ESLint v9 Flat Config, TypeScript, React 19, GitHub Actions.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `eslint.config.mjs` | Monorepo-wide ESLint v9 Flat Configuration |
| Modify | `package.json` | Add root `lint` and `lint:fix` scripts, devDependencies |
| Modify | `packages/ui/package.json` | Add `lint` script |
| Modify | `packages/mcp/package.json` | Add `lint` script |
| Modify | `site/package.json` | Add `lint` script |
| Modify | `.github/workflows/ci.yml` | Add `Run ESLint` step |
| Modify | `docs/BACKLOG.md` | Mark ESLint backlog item as complete |

---

## Task 1: Install devDependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1.1: Install ESLint v9 and plugins at root**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsx-a11y globals
```

- [ ] **Step 1.2: Verify package.json contains dependencies**

```bash
git diff package.json
```

Expected: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `globals` listed in `devDependencies`.

- [ ] **Step 1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install ESLint v9 and linting plugins"
```

---

## Task 2: Create `eslint.config.mjs` Flat Config

**Files:**
- Create: `eslint.config.mjs`

- [ ] **Step 2.1: Create `eslint.config.mjs` at root**

Create `eslint.config.mjs`:

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/.superpowers/**",
      "**/.worktrees/**",
      "**/data/*.json",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    plugins: {
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "off", // TypeScript handles undefined symbols
    },
  }
);
```

- [ ] **Step 2.2: Test running ESLint directly**

```bash
npx eslint . --max-warnings 500
```

Expected: Executes ESLint flat config without configuration errors.

- [ ] **Step 2.3: Commit**

```bash
git add eslint.config.mjs
git commit -m "chore: add root eslint.config.mjs flat configuration"
```

---

## Task 3: Add `lint` scripts to `package.json` files

**Files:**
- Modify: `package.json`
- Modify: `packages/ui/package.json`
- Modify: `packages/mcp/package.json`
- Modify: `site/package.json`

- [ ] **Step 3.1: Add `lint` and `lint:fix` scripts to root `package.json`**

In `package.json`:
Add under `"scripts"`:
```json
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

- [ ] **Step 3.2: Add `lint` scripts to package manifests**

In `packages/ui/package.json`: `"lint": "eslint ."`
In `packages/mcp/package.json`: `"lint": "eslint ."`
In `site/package.json`: `"lint": "eslint ."`

- [ ] **Step 3.3: Verify running `npm run lint`**

```bash
npm run lint
```

- [ ] **Step 3.4: Commit**

```bash
git add package.json packages/ui/package.json packages/mcp/package.json site/package.json
git commit -m "chore: add lint scripts across package.json manifests"
```

---

## Task 4: Fix any lint warnings & clean run

**Files:**
- Modify: any source files reported by `npm run lint`

- [ ] **Step 4.1: Run `npm run lint:fix` to auto-fix formatting & unused imports**

```bash
npm run lint:fix
```

- [ ] **Step 4.2: Inspect remaining lint issues if any**

```bash
npm run lint
```

Address any unhandled warnings or unused variables.

- [ ] **Step 4.3: Commit**

```bash
git add .
git commit -m "style: fix lint warnings across codebase"
```

---

## Task 5: Add `Run ESLint` step to GitHub Actions CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 5.1: Add ESLint step to `.github/workflows/ci.yml`**

In `.github/workflows/ci.yml`, add right after `Run typecheck`:

```yaml
      - name: Run ESLint
        run: npm run lint
```

- [ ] **Step 5.2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Run ESLint step to CI workflow"
```

---

## Task 6: Backlog update & final verification

**Files:**
- Modify: `docs/BACKLOG.md`

- [ ] **Step 6.1: Mark ESLint backlog item as complete in `docs/BACKLOG.md`**

In `docs/BACKLOG.md`:
Change `- [ ] Add a linter (ESLint flat config...)` to `- [x] Add a linter (ESLint flat config...)`.

- [ ] **Step 6.2: Monorepo verification**

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Expected: All 4 commands succeed with 0 errors.

- [ ] **Step 6.3: Commit**

```bash
git add docs/BACKLOG.md
git commit -m "chore: mark ESLint backlog item as complete in BACKLOG"
```
