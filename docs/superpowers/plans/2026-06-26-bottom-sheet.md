# BottomSheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a responsive, accessible BottomSheet component with compound components and thorough tests using TDD.

**Architecture:** Use React Context API to manage accessible IDs (`titleId`, `descId`) dynamically via `useId()`. Apply responsive Tailwind classes to render a sliding sheet on mobile and a centered modal on desktop.

**Tech Stack:** React 18, Tailwind CSS v4, Vitest, React Testing Library.

---

### Task 1: Basic Rendering

**Files:**
- Create: `packages/ui/src/components/bottom-sheet.test.tsx`
- Create: `packages/ui/src/components/bottom-sheet.tsx`

- [ ] **Step 1: Write first failing test for BottomSheet rendering**

Create `packages/ui/src/components/bottom-sheet.test.tsx`:
```typescript
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet", () => {
  it("renders children when open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet Content")).toBeInTheDocument();
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
Expected: FAIL (cannot find module `./bottom-sheet`)

- [ ] **Step 3: Create minimal implementation of BottomSheet**

Create `packages/ui/src/components/bottom-sheet.tsx`:
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
Expected: PASS

- [ ] **Step 5: Commit minimal implementation**

Run:
```bash
git add packages/ui/src/components/bottom-sheet.test.tsx packages/ui/src/components/bottom-sheet.tsx
git commit -m "feat(bottom-sheet): add minimal bottom-sheet implementation with basic tests"
```

---

### Task 2: Dismissal and Scroll Lock Behaviors

**Files:**
- Modify: `packages/ui/src/components/bottom-sheet.test.tsx`
- Modify: `packages/ui/src/components/bottom-sheet.tsx`

- [ ] **Step 1: Write failing tests for ESC keypress and scroll lock**

Add the following tests to `packages/ui/src/components/bottom-sheet.test.tsx`:
```typescript
  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(event);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scrolling when open, and restores it when closed/unmounted", () => {
    const { unmount } = render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
```

- [ ] **Step 2: Run test and watch them fail**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: FAIL (Escape test: call count is 0; overflow test: overflow is not "hidden")

- [ ] **Step 3: Implement ESC close and body scroll lock**

Modify `packages/ui/src/components/bottom-sheet.tsx` to handle these side effects:
```typescript
import * as React from "react";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
}

export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return <div>{children}</div>;
}
```

- [ ] **Step 4: Run test and watch them pass**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

Run:
```bash
git add packages/ui/src/components/bottom-sheet.test.tsx packages/ui/src/components/bottom-sheet.tsx
git commit -m "feat(bottom-sheet): support ESC close and body scroll lock behaviors"
```

---

### Task 3: Compound Components and Accessibility

**Files:**
- Modify: `packages/ui/src/components/bottom-sheet.test.tsx`
- Modify: `packages/ui/src/components/bottom-sheet.tsx`

- [ ] **Step 1: Write failing tests for accessibility role, modal state, and compound components**

Add these tests to `packages/ui/src/components/bottom-sheet.test.tsx`:
```typescript
  it("has correct accessibility attributes and matches title/description IDs", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <BottomSheetHeader>
          <BottomSheetTitle>Test Title</BottomSheetTitle>
          <BottomSheetDescription>Test Description</BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetContent>Test Content</BottomSheetContent>
        <BottomSheetFooter>Test Footer</BottomSheetFooter>
      </BottomSheet>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const title = screen.getByText("Test Title");
    const description = screen.getByText("Test Description");

    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
    expect(dialog).toHaveAttribute("aria-describedby", description.id);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Test Footer")).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test and watch it fail**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: FAIL (cannot find BottomSheetHeader/Title/etc. or elements have no roles/attributes)

- [ ] **Step 3: Implement Compound Components and Context Linkage**

Modify `packages/ui/src/components/bottom-sheet.tsx`:
```typescript
import * as React from "react";
import { cn } from "../lib/cn";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
}

const BottomSheetContext = React.createContext<{ titleId: string; descId: string } | null>(null);

export function BottomSheet({ open, onClose, children, maxWidth = "max-w-lg" }: BottomSheetProps) {
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <BottomSheetContext.Provider value={{ titleId, descId }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {children}
      </div>
    </BottomSheetContext.Provider>
  );
}

export function BottomSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function BottomSheetTitle({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <h2 id={id ?? ctx?.titleId} className={cn("text-lg font-semibold", className)} {...props} />;
}

export function BottomSheetDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <p id={id ?? ctx?.descId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function BottomSheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 overflow-y-auto", className)} {...props} />;
}

export function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 border-t border-border", className)} {...props} />;
}
```

- [ ] **Step 4: Run test and watch it pass**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

Run:
```bash
git add packages/ui/src/components/bottom-sheet.test.tsx packages/ui/src/components/bottom-sheet.tsx
git commit -m "feat(bottom-sheet): add compound components and accessibility context"
```

---

### Task 4: Responsive Styles, Overlay and Drag Handle

**Files:**
- Modify: `packages/ui/src/components/bottom-sheet.test.tsx`
- Modify: `packages/ui/src/components/bottom-sheet.tsx`

- [ ] **Step 1: Write tests for layout styling, backdrop clicks, and close button**

Add testing for visual elements, backdrop dismiss, and close button in `packages/ui/src/components/bottom-sheet.test.tsx`:
```typescript
  it("closes when the backdrop overlay is clicked", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    const backdrop = screen.getByRole("presentation");
    backdrop.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders a close button and triggers onClose when clicked", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();
    closeBtn.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 2: Run test and watch them fail**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: FAIL (cannot find close button or backdrop elements)

- [ ] **Step 3: Implement full responsive style, backdrop, drag handle, and close button**

Modify `packages/ui/src/components/bottom-sheet.tsx`:
```typescript
import * as React from "react";
import { cn } from "../lib/cn";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl";
  className?: string;
  showClose?: boolean;
}

const BottomSheetContext = React.createContext<{ titleId: string; descId: string } | null>(null);

export function BottomSheet({
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
  className,
  showClose = true,
}: BottomSheetProps) {
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <BottomSheetContext.Provider value={{ titleId, descId }}>
      {/* Backdrop overlay */}
      <div
        role="presentation"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className={cn(
          "fixed inset-0 z-[100] grid items-end sm:place-items-center p-0 sm:p-6 backdrop-blur-[3px] transition-opacity duration-200",
          "bg-[color-mix(in_oklch,#09090b_55%,transparent)]"
        )}
      >
        {/* Panel wrapper */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          className={cn(
            "relative w-full bg-surface border-t sm:border border-border shadow-kj-lg transition-all outline-none",
            "rounded-t-kj-2xl sm:rounded-kj-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh]",
            // Mobile styling vs Desktop styling
            "bottom-0 sm:bottom-auto",
            maxWidth,
            className
          )}
        >
          {/* Mobile Drag Handle */}
          <div className="flex justify-center py-2 sm:hidden cursor-grab">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
          </div>

          {/* Close button (rendered on top right for desktop modal look) */}
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer z-10"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
    </BottomSheetContext.Provider>
  );
}

export function BottomSheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 flex flex-col gap-1.5 border-b border-border", className)} {...props} />;
}

export function BottomSheetTitle({ className, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <h2 id={id ?? ctx?.titleId} className={cn("m-0 text-[1.15rem] font-bold tracking-[-0.01em]", className)} {...props} />;
}

export function BottomSheetDescription({ className, id, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const ctx = React.useContext(BottomSheetContext);
  return <p id={id ?? ctx?.descId} className={cn("m-0 text-[0.9rem] text-muted-foreground", className)} {...props} />;
}

export function BottomSheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 overflow-y-auto flex-1", className)} {...props} />;
}

export function BottomSheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 border-t border-border flex gap-2.5 justify-end mt-auto", className)} {...props} />;
}
```

- [ ] **Step 4: Run test and watch them pass**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit changes**

Run:
```bash
git add packages/ui/src/components/bottom-sheet.test.tsx packages/ui/src/components/bottom-sheet.tsx
git commit -m "feat(bottom-sheet): implement responsive styles, overlay, drag handle, close button"
```

---

### Task 5: Exports and Cleanup

**Files:**
- Modify: `packages/ui/src/index.ts`
- Delete: `packages/ui/src/components/sanity.test.tsx`

- [ ] **Step 1: Export BottomSheet from the ui library**

Modify `packages/ui/src/index.ts` by appending to line 78 or appropriate export section:
```typescript
export {
  BottomSheet, BottomSheetHeader, BottomSheetTitle, BottomSheetDescription, BottomSheetContent, BottomSheetFooter,
  type BottomSheetProps
} from "./components/bottom-sheet";
```

- [ ] **Step 2: Run workspace build to verify typescript compile and build output**

Run: `npm run build --workspace=@kjaniec-dev/ui`
Expected: Successful compile and output files in `dist`

- [ ] **Step 3: Remove sanity test**

Run: `rm packages/ui/src/components/sanity.test.tsx`

- [ ] **Step 4: Run all tests to verify everything passes without the sanity test**

Run: `npm run test --workspace=@kjaniec-dev/ui`
Expected: PASS

- [ ] **Step 5: Commit final exports and cleanup**

Run:
```bash
git add packages/ui/src/index.ts
git rm packages/ui/src/components/sanity.test.tsx
git commit -m "feat(bottom-sheet): export bottom-sheet components and clean up sanity tests"
```
