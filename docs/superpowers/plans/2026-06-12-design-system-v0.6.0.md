# Design System v0.6.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement surface, chart, and motion design tokens, and create `FormField`, `ErrorState`, `Skeleton`, and `DashboardShell` components, bumping versions to `0.6.0`.

---

## File Map

| File | Change |
|------|--------|
| `packages/design/tokens.json` | Add surface, chart, and motion configurations |
| `packages/ui/src/components/form-field.tsx` | Create FormField component |
| `packages/ui/src/components/form-field.stories.tsx` | Create FormField stories |
| `packages/ui/src/components/error-state.tsx` | Create ErrorState component |
| `packages/ui/src/components/error-state.stories.tsx` | Create ErrorState stories |
| `packages/ui/src/components/skeleton.tsx` | Create Skeleton component |
| `packages/ui/src/components/skeleton.stories.tsx` | Create Skeleton stories |
| `packages/ui/src/components/dashboard-shell.tsx` | Create DashboardShell component |
| `packages/ui/src/components/dashboard-shell.stories.tsx` | Create DashboardShell stories |
| `packages/ui/src/index.ts` | Export new components |
| `packages/design/package.json` | Bump to `0.6.0` |
| `packages/ui/package.json` | Bump to `0.6.0` |
| `packages/mcp/package.json` | Bump to `0.6.0` |
| `site/package.json` | Bump to `0.6.0` |
| `package.json` (root) | Bump to `0.6.0` |

---

## Task 1: Surface, Chart, and Motion Tokens

**Files:**
- Modify: `packages/design/tokens.json`
- Modify: `packages/design/build-tokens.js`

- [ ] **Step 1: Add new token values in `tokens.json`**

In `packages/design/tokens.json`:
1. Add new keys in `color.semantic.light` and `color.semantic.dark` for the Surface System (`bgCanvas`, `bgSubtle`, `bgSurface`, `bgElevated`, `bgOverlay`, `borderSubtle`, `borderStrong`).
2. Add new keys in `color.semantic.light` and `color.semantic.dark` for Chart Colors (`chart1`, `chart2`, `chart3`).
3. Add the root `"motion"` token configuration at the bottom.

- [ ] **Step 2: Update `build-tokens.js` compiler**

In `packages/design/build-tokens.js`, add compiling logic for the `"motion"` tokens. Loop through `tokens.motion.duration` and `tokens.motion.ease` and output them as `--kj-duration-*` and `--kj-ease-*` custom properties in `theme.css`.

- [ ] **Step 3: Build design tokens and check output files**

```bash
npm run build --workspace @kjaniec-dev/design
```

Verify that all new variables are rendered inside `packages/design/src/theme.css` and mapped in `packages/design/src/tailwind.css`.

---

## Task 2: `FormField` Component

**Files:**
- Create: `packages/ui/src/components/form-field.tsx`
- Create: `packages/ui/src/components/form-field.stories.tsx`

- [ ] **Step 1: Create `form-field.tsx`**

Implement the wrapper logic utilizing `React.useId()`, cloning the child element to attach matching `id`, `aria-describedby` links, and error tags.

- [ ] **Step 2: Create `form-field.stories.tsx`**

Configure stories showing inputs with hints, required indicators, and validation error messages.

---

## Task 3: `ErrorState` and `Skeleton` Components

**Files:**
- Create: `packages/ui/src/components/error-state.tsx`
- Create: `packages/ui/src/components/error-state.stories.tsx`
- Create: `packages/ui/src/components/skeleton.tsx`
- Create: `packages/ui/src/components/skeleton.stories.tsx`

- [ ] **Step 1: Create `error-state.tsx`**

Implement error view layout using custom icons, error tones, and optional retry triggers.

- [ ] **Step 2: Create `error-state.stories.tsx`**

Create basic error and action retry stories.

- [ ] **Step 3: Create `skeleton.tsx`**

Implement the loading indicator skeleton with pulse animations.

- [ ] **Step 4: Create `skeleton.stories.tsx`**

Define text, circular, and block card layouts.

---

## Task 4: `DashboardShell` Layout Component

**Files:**
- Create: `packages/ui/src/components/dashboard-shell.tsx`
- Create: `packages/ui/src/components/dashboard-shell.stories.tsx`

- [ ] **Step 1: Create `dashboard-shell.tsx`**

Implement structural aside/main/nav responsive frames using the surface color tokens.

- [ ] **Step 2: Create `dashboard-shell.stories.tsx`**

Configure comprehensive SaaS sidebar menu shells and settings recipes.

---

## Task 5: Publish & Compile Verification

**Files:**
- Modify: `packages/ui/src/index.ts`
- Modify: package manifests for version bumps

- [ ] **Step 1: Export components in `src/index.ts`**

Export `FormField`, `ErrorState`, `Skeleton`, and `DashboardShell` components.

- [ ] **Step 2: Bump all package.json versions to `0.6.0`**

Update `version` in packages and root manifests.

- [ ] **Step 3: Check build and typecheck status**

```bash
npm run typecheck
npm run test
npm run build
```
