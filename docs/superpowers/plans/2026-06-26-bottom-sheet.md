# BottomSheet Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive, accessible `BottomSheet` component in the `@kjaniec-dev/ui` library that behaves as an overlay bottom sheet on mobile and transforms into a centered dialog (modal) on desktop, using pure CSS responsivity.

**Architecture:** Use React compound components (`BottomSheet`, `BottomSheetHeader`, `BottomSheetTitle`, `BottomSheetDescription`, `BottomSheetContent`, `BottomSheetFooter`). Logically, manage state (open/close, ESC key, scroll lock, focus trap) in the parent component. Style using Tailwind CSS media queries (`md:` prefixes) to handle layout transitions seamlessly without SSR issues.

**Tech Stack:** React, Tailwind CSS, Vitest, React Testing Library, Storybook.

---

### Task 1: Setup Testing Environment in UI Package

**Files:**
- Modify: `packages/ui/package.json`
- Create: `packages/ui/vitest.config.ts`
- Create: `packages/ui/src/components/sanity.test.tsx`

- [ ] **Step 1: Install Vitest and testing dependencies in UI package**
  Run: `npm install -w @kjaniec-dev/ui -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  Expected: Dependencies are added to `packages/ui/package.json`.

- [ ] **Step 2: Add test script to packages/ui/package.json**
  Modify `packages/ui/package.json` to add the `"test"` script.
  ```json
  "scripts": {
    "test": "vitest run",
    ...
  }
  ```

- [ ] **Step 3: Create vitest.config.ts for UI package**
  Create `packages/ui/vitest.config.ts` with the following content:
  ```typescript
  import { defineConfig } from "vitest/config";
  import react from "@vitejs/plugin-react";

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: [],
    },
  });
  ```

- [ ] **Step 4: Create a sanity test file**
  Create `packages/ui/src/components/sanity.test.tsx` to verify Vitest works:
  ```typescript
  import { describe, it, expect } from "vitest";

  describe("Sanity Check", () => {
    it("should pass", () => {
      expect(true).toBe(true);
    });
  });
  ```

- [ ] **Step 5: Run tests to verify setup**
  Run: `npm run test --workspace=@kjaniec-dev/ui`
  Expected: Sanity Check passes.

- [ ] **Step 6: Commit testing setup**
  Run:
  ```bash
  git add packages/ui/package.json packages/ui/vitest.config.ts packages/ui/src/components/sanity.test.tsx
  git commit -m "chore: setup vitest testing environment for ui package"
  ```

---

### Task 2: Implement BottomSheet Component (TDD)

**Files:**
- Create: `packages/ui/src/components/bottom-sheet.test.tsx`
- Create: `packages/ui/src/components/bottom-sheet.tsx`

- [ ] **Step 1: Write first failing test for BottomSheet rendering**
  Create `packages/ui/src/components/bottom-sheet.test.tsx`:
  ```typescript
  import * as React from "react";
  import { describe, it, expect, vi } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { BottomSheet } from "./bottom-sheet";

  describe("BottomSheet", () => {
    it("renders children when open", () => {
      render(
        <BottomSheet open={true} onClose={() => {}}>
          <div>Sheet Content</div>
        </BottomSheet>
      );
      expect(screen.getByText("Sheet Content")).toBeDefined();
    });

    it("does not render when closed", () => {
      render(
        <BottomSheet open={false} onClose={() => {}}>
          <div>Sheet Content</div>
        </BottomSheet>
      );
      expect(screen.queryByText("Sheet Content")).toBeNull();
    });
  });
  ```

- [ ] **Step 2: Run test and watch it fail**
  Run: `npm run test --workspace=@kjaniec-dev/ui`
  Expected: FAIL (cannot find module `./bottom-sheet`).

- [ ] **Step 3: Create minimal implementation of BottomSheet**
  Create `packages/ui/src/components/bottom-sheet.tsx` to export `BottomSheet` rendering simple content when `open` is true:
  ```typescript
  import * as React from "react";

  export interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
  }

  export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
    if (!open) return null;
    return <div>{children}</div>;
  }
  ```

- [ ] **Step 4: Run test and watch it pass**
  Run: `npm run test --workspace=@kjaniec-dev/ui`
  Expected: PASS.

- [ ] **Step 5: Write failing tests for key behavioral features (ESC close, Body scroll-lock, Compound components)**
  Add the following tests to `packages/ui/src/components/bottom-sheet.test.tsx`:
  ```typescript
  import { fireEvent } from "@testing-library/react";
  import {
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
    BottomSheetContent,
    BottomSheetFooter
  } from "./bottom-sheet";

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Content</div>
      </BottomSheet>
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });

  it("applies overflow hidden to body when open", () => {
    const { unmount } = render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Content</div>
      </BottomSheet>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("renders header, title, and description with correct a11y IDs", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <BottomSheetHeader>
          <BottomSheetTitle>Test Title</BottomSheetTitle>
          <BottomSheetDescription>Test Desc</BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetContent>Main Content</BottomSheetContent>
      </BottomSheet>
    );
    
    const dialog = screen.getByRole("dialog");
    const title = screen.getByText("Test Title");
    const desc = screen.getByText("Test Desc");

    expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
    expect(dialog.getAttribute("aria-describedby")).toBe(desc.id);
  });
  ```

- [ ] **Step 6: Run tests and watch them fail**
  Run: `npm run test --workspace=@kjaniec-dev/ui`
  Expected: FAIL (missing compound exports and scroll-lock/ESC listener logic).

- [ ] **Step 7: Implement full responsive, accessible BottomSheet structure**
  Rewrite `packages/ui/src/components/bottom-sheet.tsx` to add full dialog logic, Backdrop, Panel positioning, and all sub-components:
  ```typescript
  "use client";

  import * as React from "react";
  import { cn } from "../lib/cn";

  export interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
  }

  const BottomSheetContext = React.createContext<{ titleId: string; descId: string; onClose: () => void } | null>(null);

  export function BottomSheet({
    open,
    onClose,
    children,
    maxWidth = "max-w-md",
  }: BottomSheetProps) {
    const titleId = React.useId();
    const descId = React.useId();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const lastActiveElement = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
      if (!open) {
        if (lastActiveElement.current) {
          lastActiveElement.current.focus();
          lastActiveElement.current = null;
        }
        return;
      }

      lastActiveElement.current = document.activeElement as HTMLElement;

      const container = containerRef.current;
      if (container) {
        const focusables = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          setTimeout(() => focusables[0].focus(), 50);
        } else {
          container.focus();
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
          return;
        }

        if (e.key === "Tab") {
          const container = containerRef.current;
          if (!container) return;

          const focusables = Array.from(
            container.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusables.length === 0) {
            e.preventDefault();
            return;
          }

          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || document.activeElement === container) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }, [open, onClose]);

    return (
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className={cn(
          "fixed inset-0 z-[100] flex flex-col justify-end backdrop-blur-[2px] transition-opacity duration-300",
          "bg-[color-mix(in_oklch,#09090b_45%,transparent)]",
          "md:grid md:place-items-center md:p-6",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <BottomSheetContext.Provider value={{ titleId, descId, onClose }}>
          <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            className={cn(
              "relative bg-surface border-border shadow-kj-lg outline-none transition-all duration-300 ease-in-out flex flex-col",
              // Mobile styles (Default)
              "w-full max-h-[90vh] rounded-t-kj-2xl border-t",
              open ? "translate-y-0" : "translate-y-full",
              // Desktop styles (md and above)
              "md:relative md:translate-y-0 md:rounded-kj-2xl md:border md:my-8 md:w-full",
              open ? "md:scale-100 md:opacity-100" : "md:scale-95 md:opacity-0",
              maxWidth
            )}
          >
            {children}
          </div>
        </BottomSheetContext.Provider>
      </div>
    );
  }
  BottomSheet.displayName = "BottomSheet";

  export function BottomSheetHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    const ctx = React.useContext(BottomSheetContext);
    return (
      <div className={cn("relative p-6 pb-4 border-b border-border flex flex-col gap-1", className)}>
        {/* Mobile-only Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4 md:hidden" />
        
        {children}

        {ctx && (
          <button
            type="button"
            onClick={ctx.onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
  BottomSheetHeader.displayName = "BottomSheetHeader";

  export function BottomSheetTitle({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    const ctx = React.useContext(BottomSheetContext);
    return <h2 id={id ?? ctx?.titleId} className={cn("text-lg font-bold tracking-tight text-foreground", className)} {...props} />;
  }
  BottomSheetTitle.displayName = "BottomSheetTitle";

  export function BottomSheetDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    const ctx = React.useContext(BottomSheetContext);
    return <p id={id ?? ctx?.descId} className={cn("text-xs text-muted-foreground", className)} {...props} />;
  }
  BottomSheetDescription.displayName = "BottomSheetDescription";

  export function BottomSheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props} />;
  }
  BottomSheetContent.displayName = "BottomSheetContent";

  export function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-4 border-t border-border flex gap-3 justify-end", className)} {...props} />;
  }
  BottomSheetFooter.displayName = "BottomSheetFooter";
  ```

- [ ] **Step 8: Run tests and watch them pass**
  Run: `npm run test --workspace=@kjaniec-dev/ui`
  Expected: All tests pass.

- [ ] **Step 9: Clean up sanity tests**
  Run: `rm packages/ui/src/components/sanity.test.tsx`
  Expected: Cleaned up.

- [ ] **Step 10: Commit BottomSheet implementation**
  Run:
  ```bash
  git add packages/ui/src/components/bottom-sheet.tsx packages/ui/src/components/bottom-sheet.test.tsx
  git commit -m "feat: add BottomSheet component implementation with full tests"
  ```

---

### Task 3: Export Component & Add Storybook Stories

**Files:**
- Modify: `packages/ui/src/index.ts`
- Create: `packages/ui/src/components/bottom-sheet.stories.tsx`

- [ ] **Step 1: Export BottomSheet in ui packages index.ts**
  Add exports to `packages/ui/src/index.ts`:
  ```typescript
  export * from "./components/bottom-sheet";
  ```

- [ ] **Step 2: Create Storybook stories for BottomSheet**
  Create `packages/ui/src/components/bottom-sheet.stories.tsx`:
  ```typescript
  import * as React from "react";
  import type { Meta, StoryObj } from "@storybook/react";
  import {
    BottomSheet,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetDescription,
    BottomSheetContent,
    BottomSheetFooter
  } from "./bottom-sheet";
  import { Button } from "./button";

  const meta: Meta<typeof BottomSheet> = {
    title: "Overlays/BottomSheet",
    component: BottomSheet,
    parameters: {
      layout: "centered",
    },
  };

  export default meta;
  type Story = StoryObj<typeof BottomSheet>;

  function BottomSheetDemo(props: any) {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="p-4">
        <Button onClick={() => setOpen(true)}>Open BottomSheet</Button>
        <BottomSheet open={open} onClose={() => setOpen(false)} {...props}>
          <BottomSheetHeader>
            <BottomSheetTitle>Choose an option</BottomSheetTitle>
            <BottomSheetDescription>Please select one of the financial categories below.</BottomSheetDescription>
          </BottomSheetHeader>
          <BottomSheetContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted border border-border transition-colors">
                💰 Income
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted border border-border transition-colors">
                🛒 Shopping
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-muted border border-border transition-colors">
                🚗 Car & Transport
              </button>
            </div>
          </BottomSheetContent>
          <BottomSheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </BottomSheetFooter>
        </BottomSheet>
      </div>
    );
  }

  export const Default: Story = {
    render: () => <BottomSheetDemo />,
  };
  ```

- [ ] **Step 3: Verify packages typescript compilation and build**
  Run: `npm run build --workspace=@kjaniec-dev/ui`
  Expected: tsup builds the project successfully.

- [ ] **Step 4: Commit story and exports**
  Run:
  ```bash
  git add packages/ui/src/index.ts packages/ui/src/components/bottom-sheet.stories.tsx
  git commit -m "feat: export BottomSheet component and add storybook stories"
  ```

---

### Task 4: Add Live Gallery Showcase in Site App

**Files:**
- Modify: `site/src/main.tsx`

- [ ] **Step 1: Check main.tsx imports**
  Import `BottomSheet`, `BottomSheetHeader`, `BottomSheetTitle`, `BottomSheetDescription`, `BottomSheetContent`, `BottomSheetFooter` in `site/src/main.tsx`.

- [ ] **Step 2: Add demo state in main.tsx gallery**
  Define react state `const [showBottomSheet, setShowBottomSheet] = useState(false);` inside the main layout component in `site/src/main.tsx`.

- [ ] **Step 3: Add click triggers in Overlay/Dialog section**
  Find the Modals / Overlays section in `site/src/main.tsx` (usually contains Modal and Drawer buttons) and add a Button to trigger the BottomSheet.
  ```tsx
  <Button onClick={() => setShowBottomSheet(true)}>Open Responsive BottomSheet</Button>
  ```

- [ ] **Step 4: Render BottomSheet component at the page root level**
  Render the `<BottomSheet>` structure at the page level in `site/src/main.tsx`:
  ```tsx
  <BottomSheet open={showBottomSheet} onClose={() => setShowBottomSheet(false)}>
    <BottomSheetHeader>
      <BottomSheetTitle>Demo BottomSheet</BottomSheetTitle>
      <BottomSheetDescription>Responsive dialog: bottom sheet on mobile, modal on desktop.</BottomSheetDescription>
    </BottomSheetHeader>
    <BottomSheetContent>
      <div className="space-y-3">
        <p className="text-sm text-foreground">
          This overlay component automatically adapts to the screen size. Change the viewport size in your browser to observe the transition.
        </p>
        <div className="p-3 bg-muted rounded-kj-md text-xs font-mono text-muted-foreground">
          Mobile: sliding sheet<br/>
          Desktop: centered card dialog
        </div>
      </div>
    </BottomSheetContent>
    <BottomSheetFooter>
      <Button variant="outline" onClick={() => setShowBottomSheet(false)}>
        Close
      </Button>
      <Button onClick={() => setShowBottomSheet(false)}>
        Agree
      </Button>
    </BottomSheetFooter>
  </BottomSheet>
  ```

- [ ] **Step 5: Run site and verify the build**
  Run: `npm run build` at root.
  Expected: Build succeeds.

- [ ] **Step 6: Commit site integration**
  Run:
  ```bash
  git add site/src/main.tsx
  git commit -m "feat: add BottomSheet showcase page demo to site gallery"
  ```
