# KJ Product Kit Presentation Site Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `ui.kjaniec.dev` from a flat component gallery into a comprehensive, developer-focused product showcase featuring 5 modular tabs (Overview, Components, Patterns, Tokens, MCP), a categorized sidebar, interactive B2B patterns, token inspector, AI MCP setup, and dynamic package versioning.

**Architecture:** A lightweight, zero-dependency hash-based routing system (`useHashRoute`) in the Vite SPA orchestrating a global branded header (`SiteHeader`) and 5 dedicated view modules (`OverviewView`, `ComponentsView`, `PatternsView`, `TokensView`, `McpView`), while preserving existing interactive component showcase sections.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, `@kjaniec-dev/ui`, `@kjaniec-dev/design`, Shiki, Vitest, Testing Library.

**Spec:** [`docs/superpowers/specs/2026-09-11-site-revamp-design.md`](file:///Volumes/kjdisk/projects/kj-product-kit-starter/docs/superpowers/specs/2026-09-11-site-revamp-design.md)

## Global Constraints

- Name must be unified as **KJ Product Kit** (matching repo and README).
- No external routing libraries (wouter, react-router); use the custom lightweight `useHashRoute` hook to preserve 100% Netlify/Cloudflare static hosting compatibility.
- Maintain existing `@kjaniec-dev/ui` component APIs without breaking changes.
- All code must pass Biome linting (`npm run lint`) and TypeScript checks (`npm run typecheck`).
- Unit tests written for each new hook and view using Vitest and React Testing Library.

---

### Task 1: Dynamic Version Injection & `useHashRoute` Hook

**Files:**
- Modify: `site/vite.config.ts`
- Modify: `site/src/vite-env.d.ts`
- Create: `site/src/hooks/use-hash-route.ts`
- Create: `site/src/hooks/use-hash-route.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type TabKey = "overview" | "components" | "patterns" | "tokens" | "mcp";
  export interface HashRoute {
    tab: TabKey;
    subRoute: string;
    navigate: (tab: TabKey, subRoute?: string) => void;
  }
  export function useHashRoute(): HashRoute;
  ```

- [ ] **Step 1: Write the failing test for `useHashRoute`**

Create `site/src/hooks/use-hash-route.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHashRoute } from "./use-hash-route";

describe("useHashRoute", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  it("defaults to overview tab when hash is empty", () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("overview");
    expect(result.current.subRoute).toBe("");
  });

  it("parses hash with tab and subRoute", () => {
    window.location.hash = "#components/buttons";
    const { result } = renderHook(() => useHashRoute());
    expect(result.current.tab).toBe("components");
    expect(result.current.subRoute).toBe("buttons");
  });

  it("updates state on navigate", () => {
    const { result } = renderHook(() => useHashRoute());
    act(() => {
      result.current.navigate("mcp");
    });
    expect(window.location.hash).toBe("#mcp");
    expect(result.current.tab).toBe("mcp");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/hooks/use-hash-route.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `useHashRoute` and configure `__APP_VERSION__`**

In `site/vite.config.ts`, import package version and inject `__APP_VERSION__`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import pkg from "../package.json";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/shiki") || id.includes("node_modules/@shikijs")) {
            return "shiki";
          }
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
        },
      },
    },
  },
});
```

In `site/src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
declare const __APP_VERSION__: string;
```

Create `site/src/hooks/use-hash-route.ts`:
```ts
import * as React from "react";

export type TabKey = "overview" | "components" | "patterns" | "tokens" | "mcp";

const VALID_TABS = new Set<TabKey>(["overview", "components", "patterns", "tokens", "mcp"]);

function parseHash(hash: string): { tab: TabKey; subRoute: string } {
  const clean = hash.replace(/^#\/?/, "").trim();
  if (!clean) return { tab: "overview", subRoute: "" };
  const [first, ...rest] = clean.split("/");
  const subRoute = rest.join("/");
  if (VALID_TABS.has(first as TabKey)) {
    return { tab: first as TabKey, subRoute };
  }
  // Legacy anchors or section anchors like #buttons or #data-table
  return { tab: "components", subRoute: first };
}

export function useHashRoute() {
  const [route, setRoute] = React.useState(() => parseHash(typeof window !== "undefined" ? window.location.hash : ""));

  React.useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = React.useCallback((tab: TabKey, subRoute?: string) => {
    const newHash = subRoute ? `#${tab}/${subRoute}` : `#${tab}`;
    if (window.location.hash === newHash) {
      setRoute(parseHash(newHash));
    } else {
      window.location.hash = newHash;
    }
  }, []);

  return { tab: route.tab, subRoute: route.subRoute, navigate };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/hooks/use-hash-route.test.ts`
Expected: PASS (all tests pass).

- [ ] **Step 5: Commit**

```bash
git add site/vite.config.ts site/src/vite-env.d.ts site/src/hooks/
git commit -m "feat(site): add dynamic version injection and useHashRoute hook"
```

---

### Task 2: Global Header & Rebranding (`SiteHeader`)

**Files:**
- Create: `site/src/components/site-header.tsx`
- Create: `site/src/components/site-header.test.tsx`

**Interfaces:**
- Consumes: `TabKey` from `site/src/hooks/use-hash-route.ts`, `__APP_VERSION__`
- Produces:
  ```ts
  export interface SiteHeaderProps {
    activeTab: TabKey;
    onSelectTab: (tab: TabKey) => void;
    dark: boolean;
    onToggleDark: () => void;
    mobileMenuOpen?: boolean;
    onToggleMobileMenu?: () => void;
    showMobileMenuButton?: boolean;
  }
  export function SiteHeader(props: SiteHeaderProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write the failing test for `SiteHeader`**

Create `site/src/components/site-header.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders KJ Product Kit brand title and version", () => {
    render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
      />
    );
    expect(screen.getByText("KJ Product Kit")).toBeInTheDocument();
    expect(screen.getByText(/v0\.9\.3/)).toBeInTheDocument();
  });

  it("calls onSelectTab when tab is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={onSelect}
        dark={false}
        onToggleDark={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Components/i }));
    expect(onSelect).toHaveBeenCalledWith("components");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/components/site-header.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `SiteHeader`**

Create `site/src/components/site-header.tsx`:
```tsx
import * as React from "react";
import { Button, Badge, cn } from "@kjaniec-dev/ui";
import type { TabKey } from "../hooks/use-hash-route";

export interface SiteHeaderProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  dark: boolean;
  onToggleDark: () => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  showMobileMenuButton?: boolean;
}

const TABS: { id: TabKey; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "patterns", label: "Patterns" },
  { id: "tokens", label: "Tokens" },
  { id: "mcp", label: "MCP", badge: "AI" },
];

export function SiteHeader({
  activeTab,
  onSelectTab,
  dark,
  onToggleDark,
  mobileMenuOpen,
  onToggleMobileMenu,
  showMobileMenuButton = false,
}: SiteHeaderProps) {
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.9.3";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 max-[820px]:px-4 py-3 border-b border-border transition-colors"
      style={{
        background: "color-mix(in oklch, var(--kj-background) 85%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-4">
        {showMobileMenuButton && onToggleMobileMenu && (
          <button
            type="button"
            className="hidden max-[820px]:flex items-center justify-center h-8 w-8 rounded-kj-sm hover:bg-muted transition-colors cursor-pointer border-0 bg-transparent text-foreground"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectTab("overview")}
          className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 text-left text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="grid place-items-center h-8 w-8 rounded-kj-md bg-primary text-primary-foreground font-bold font-mono text-sm shadow-kj-glow">
            KJ
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-foreground flex items-center gap-1.5">
              <span>KJ Product Kit</span>
              <span className="text-[0.68rem] px-1.5 py-0.5 rounded-kj-sm bg-muted text-muted-foreground font-mono font-medium">
                v{version}
              </span>
            </div>
            <div className="text-[0.68rem] text-muted-foreground hidden sm:block">
              React 19 &middot; Tailwind 4 Design System
            </div>
          </div>
        </button>
      </div>

      <nav className="flex items-center gap-1 max-[820px]:hidden">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-kj-sm text-sm font-medium transition-colors cursor-pointer border-0",
                active
                  ? "bg-primary/10 text-primary font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[0.62rem] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-primary text-primary-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/kjaniec-dev/ui-kit"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-kj-sm hover:bg-muted transition-colors no-underline"
        >
          <span>GitHub</span>
          <span className="text-[0.7rem]">&nearr;</span>
        </a>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          onClick={onToggleDark}
        >
          {dark ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/components/site-header.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/components/site-header.tsx site/src/components/site-header.test.tsx
git commit -m "feat(site): add SiteHeader with tab navigation and version badge"
```

---

### Task 3: Grouped Sidebar & `ComponentsView` Refactoring

**Files:**
- Create: `site/src/views/components-view.tsx`
- Create: `site/src/views/components-view.test.tsx`

**Interfaces:**
- Consumes: existing `PrimitivesSections`, `FormsSections`, `DataDisplaySections`, `NavigationSections`, `OverlaysSections`, `LayoutsSections` from `site/src/sections/`
- Produces:
  ```ts
  export interface ComponentsViewProps {
    initialSection?: string;
  }
  export function ComponentsView(props: ComponentsViewProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write test for `ComponentsView`**

Create `site/src/views/components-view.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentsView } from "./components-view";

describe("ComponentsView", () => {
  it("renders categorized sidebar and components", () => {
    render(<ComponentsView />);
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Inputs & Forms")).toBeInTheDocument();
    expect(screen.getByText("Data Display")).toBeInTheDocument();
    expect(screen.getByText("Overlays")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/components-view.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `ComponentsView`**

Create `site/src/views/components-view.tsx` with:
- Categories:
  - `Foundations`: Buttons (`#buttons`), Badges (`#badges`), Primitives (`#primitives`)
  - `Inputs & Forms`: Forms (`#forms`), Selection (`#selection`), Rating (`#rating`), ColorPicker (`#color-picker`), InPost GeoWidget (`#inpost-geowidget`)
  - `Data Display`: Table & DataTable (`#data`), Cards (`#cards`)
  - `Feedback`: Feedback (`#feedback`)
  - `Navigation`: Navigation (`#navigation`)
  - `Overlays`: Overlays (`#overlays`), InboxPopover (`#inbox-popover`)
  - `Layouts`: Layouts (`#layouts`)
- Real-time search filter matching component titles and categories.
- Embeds existing sections (`PrimitivesSections`, `FormsSections`, `DataDisplaySections`, `NavigationSections`, `OverlaysSections`, `LayoutsSections`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/components-view.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/views/components-view.tsx site/src/views/components-view.test.tsx
git commit -m "feat(site): create ComponentsView with 7-category grouped sidebar"
```

---

### Task 4: Developer Hero & `OverviewView`

**Files:**
- Create: `site/src/views/overview-view.tsx`
- Create: `site/src/views/overview-view.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export interface OverviewViewProps {
    onNavigate: (tab: TabKey, subRoute?: string) => void;
  }
  export function OverviewView(props: OverviewViewProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write test for `OverviewView`**

Create `site/src/views/overview-view.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OverviewView } from "./overview-view";

describe("OverviewView", () => {
  it("renders hero headline and feature cards", () => {
    render(<OverviewView onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /KJ Product Kit/i })).toBeInTheDocument();
    expect(screen.getByText(/Design Tokens & OKLCH/i)).toBeInTheDocument();
    expect(screen.getByText(/B2B Product Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-Native MCP Server/i)).toBeInTheDocument();
  });

  it("navigates to components on CTA click", () => {
    const onNav = vi.fn();
    render(<OverviewView onNavigate={onNav} />);
    fireEvent.click(screen.getByRole("button", { name: /Explore Components/i }));
    expect(onNav).toHaveBeenCalledWith("components");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/overview-view.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `OverviewView`**

Create `site/src/views/overview-view.tsx`:
- Hero header with badges (`50+ Components`, `React 19`, `Tailwind 4`, `OKLCH Palette`, `MCP Native`).
- Copyable terminal snippets (`npm install @kjaniec-dev/ui @kjaniec-dev/design` and `npx @kjaniec-dev/ui-mcp`).
- 3 Value proposition cards with direct action links to `#tokens`, `#patterns`, `#mcp`.
- Live interactive demo card: `MetricCard`, `Segmented`, and an interactive `Button` triggering feedback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/overview-view.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/views/overview-view.tsx site/src/views/overview-view.test.tsx
git commit -m "feat(site): create OverviewView with developer hero and value pillars"
```

---

### Task 5: Interactive B2B `PatternsView`

**Files:**
- Create: `site/src/views/patterns-view.tsx`
- Create: `site/src/views/patterns-view.test.tsx`

**Interfaces:**
- Consumes: `DataTable`, `TableToolbar`, `MetricCard`, `DetailPageLayout`, `Drawer`, `ConfirmDialog`, `CommandPalette`, `ProjectCard`, `HighlightedCode`
- Produces:
  ```ts
  export interface PatternsViewProps {
    initialPattern?: string;
  }
  export function PatternsView(props: PatternsViewProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write test for `PatternsView`**

Create `site/src/views/patterns-view.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatternsView } from "./patterns-view";

describe("PatternsView", () => {
  it("renders 3 B2B pattern selectors", () => {
    render(<PatternsView />);
    expect(screen.getByText(/Invoice & Accounting/i)).toBeInTheDocument();
    expect(screen.getByText(/Tenant & Property/i)).toBeInTheDocument();
    expect(screen.getByText(/Project & Dev Console/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/patterns-view.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `PatternsView`**

Create `site/src/views/patterns-view.tsx`:
- Tab navigation between the 3 patterns:
  1. `invoice`: Invoice & Accounting Dashboard (`MetricCard` row + `TableToolbar` + `DataTable` with bulk actions + status badges).
  2. `tenant`: Tenant & Property Manager (`DetailPageLayout` + tenant table + interactive `Drawer` for lease details + `ConfirmDialog`).
  3. `console`: Project & Dev Console (`CommandPalette` ⌘K shortcut + service status indicators + `ProjectCard` grid).
- Live Preview / Source Code toggle with Shiki-highlighted code and copy button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/patterns-view.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/views/patterns-view.tsx site/src/views/patterns-view.test.tsx
git commit -m "feat(site): create PatternsView with 3 interactive B2B SaaS patterns"
```

---

### Task 6: Design Tokens Inspector (`TokensView`)

**Files:**
- Create: `site/src/views/tokens-view.tsx`
- Create: `site/src/views/tokens-view.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export function TokensView(): React.JSX.Element;
  ```

- [ ] **Step 1: Write test for `TokensView`**

Create `site/src/views/tokens-view.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TokensView } from "./tokens-view";

describe("TokensView", () => {
  it("renders color scales and design tokens", () => {
    render(<TokensView />);
    expect(screen.getByText(/Primary Amber/i)).toBeInTheDocument();
    expect(screen.getByText(/Secondary Teal/i)).toBeInTheDocument();
    expect(screen.getByText(/Border Radius/i)).toBeInTheDocument();
    expect(screen.getByText(/Elevation & Shadows/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/tokens-view.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `TokensView`**

Create `site/src/views/tokens-view.tsx`:
- Color swatches: Amber (50-950), Teal (50-950), Zinc (50-950), and Semantic tokens (Surface, Border, Success, Destructive, Info).
- Click-to-copy handler displaying toast or transient "Copied!" notification.
- Radius visual scale (`rounded-kj-sm`, `md`, `lg`, `full`).
- Elevation/shadow scale (`shadow-kj-sm`, `md`, `lg`, `glow`).
- Typography ramp (UI and Monospace fonts).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/tokens-view.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/views/tokens-view.tsx site/src/views/tokens-view.test.tsx
git commit -m "feat(site): create TokensView with interactive OKLCH palette and token explorer"
```

---

### Task 7: AI MCP Documentation & Guide (`McpView`)

**Files:**
- Create: `site/src/views/mcp-view.tsx`
- Create: `site/src/views/mcp-view.test.tsx`

**Interfaces:**
- Consumes: `HighlightedCode`, `Badge`, `Button`, `Card`
- Produces:
  ```ts
  export function McpView(): React.JSX.Element;
  ```

- [ ] **Step 1: Write test for `McpView`**

Create `site/src/views/mcp-view.test.tsx`:
```tsx
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { McpView } from "./mcp-view";

describe("McpView", () => {
  it("renders MCP title and configuration sections", () => {
    render(<McpView />);
    expect(screen.getByRole("heading", { name: /Model Context Protocol/i })).toBeInTheDocument();
    expect(screen.getByText(/Cursor/i)).toBeInTheDocument();
    expect(screen.getByText(/Claude Desktop/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/mcp-view.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `McpView`**

Create `site/src/views/mcp-view.tsx`:
- Explanation of `@kjaniec-dev/ui-mcp` and AI-assisted development.
- Copyable JSON configurations for Cursor, Claude Desktop, and Antigravity stdio.
- Tools reference table: `list_components`, `get_component`, `get_tokens`, `search_components`.
- Simulated agent dialogue showing real prompt and response output.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/site -- site/src/views/mcp-view.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/src/views/mcp-view.tsx site/src/views/mcp-view.test.tsx
git commit -m "feat(site): create McpView with 1-click configs and tool reference"
```

---

### Task 8: App Root Integration & Full Verification

**Files:**
- Modify: `site/src/main.tsx`

**Interfaces:**
- Consumes: `SiteHeader`, `useHashRoute`, `OverviewView`, `ComponentsView`, `PatternsView`, `TokensView`, `McpView`

- [ ] **Step 1: Update `site/src/main.tsx` to render the modular views**

Refactor `site/src/main.tsx`:
- Mount `SiteHeader` with `activeTab`, `onSelectTab={navigate}`, and theme toggle.
- Conditionally render:
  - `overview` → `<OverviewView onNavigate={navigate} />`
  - `components` → `<ComponentsView initialSection={subRoute} />`
  - `patterns` → `<PatternsView initialPattern={subRoute} />`
  - `tokens` → `<TokensView />`
  - `mcp` → `<McpView />`
- Provide common footer with version link and copyright.

- [ ] **Step 2: Run all site unit tests**

Run: `npm run test --workspace @kjaniec-dev/site`
Expected: PASS (all tests pass).

- [ ] **Step 3: Run Biome lint & format check**

Run: `npm run lint && npm run format:check`
Expected: PASS (0 errors, 0 warnings).

- [ ] **Step 4: Run TypeScript typecheck across workspaces**

Run: `npm run typecheck --workspaces`
Expected: PASS (0 type errors).

- [ ] **Step 5: Run production build**

Run: `npm run build --workspace @kjaniec-dev/site`
Expected: PASS (Vite builds `dist/` cleanly).

- [ ] **Step 6: Commit**

```bash
git add site/src/main.tsx
git commit -m "feat(site): wire up modular views in main application shell"
```
