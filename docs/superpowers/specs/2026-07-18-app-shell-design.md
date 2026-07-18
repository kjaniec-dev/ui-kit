# AppShell Component Design Specification

- **Date**: 2026-07-18
- **Status**: Approved
- **Target Package**: `@kjaniec-dev/ui`

---

## 1. Executive Summary

`AppShell` is a flexible, top-level layout component designed for marketing websites, landing pages, documentation sites, developer portals, and SaaS public pages. It complements the existing `DashboardShell` (which handles sidebar-driven web applications) by offering a clean, top-to-bottom page hierarchy: Announcement Banner $\rightarrow$ Header / Top Navbar $\rightarrow$ Main Page Container $\rightarrow$ Footer.

---

## 2. Architecture & Usage Patterns

`AppShell` supports two complementary usage patterns:

1. **Slot-driven (Simple)**: Pass top-level slots (`banner`, `header`, `footer`, `children`) directly to `<AppShell>`.
2. **Compound subcomponents (Advanced)**: Use subcomponents (`AppShell.Banner`, `AppShell.Header`, `AppShell.Main`, `AppShell.Footer`) for full layout control and custom JSX compositions.

### 2.1 Example Usages

#### Simple Slot API
```tsx
import { AppShell } from "@kjaniec-dev/ui";

export function LandingPage() {
  return (
    <AppShell
      header={<Navbar />}
      footer={<Footer />}
      headerVariant="glass"
      contentWidth="default"
    >
      <HeroSection />
      <FeatureSection />
    </AppShell>
  );
}
```

#### Compound Subcomponents API
```tsx
import { AppShell } from "@kjaniec-dev/ui";

export function CustomPage() {
  return (
    <AppShell>
      <AppShell.Banner variant="accent">
        🚀 KJ Product Kit v1.0 is now live! Check out the docs.
      </AppShell.Banner>
      <AppShell.Header variant="glass" position="sticky">
        <Logo />
        <NavLinks />
      </AppShell.Header>
      <AppShell.Main width="wide">
        <Content />
      </AppShell.Main>
      <AppShell.Footer>
        <FooterLinks />
      </AppShell.Footer>
    </AppShell>
  );
}
```

---

## 3. Component Specifications & Types

### 3.1 `AppShellProps`

```tsx
export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional top announcement banner */
  banner?: React.ReactNode;
  /** Header navigation content */
  header?: React.ReactNode;
  /** Main page content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Width constraint for main content area (default: 'default') */
  contentWidth?: "default" | "narrow" | "wide" | "full";
  /** Header positioning (default: 'sticky') */
  headerPosition?: "sticky" | "fixed" | "static";
  /** Header visual variant (default: 'glass') */
  headerVariant?: "glass" | "solid" | "transparent";
  /** Whether main container includes default vertical padding (default: true) */
  paddedContent?: boolean;
}
```

### 3.2 Subcomponents

1. **`AppShell.Banner` (`AppShellBannerProps`)**
   - Slots for notification text, optional action link, and close button.
   - Variants: `primary`, `accent`, `muted`.

2. **`AppShell.Header` (`AppShellHeaderProps`)**
   - `<header>` element with responsive flex layout.
   - Variants: `glass` (`bg-surface/80 backdrop-blur-md border-b border-border/60`), `solid` (`bg-surface border-b border-border`), `transparent` (`bg-transparent`).
   - Positioning: `sticky`, `fixed`, `static`.
   - `mobileNav?: React.ReactNode` slot for mobile drawer overlay content.

3. **`AppShell.Main` (`AppShellMainProps`)**
   - `<main>` element wrapping page content.
   - Width options: `default` (`max-w-7xl mx-auto`), `narrow` (`max-w-5xl mx-auto`), `wide` (`max-w-screen-2xl mx-auto`), `full` (`max-w-none`).
   - Padding options: `padded` (default: `p-6 md:p-8`).

4. **`AppShell.Footer` (`AppShellFooterProps`)**
   - `<footer>` element with top border and responsive layout support.

---

## 4. Accessibility & Mobile Behavior

- **Semantic HTML**: Standard `<header>`, `<main>`, `<footer>`, `<aside>` tags.
- **Mobile Menu Drawer**: Integrated hamburger button for small viewports when `mobileNav` is provided. Escape key listener and click-outside backdrop close support.
- **Keyboard Navigation**: Focus stays trapped or managed properly when mobile menu drawer is open.

---

## 5. Testing & Storybook Strategy

- **Unit / Interaction Tests** (`app-shell.test.tsx`):
  - Verify rendering of all slots (banner, header, main, footer).
  - Verify `contentWidth` class applications (`max-w-7xl`, `max-w-5xl`, `max-w-screen-2xl`, `max-w-none`).
  - Test mobile menu drawer toggle open/close via hamburger button and Escape key press.
- **Storybook Stories** (`app-shell.stories.tsx`):
  - Standard marketing page story with Header, Banner, Main content, and Footer.
  - Compound API story.
  - Variant stories (`glass`, `solid`, `transparent` header; `narrow`, `wide`, `full` content width).

---

## 6. Verification Checklist

1. `npm --prefix packages/ui test` passes all tests.
2. `npm --prefix packages/ui build` succeeds with clean TypeScript types.
3. Export `AppShell` in `packages/ui/src/index.ts`.
4. Update `docs/BACKLOG.md` checking off `AppShell`.
