# ESLint Flat Config & CI Pipeline Design Specification

**Date:** 2026-07-20  
**Status:** Approved  
**Target:** Monorepo Root (`kj-product-kit-starter`)  

---

## 1. Overview & Objectives

Add a unified ESLint v9 Flat Config to the monorepo root to enforce code quality, React hooks safety, and accessibility (`jsx-a11y`) across `@kjaniec-dev/ui`, `@kjaniec-dev/ui-mcp`, and `@kjaniec-dev/site`. Integrate linting into npm scripts and GitHub Actions CI.

---

## 2. Dependencies & Tooling

Install the following devDependencies at root:

- `eslint` (`^9.x`)
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-jsx-a11y`
- `globals`

---

## 3. Configuration (`eslint.config.mjs`)

Single root flat configuration importing recommended configs from ESLint JS, TypeScript ESLint, React Hooks, and `jsx-a11y`.

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
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
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
    },
  }
);
```

---

## 4. Scripts & Package Updates

Add to root `package.json`:
- `"lint": "eslint ."`
- `"lint:fix": "eslint . --fix"`

Add to `packages/ui/package.json`, `packages/mcp/package.json`, and `site/package.json`:
- `"lint": "eslint ."`

---

## 5. CI Pipeline (`.github/workflows/ci.yml`)

Add `Run ESLint` step right after `Run typecheck`:

```yaml
- name: Run ESLint
  run: npm run lint
```

---

## 6. Backlog Update

Update `docs/BACKLOG.md`:
`- [x] Add a linter (ESLint flat config...)`
