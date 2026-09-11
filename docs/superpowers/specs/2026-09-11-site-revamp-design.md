# Specification: KJ Product Kit Presentation Site Revamp

**Date:** 2026-09-11  
**Status:** Approved  
**Scope:** `site` package (`site/src/`)

---

## 1. Overview & Objectives

Transform the current `ui.kjaniec.dev` presentation site from a flat component gallery into a comprehensive, developer-focused product showcase for **KJ Product Kit**.

Key objectives:
1. **Unified Identity:** Rebrand from `KJ UI Kit` to **KJ Product Kit** (matching repo and README).
2. **Top-Level Navigation & Modular Views:** Introduce clean top-level tabs via a lightweight, zero-dependency hash-based routing system (`#overview`, `#components`, `#patterns`, `#tokens`, `#mcp`).
3. **Developer Hero & Overview (`#overview`):** Fast technical intro with copyable install commands, key metric badges (React 19, Tailwind 4, OKLCH, 50+ components), 3 core value pillars, and live interactive previews.
4. **Structured Component Directory (`#components`):** Reorganize the flat 15-item sidebar into 7 semantic categories (*Foundations*, *Inputs & Forms*, *Data Display*, *Feedback*, *Navigation*, *Overlays*, *Layouts*), retaining all existing component sections and search functionality.
5. **Interactive B2B Product Patterns (`#patterns`):** Showcase 3 real-world SaaS compositions (*Invoice & Accounting Dashboard*, *Tenant & Property Manager*, *Project & Dev Console*) with live interactive controls and inspectable source code.
6. **Design Tokens Inspector (`#tokens`):** Interactive visualizer for OKLCH color scales, radiuses, shadows, and typography with click-to-copy CSS variables and Tailwind classes.
7. **AI-Native MCP Guide (`#mcp`):** Dedicated guide and 1-click JSON configurations for `@kjaniec-dev/ui-mcp` across Cursor, Claude Desktop, and Antigravity, plus MCP tool catalog.
8. **Dynamic Versioning:** Inject package version from `package.json` dynamically into the site header.

---

## 2. Architecture & Routing

### 2.1 Route Model (`useHashRoute`)
A custom React hook (`site/src/hooks/use-hash-route.ts`) handles browser hash changes without external dependencies:
* Route schema: `#<tab>[/<subId>]`
  * `""` or `"#/"` or `"#overview"` → `tab = "overview"`
  * `"#components"` or `"#components/<section-id>"` → `tab = "components"`, `subId = "<section-id>"`
  * `"#patterns"` or `"#patterns/<pattern-id>"` → `tab = "patterns"`, `subId = "<pattern-id>"`
  * `"#tokens"` → `tab = "tokens"`
  * `"#mcp"` → `tab = "mcp"`
* Listens to `window.addEventListener("hashchange")` and synchronizes browser history.
* Safe fallback: Unrecognized hashes redirect to `overview`.

### 2.2 Shell & Global Header (`site/src/components/site-header.tsx`)
* **Left:** KJ monogram (`bg-primary text-primary-foreground font-mono`), title **KJ Product Kit**, and dynamic version pill (e.g. `v0.9.3`).
* **Center:** Desktop navigation tabs:
  * `Overview`
  * `Components`
  * `Patterns`
  * `Tokens`
  * `MCP`
* **Right:**
  * External link to GitHub repository (`https://github.com/kjaniec-dev/ui-kit` with external icon `↗`).
  * Dark / Light theme toggle button.
  * Mobile menu toggle (hamburger) for small viewports.

---

## 3. View Specifications

### 3.1 Overview View (`site/src/views/overview-view.tsx`)
* **Hero Section:**
  * Headline: **KJ Product Kit**
  * Tagline: *React 19 & Tailwind 4 design system for B2B SaaS, dashboards, and developer tooling.*
  * Badges: `50+ Components` · `React 19` · `Tailwind 4` · `OKLCH Palette` · `MCP Native` · `TypeScript`.
  * Quick Actions:
    * Primary CTA: `Explore Components →` (navigates to `#components`)
    * Secondary CTA: `View Patterns →` (navigates to `#patterns`)
    * GitHub repo link
  * Quickstart snippet:
    * `npm install @kjaniec-dev/ui @kjaniec-dev/design`
    * `npx @kjaniec-dev/ui-mcp`
* **3 Value Proposition Pillars (Feature Cards):**
  1. **OKLCH Design Tokens:** Modern perceptual color scales (Amber primary, Teal secondary), adaptive dark mode, and Tailwind v4 `@theme` integration.
  2. **B2B Product Patterns:** Pre-composed real-world flows (financial tables, property drawers, command palettes) that accelerate SaaS frontend development.
  3. **AI-Native MCP Server:** Contextual component docs, props validation, and token schemas exposed to AI coding agents to eliminate hallucinations.
* **Interactive Live Preview:**
  * A compact dashboard card showcasing real UI kit primitives in action: `MetricCard`, a triggered `Toast`, `Segmented` control, and `Badge`.

### 3.2 Components View (`site/src/views/components-view.tsx`)
* **Grouped Sidebar Navigation:**
  Sidebar items organized into 7 semantic categories:
  1. **Foundations & Primitives:** Buttons (`#buttons`), Badges (`#badges`), Primitives (`#primitives` - Avatar, Kbd, Separator, CodeBlock, Stat)
  2. **Inputs & Forms:** Forms (`#forms`), Selection (`#selection` - Checkbox, Radio, Switch, Segmented, ToggleGroup), Rating (`#rating`), ColorPicker (`#color-picker`), InPost GeoWidget (`#inpost-geowidget`)
  3. **Data Display:** Table & DataTable (`#data`), Cards (`#cards` - MetricCard, PricingCard, BlogCard, ProjectCard)
  4. **Feedback:** Feedback (`#feedback` - Alert, Progress, ProgressRing, Skeleton, EmptyState, ErrorState)
  5. **Navigation:** Navigation (`#navigation` - Tabs, Breadcrumb, Pagination, BottomNavigation, Stepper, Timeline)
  6. **Overlays:** Overlays (`#overlays` - Modal, Drawer, BottomSheet, ConfirmDialog, Popover, Tooltip), InboxPopover (`#inbox-popover`)
  7. **Layouts:** Layouts (`#layouts` - DashboardShell, DetailPageLayout, SettingsLayout, AppShell)
* **Real-Time Filter:** Search input filters across all groups and highlights matching components.
* **Scroll Spy & Sub-anchors:** Smoothly scrolls to `#components/<id>` and updates active item via `IntersectionObserver`.
* **Mobile Drawer:** Slide-out navigation drawer on screens `< 820px`.

### 3.3 Patterns View (`site/src/views/patterns-view.tsx`)
Interactive demonstration of 3 production-grade B2B compositions:
1. **Invoice & Accounting Dashboard:**
   * `MetricCard` summary row (Total Invoiced, Pending Settlement, Overdue).
   * `TableToolbar` with search and status dropdown.
   * `DataTable` with multi-row selection, bulk actions ("Export CSV", "Send Reminders"), and status badges.
2. **Tenant & Property Manager:**
   * `DetailPageLayout` header with breadcrumbs and action buttons.
   * Interactive `Drawer` / `Sheet` for tenant details & lease adjustments.
   * `ConfirmDialog` for destructive lease termination action.
3. **Project & Dev Console:**
   * Interactive `CommandPalette` (`⌘K` shortcut or trigger button).
   * System health status pills.
   * Grid of `ProjectCard` items with deployment metrics and logs.
* **Controls:**
  * Tab bar switching between the 3 patterns.
  * Preview / Code toggle for each pattern, rendering highlighted code with Shiki and a copy button.

### 3.4 Tokens View (`site/src/views/tokens-view.tsx`)
Visual design system inspector reading token values:
* **Color Scales (OKLCH):**
  * Amber (Primary): 50 to 950 steps.
  * Teal (Secondary): 50 to 950 steps.
  * Zinc (Neutrals): 50 to 950 steps.
  * Semantic roles: Surface, Muted, Border, Success, Destructive, Info.
  * Interactive swatch: Displays hex/oklch, CSS variable name (`--kj-*`), and Tailwind utility (`bg-primary`); clicking copies the token name.
* **Radiuses & Shadows:**
  * Visual cards for `rounded-kj-sm`, `rounded-kj-md`, `rounded-kj-lg`, `rounded-kj-full`.
  * Visual cards for `shadow-kj-sm`, `shadow-kj-md`, `shadow-kj-lg`, `shadow-kj-glow`.
* **Typography:**
  * Preview of UI Font (Inter) and Code Font (JetBrains Mono / monospace) with font-weight ramps.

### 3.5 MCP View (`site/src/views/mcp-view.tsx`)
First-class documentation for `@kjaniec-dev/ui-mcp`:
* **Why MCP:** Highlighting the advantage of agentic AI coding with design token awareness.
* **1-Click Configurations:**
  * **Cursor** (`.cursor/mcp.json`) snippet.
  * **Claude Desktop** (`claude_desktop_config.json`) snippet.
  * **Antigravity / Generic stdio** CLI execution snippet (`npx -y @kjaniec-dev/ui-mcp`).
* **Tool Catalog:**
  * `list_components`: Lists all components and variants.
  * `get_component`: Detailed props, JSDoc definitions, and story snippets.
  * `get_tokens`: CSS variables and Tailwind utility maps.
  * `search_components`: Fuzzy search for use cases and components.
* **Interactive AI Simulation:** Simulated conversation demonstrating how an AI agent queries the MCP server and generates compliant JSX.

---

## 4. Technical Details & Build Integration

1. **Dynamic Versioning:**
   * In `site/vite.config.ts`, expose `__APP_VERSION__` from root `package.json` (or import directly from `packages/ui/package.json`).
   * Display `v${__APP_VERSION__}` in the site header and metadata.
2. **Code Structure:**
   ```
   site/src/
     hooks/
       use-hash-route.ts
     components/
       site-header.tsx
     views/
       overview-view.tsx
       components-view.tsx
       patterns-view.tsx
       tokens-view.tsx
       mcp-view.tsx
     sections/             (existing component section implementations)
     main.tsx              (root router orchestrator)
   ```
3. **Quality & Standards:**
   * Biome linting and formatting compliance (`npm run lint`, `npm run format:check`).
   * TypeScript type safety (`npm run typecheck`).
   * Existing tests continue to pass (`npm run test`).
   * Production build succeeds (`npm run build`).

---

## 5. Verification & Acceptance Criteria

* [ ] Navigating to `ui.kjaniec.dev` defaults to the Overview view with Developer Hero, Quickstart, and 3 pillars.
* [ ] Top header displays `KJ Product Kit`, version badge `v0.9.3`, nav tabs, GitHub link, and theme toggle.
* [ ] Clicking `Components` renders the component gallery with the new 7-category grouped sidebar.
* [ ] Component search filters items accurately within categories.
* [ ] Direct URL hash linking (e.g. `/#components/data` or `/#mcp`) loads the correct view and section.
* [ ] Patterns view allows interacting with all 3 B2B patterns and viewing their code snippets.
* [ ] Tokens view displays OKLCH color swatches and copies values on click.
* [ ] MCP view displays copyable config blocks for Cursor, Claude, and Antigravity.
* [ ] `npm run build` in `site` completes with 0 errors.
