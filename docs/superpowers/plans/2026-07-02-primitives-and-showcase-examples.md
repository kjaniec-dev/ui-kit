# Primitives Pack + Showcase Usage Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `Popover`, `Kbd`, `CodeBlock` to `@kjaniec-dev/ui` and give every showcase gallery section Demo | Props | Code tabs driven by `packages/mcp/data/components.json`.

**Architecture:** Three new dependency-free React components following the kit's existing idioms (context compound components like `dropdown-menu.tsx`, cva variants like `badge.tsx`). The site gains a local `ExampleTabs` component that reads the MCP-extracted `components.json` (single source of truth) and renders generated props tables plus copyable snippets via the new `CodeBlock`.

**Tech Stack:** React 18, class-variance-authority, Tailwind v4 tokens (`--kj-*`), vitest + @testing-library/react, Storybook, Vite (site), MCP extractor (`packages/mcp/src/extractor.ts`).

**Spec:** `docs/superpowers/specs/2026-07-02-primitives-and-showcase-examples-design.md`

## Global Constraints

- **No new runtime dependencies** in `packages/ui` (no floating-ui, no highlight lib).
- Every new component: `React.forwardRef` where it renders a single element, `displayName` set, `"use client"` directive when stateful, **JSDoc comment on every public prop** (the MCP extractor parses these).
- Positioning is pure CSS relative to a `relative inline-block` wrapper — **no portal, no collision detection** (kit idiom, see `dropdown-menu.tsx`).
- Tests use vitest + @testing-library/react, colocated as `packages/ui/src/components/<name>.test.tsx` (pattern: `bottom-sheet.test.tsx`).
- Stories use `satisfies Meta<typeof X>` + `tags: ["autodocs"]` (pattern: `badge.stories.tsx`).
- All shell commands run from repo root `/Users/kjaniec-dev/dev/projects/kj-product-kit-starter` unless stated.
- Commit at the end of every task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Note: `packages/mcp/data/components.json` already has uncommitted modifications from a previous session; Task 4 regenerates and commits it wholesale — that is expected and safe (the file is deterministic extractor output).

---

### Task 1: Kbd component

**Files:**
- Create: `packages/ui/src/components/kbd.tsx`
- Create: `packages/ui/src/components/kbd.test.tsx`
- Create: `packages/ui/src/components/kbd.stories.tsx`
- Modify: `packages/ui/src/index.ts` (append export)

**Interfaces:**
- Consumes: `cn` from `../lib/cn`, `cva` from class-variance-authority.
- Produces: `Kbd` component + `KbdProps` (`keys?: string[]`, `size?: "sm" | "md"`), exported from `@kjaniec-dev/ui`. Task 6 renders `<Kbd keys={["⌘", "K"]} />` and `<Kbd>⌘S</Kbd>` in the gallery.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/kbd.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders children in a single kbd element", () => {
    render(<Kbd>⌘K</Kbd>);
    const el = screen.getByText("⌘K");
    expect(el.tagName).toBe("KBD");
  });

  it("renders one kbd chip per entry in keys", () => {
    const { container } = render(<Kbd keys={["⌘", "Shift", "P"]} />);
    const chips = container.querySelectorAll("kbd");
    expect(chips).toHaveLength(3);
    expect(chips[1].textContent).toBe("Shift");
  });

  it("ignores children when keys is provided", () => {
    render(<Kbd keys={["A"]}>ignored</Kbd>);
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- kbd`
Expected: FAIL — cannot resolve `./kbd`.

- [ ] **Step 3: Implement Kbd**

Create `packages/ui/src/components/kbd.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const kbdVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium text-muted-foreground bg-muted border border-border border-b-2 rounded-kj-sm select-none",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-[0.68rem]",
        md: "h-6 min-w-6 px-1.5 text-[0.78rem]",
      },
    },
    defaultVariants: { size: "sm" },
  }
);

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  /** Render one <kbd> chip per key (separated by a small gap); children are ignored. */
  keys?: string[];
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size, keys, children, ...props }, ref) => {
    if (keys && keys.length > 0) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          className={cn("inline-flex items-center gap-1", className)}
          {...props}
        >
          {keys.map((k, i) => (
            <kbd key={i} className={kbdVariants({ size })}>
              {k}
            </kbd>
          ))}
        </span>
      );
    }
    return (
      <kbd ref={ref} className={cn(kbdVariants({ size }), className)} {...props}>
        {children}
      </kbd>
    );
  }
);
Kbd.displayName = "Kbd";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/ui -- kbd`
Expected: PASS (3 tests).

- [ ] **Step 5: Add barrel export**

In `packages/ui/src/index.ts`, append after the `BottomSheet` export block:

```ts
export { Kbd, type KbdProps } from "./components/kbd";
```

- [ ] **Step 6: Add story**

Create `packages/ui/src/components/kbd.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Kbd } from "./kbd";

const meta = {
  title: "Primitives/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  args: { children: "⌘K", size: "sm" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const KeySequence: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Kbd keys={["⌘", "K"]} />
      <Kbd keys={["⌘", "Shift", "P"]} size="md" />
      <Kbd>Esc</Kbd>
    </div>
  ),
};
```

- [ ] **Step 7: Typecheck and commit**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: clean exit.

```bash
git add packages/ui/src/components/kbd.tsx packages/ui/src/components/kbd.test.tsx packages/ui/src/components/kbd.stories.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add Kbd keyboard-shortcut hint component

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: CodeBlock component

**Files:**
- Create: `packages/ui/src/components/code-block.tsx`
- Create: `packages/ui/src/components/code-block.test.tsx`
- Create: `packages/ui/src/components/code-block.stories.tsx`
- Modify: `packages/ui/src/index.ts` (append export)

**Interfaces:**
- Consumes: `cn` from `../lib/cn`.
- Produces: `CodeBlock` + `CodeBlockProps` (`code: string`, `language?: string`, `filename?: string`, `copyable?: boolean`, `maxHeight?: number`), exported from `@kjaniec-dev/ui`. Task 5's `ExampleTabs` renders `<CodeBlock code={...} language="tsx" />`.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/code-block.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodeBlock } from "./code-block";

describe("CodeBlock", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("renders the code text", () => {
    render(<CodeBlock code="<Button>Hi</Button>" />);
    expect(screen.getByText("<Button>Hi</Button>")).toBeInTheDocument();
  });

  it("shows the filename in the header", () => {
    render(<CodeBlock code="x" filename="example.tsx" />);
    expect(screen.getByText("example.tsx")).toBeInTheDocument();
  });

  it("shows the language label when no filename is given", () => {
    render(<CodeBlock code="x" language="tsx" />);
    expect(screen.getByText("tsx")).toBeInTheDocument();
  });

  it("copies the code and flips the button label", async () => {
    render(<CodeBlock code="copy me" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("copy me");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()
    );
  });

  it("hides the copy button when copyable is false", () => {
    render(<CodeBlock code="x" copyable={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- code-block`
Expected: FAIL — cannot resolve `./code-block`.

- [ ] **Step 3: Implement CodeBlock**

Create `packages/ui/src/components/code-block.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The snippet text to display. */
  code: string;
  /** Language label shown in the header when no filename is set (e.g. "tsx"). */
  language?: string;
  /** Optional filename label shown in the header; takes precedence over language. */
  filename?: string;
  /** Show the copy-to-clipboard button. */
  copyable?: boolean;
  /** Max height in pixels; content scrolls vertically beyond it. */
  maxHeight?: number;
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ className, code, language, filename, copyable = true, maxHeight, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const canCopy = copyable && typeof navigator !== "undefined" && !!navigator.clipboard;

    const onCopy = () => {
      navigator.clipboard.writeText(code).then(
        () => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        },
        () => {
          /* clipboard rejected — keep "Copy" label */
        }
      );
    };

    const label = filename ?? language;

    return (
      <div
        ref={ref}
        className={cn("rounded-kj-md border border-border bg-muted/50 overflow-hidden", className)}
        {...props}
      >
        {(label || canCopy) && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 border-b border-border">
            <span className="text-[0.72rem] font-mono text-muted-foreground">{label}</span>
            {canCopy && (
              <button
                type="button"
                onClick={onCopy}
                className="text-[0.72rem] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        )}
        <pre
          className="m-0 px-3.5 py-3 overflow-x-auto text-[0.8rem] leading-relaxed font-mono text-foreground"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <code>{code}</code>
        </pre>
      </div>
    );
  }
);
CodeBlock.displayName = "CodeBlock";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/ui -- code-block`
Expected: PASS (5 tests).

- [ ] **Step 5: Add barrel export**

In `packages/ui/src/index.ts`, append after the `Kbd` export:

```ts
export { CodeBlock, type CodeBlockProps } from "./components/code-block";
```

- [ ] **Step 6: Add story**

Create `packages/ui/src/components/code-block.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { CodeBlock } from "./code-block";

const sample = `import { Button } from "@kjaniec-dev/ui";

<Button variant="primary" loading={saving}>
  Save changes
</Button>`;

const meta = {
  title: "Primitives/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  args: { code: sample, language: "tsx" },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithFilename: Story = {
  args: { filename: "save-button.tsx" },
};

export const NotCopyable: Story = {
  args: { copyable: false },
};

export const ScrollingMaxHeight: Story = {
  args: { code: Array.from({ length: 30 }, (_, i) => `const line${i} = ${i};`).join("\n"), maxHeight: 180 },
};
```

- [ ] **Step 7: Typecheck and commit**

Run: `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: clean exit.

```bash
git add packages/ui/src/components/code-block.tsx packages/ui/src/components/code-block.test.tsx packages/ui/src/components/code-block.stories.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add CodeBlock component with copy-to-clipboard

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Popover component

**Files:**
- Create: `packages/ui/src/components/popover.tsx`
- Create: `packages/ui/src/components/popover.test.tsx`
- Create: `packages/ui/src/components/popover.stories.tsx`
- Modify: `packages/ui/src/index.ts` (append export)

**Interfaces:**
- Consumes: `cn` from `../lib/cn`. Mirrors the context pattern of `packages/ui/src/components/dropdown-menu.tsx`.
- Produces: `Popover` (`open?: boolean`, `onOpenChange?: (open: boolean) => void`), `PopoverTrigger` (`asChild?: boolean`), `PopoverContent` (`side?: "top" | "bottom" | "left" | "right"` default `"bottom"`, `align?: "start" | "center" | "end"` default `"center"`). Exported from `@kjaniec-dev/ui`. Sub-projects 3–4 (Combobox, DatePicker) will build on this; Task 6 renders it in the gallery.

- [ ] **Step 1: Write the failing test**

Create `packages/ui/src/components/popover.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

function UncontrolledPopover() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Panel body</PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("is closed initially and opens on trigger click", () => {
    render(<UncontrolledPopover />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Panel body");
  });

  it("sets aria attributes on the trigger", () => {
    render(<UncontrolledPopover />);
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on outside mousedown", () => {
    render(<UncontrolledPopover />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<UncontrolledPopover />);
    const trigger = screen.getByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("supports controlled mode without mutating its own state", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover open={true} onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel body</PopoverContent>
      </Popover>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // still open — parent owns the state and did not update it
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("throws a clear error when parts are used outside <Popover>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<PopoverContent>orphan</PopoverContent>)).toThrow(
      "PopoverContent must be used inside <Popover>"
    );
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace @kjaniec-dev/ui -- popover`
Expected: FAIL — cannot resolve `./popover`.

- [ ] **Step 3: Implement Popover**

Create `packages/ui/src/components/popover.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

interface PopoverCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}
const PopoverContext = React.createContext<PopoverCtx | null>(null);

function usePopoverContext(part: string): PopoverCtx {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error(`${part} must be used inside <Popover>`);
  return ctx;
}

export interface PopoverProps {
  children: React.ReactNode;
  className?: string;
  /** Controlled open state. Omit for uncontrolled behavior. */
  open?: boolean;
  /** Called whenever the open state should change. */
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, className, open: openProp, onOpenChange }: PopoverProps) {
  const [openState, setOpenState] = React.useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!controlled) setOpenState(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ onClick, asChild, ...props }, ref) => {
  const ctx = usePopoverContext("PopoverTrigger");
  const setRefs = (node: HTMLButtonElement | null) => {
    ctx.triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };
  if (asChild) {
    const child = React.Children.only(props.children) as React.ReactElement;
    return React.cloneElement(child, {
      ref: setRefs,
      ...props,
      ...child.props,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
        child.props.onClick?.(e);
      },
      "aria-haspopup": "dialog",
      "aria-expanded": ctx.open,
    });
  }
  return (
    <button
      ref={setRefs}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      onClick={(e) => {
        ctx.setOpen(!ctx.open);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const sideAlignClasses: Record<string, string> = {
  "bottom-start": "top-[calc(100%+6px)] left-0",
  "bottom-center": "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  "bottom-end": "top-[calc(100%+6px)] right-0",
  "top-start": "bottom-[calc(100%+6px)] left-0",
  "top-center": "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  "top-end": "bottom-[calc(100%+6px)] right-0",
  "left-start": "right-[calc(100%+6px)] top-0",
  "left-center": "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  "left-end": "right-[calc(100%+6px)] bottom-0",
  "right-start": "left-[calc(100%+6px)] top-0",
  "right-center": "left-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  "right-end": "left-[calc(100%+6px)] bottom-0",
};

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which side of the trigger the panel opens on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the chosen side. */
  align?: "start" | "center" | "end";
}

export function PopoverContent({
  className,
  side = "bottom",
  align = "center",
  children,
  ...props
}: PopoverContentProps) {
  const ctx = usePopoverContext("PopoverContent");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ctx.open) ref.current?.focus();
  }, [ctx.open]);

  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      tabIndex={-1}
      className={cn(
        "absolute z-40 min-w-[200px] p-4 rounded-kj-md bg-surface border border-border shadow-kj-lg outline-none",
        "animate-[kjpop_.12s_ease]",
        sideAlignClasses[`${side}-${align}`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace @kjaniec-dev/ui -- popover`
Expected: PASS (6 tests).

- [ ] **Step 5: Add barrel export**

In `packages/ui/src/index.ts`, append after the `CodeBlock` export:

```ts
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  type PopoverProps,
  type PopoverContentProps,
} from "./components/popover";
```

- [ ] **Step 6: Add story**

Create `packages/ui/src/components/popover.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div style={{ padding: 120, display: "flex", justifyContent: "center" }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-64">
          <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
          <p className="m-0 text-sm text-muted-foreground">
            Popovers hold arbitrary content — filters, hints, pickers.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const SidesAndAlignments: Story = {
  render: () => (
    <div style={{ padding: 140, display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} align="center" className="w-40">
            <p className="m-0 text-sm">side="{side}"</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};
```

- [ ] **Step 7: Run full ui test suite, typecheck, commit**

Run: `npm run test --workspace @kjaniec-dev/ui` then `npm run typecheck --workspace @kjaniec-dev/ui`
Expected: all tests PASS (bottom-sheet + kbd + code-block + popover), typecheck clean.

```bash
git add packages/ui/src/components/popover.tsx packages/ui/src/components/popover.test.tsx packages/ui/src/components/popover.stories.tsx packages/ui/src/index.ts
git commit -m "feat(ui): add Popover floating-panel primitive

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Regenerate MCP component data

**Files:**
- Modify (generated): `packages/mcp/data/components.json`, `packages/mcp/data/tokens.json`

**Interfaces:**
- Consumes: the three new component files from Tasks 1–3 (extractor scans `packages/ui/src/components/*.tsx` and parses JSDoc).
- Produces: `components.json` entries named `Popover`, `PopoverTrigger`, `PopoverContent`, `Kbd`, `CodeBlock` — Task 5's `ExampleTabs` looks these up by exact name.

- [ ] **Step 1: Regenerate**

Run: `npm run mcp:build`
Expected: output includes "Successfully generated components.json and tokens.json inside packages/mcp/data/." and exit 0.

- [ ] **Step 2: Verify new entries exist**

Run:
```bash
python3 -c "
import json
d = json.load(open('packages/mcp/data/components.json'))
names = {x['name'] for x in d}
need = {'Popover', 'PopoverTrigger', 'PopoverContent', 'Kbd', 'CodeBlock'}
missing = need - names
print('MISSING:', missing) if missing else print('OK — all 5 present, total', len(d))
"
```
Expected: `OK — all 5 present, total <N>` where N ≥ 91.

- [ ] **Step 3: Run MCP server test and commit**

Run: `npm run mcp:test`
Expected: PASS / exit 0.

```bash
git add packages/mcp/data/components.json packages/mcp/data/tokens.json
git commit -m "chore(mcp): regenerate component data with Popover, Kbd, CodeBlock

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: ExampleTabs + curated overrides (site)

**Files:**
- Modify: `site/tsconfig.json` (add `resolveJsonModule`)
- Create: `site/src/example-overrides.ts`
- Create: `site/src/example-tabs.tsx`

**Interfaces:**
- Consumes: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `CodeBlock` from `@kjaniec-dev/ui`; `packages/mcp/data/components.json` (array of `{ name, importPath, description, props: [{ name, type, optional, defaultValue, description }], usageSnippet }`).
- Produces: `ExampleTabs` with props `components: string[]`, `code?: string`, `children: React.ReactNode` — Task 6 wires it into `Sec` in `site/src/main.tsx`. Snippet resolution order: `code` prop → `exampleOverrides[name]` → `usageSnippet`.

- [ ] **Step 1: Enable JSON imports in the site tsconfig**

In `site/tsconfig.json`, add to `compilerOptions`:

```json
"resolveJsonModule": true,
```

- [ ] **Step 2: Create curated overrides**

Create `site/src/example-overrides.ts`. Only components whose auto-extracted `usageSnippet` is too thin get entries (the rest fall back to the extractor snippet — Drawer, Tabs, FormField, DashboardShell etc. are already rich):

```ts
// Curated usage snippets for components whose auto-extracted usageSnippet
// is too thin to teach real usage. Keyed by component name in components.json.
export const exampleOverrides: Record<string, string> = {
  Button: `const [saving, setSaving] = React.useState(false);

<div className="flex items-center gap-3">
  <Button loading={saving} onClick={() => setSaving(true)}>
    Save changes
  </Button>
  <Button variant="outline">Cancel</Button>
  <Button variant="danger" size="sm">Delete</Button>
</div>`,

  DataTable: `interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: string;
  paid: boolean;
}

const columns: DataTableColumn<Invoice>[] = [
  { header: "Invoice", accessor: (r) => r.number, sortable: true, sortKey: "number" },
  { header: "Customer", accessor: (r) => r.customer },
  {
    header: "Status",
    accessor: (r) => (
      <Badge variant={r.paid ? "success" : "warning"}>{r.paid ? "Paid" : "Due"}</Badge>
    ),
  },
  { header: "Amount", accessor: (r) => r.amount, align: "right" },
];

const [selected, setSelected] = React.useState<Set<React.Key>>(new Set());

<DataTable
  columns={columns}
  data={invoices}
  getRowKey={(r) => r.id}
  selectedRows={selected}
  onSelectionChange={setSelected}
/>`,

  ToastProvider: `// Wrap the app once:
<ToastProvider>
  <App />
</ToastProvider>

// Then anywhere below it:
const { toast } = useToast();
toast({ message: "Profile updated.", tone: "success" });`,

  CommandPalette: `const items: CommandPaletteItem[] = [
  {
    id: "new-project",
    title: "Create project",
    category: "Actions",
    shortcut: ["⌘", "N"],
    action: () => createProject(),
  },
  {
    id: "goto-settings",
    title: "Go to settings",
    category: "Navigation",
    action: () => navigate("/settings"),
  },
];

<CommandPalette open={open} onClose={() => setOpen(false)} items={items} />`,
};
```

- [ ] **Step 3: Create ExampleTabs**

Create `site/src/example-tabs.tsx`:

```tsx
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent, CodeBlock } from "@kjaniec-dev/ui";
import componentsData from "../../packages/mcp/data/components.json";
import { exampleOverrides } from "./example-overrides";

interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  defaultValue: string | null;
  description: string;
}

interface ComponentDoc {
  name: string;
  importPath: string;
  description: string;
  props: PropDoc[];
  usageSnippet?: string;
}

const docs = componentsData as unknown as ComponentDoc[];
const byName = new Map(docs.map((d) => [d.name, d]));

interface ExampleTabsProps {
  /** Component names to document, looked up in components.json. First entry drives the code snippet. */
  components: string[];
  /** Explicit snippet; overrides both example-overrides.ts and the extracted usageSnippet. */
  code?: string;
  children: React.ReactNode;
}

export function ExampleTabs({ components, code, children }: ExampleTabsProps) {
  const entries = components
    .map((name) => {
      const doc = byName.get(name);
      if (!doc && import.meta.env.DEV) {
        console.warn(`ExampleTabs: no docs found for "${name}" in components.json`);
      }
      return doc;
    })
    .filter((d): d is ComponentDoc => !!d);

  const primary = entries[0];
  const snippet =
    code ?? (primary ? exampleOverrides[primary.name] ?? primary.usageSnippet ?? "" : "");
  const codeText = primary ? `${primary.importPath}\n\n${snippet}` : snippet;

  return (
    <Tabs defaultValue="demo">
      <TabsList className="mb-4">
        <TabsTrigger value="demo">Demo</TabsTrigger>
        <TabsTrigger value="props">Props</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="demo">{children}</TabsContent>
      <TabsContent value="props">
        {entries.map((doc) => (
          <div key={doc.name} className="mb-6">
            <p className="text-[0.72rem] uppercase tracking-[0.08em] font-semibold text-muted-foreground mb-2 mt-0">
              {doc.name}
            </p>
            {doc.props.length === 0 ? (
              <p className="text-sm text-muted-foreground m-0">No documented props.</p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-kj-md">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-3.5 py-2 font-semibold">Name</th>
                      <th className="px-3.5 py-2 font-semibold">Type</th>
                      <th className="px-3.5 py-2 font-semibold">Default</th>
                      <th className="px-3.5 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.props.map((p) => (
                      <tr key={p.name} className="border-t border-border align-top">
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] whitespace-nowrap">
                          {p.name}
                          {!p.optional && <span className="text-danger">*</span>}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] text-muted-foreground">
                          {p.type}
                        </td>
                        <td className="px-3.5 py-2 font-mono text-[0.8rem] text-muted-foreground whitespace-nowrap">
                          {p.defaultValue ?? "—"}
                        </td>
                        <td className="px-3.5 py-2 text-muted-foreground">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={codeText} language="tsx" />
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 4: Rebuild ui package so the site's node_modules resolution sees the new components**

Run: `npm run build --workspace @kjaniec-dev/ui`
Expected: tsup completes, `dist/` refreshed (the site's Vite resolves `@kjaniec-dev/ui` through the workspace package's `dist`, while `tsc` uses the `paths` alias to `src`).

- [ ] **Step 5: Typecheck the site and commit**

Run: `npm run typecheck --workspace @kjaniec-dev/site`
Expected: clean exit (ExampleTabs is not imported anywhere yet — `noUnusedLocals` applies to locals, not exports, so an unused exported component is fine).

```bash
git add site/tsconfig.json site/src/example-overrides.ts site/src/example-tabs.tsx
git commit -m "feat(site): add JSON-driven ExampleTabs with curated snippet overrides

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Wire gallery sections + primitives section

**Files:**
- Modify: `site/src/main.tsx` — the `Sec` helper (~line 185–202), the `NAV` constant (~line 293), the "47 components" badge (~line 535 area in the topbar), the kit import statement at the top, and each `<Sec>` call (lines ~527, 572, 592, 665, 767, 802, 878, 960, 1112, 1135)

**Interfaces:**
- Consumes: `ExampleTabs` from `./example-tabs` (Task 5); `Popover`, `PopoverTrigger`, `PopoverContent`, `Kbd`, `CodeBlock` from `@kjaniec-dev/ui` (Tasks 1–3).
- Produces: gallery with Demo | Props | Code on every section; new "Primitives" section with id `primitives`.

- [ ] **Step 1: Extend Sec to render ExampleTabs**

In `site/src/main.tsx`, add the import near the other local imports at the top of the file:

```tsx
import { ExampleTabs } from "./example-tabs";
```

Replace the `SecProps` interface and `Sec` function (currently at ~lines 185–202) with:

```tsx
interface SecProps {
  id: string;
  title: string;
  desc?: string;
  /** Component names documented in the Props/Code tabs; omit to render children without tabs. */
  components?: string[];
  /** Explicit code snippet override passed through to ExampleTabs. */
  code?: string;
  children: React.ReactNode;
}

function Sec(p: SecProps) {
  return (
    <section id={p.id} className="mb-14 scroll-mt-24">
      <div className="mb-5">
        <h2 className="m-0 text-2xl font-bold tracking-[-0.02em]">{p.title}</h2>
        {p.desc && <p className="mt-1 text-sm text-muted-foreground max-w-[60ch]">{p.desc}</p>}
      </div>
      {p.components ? (
        <ExampleTabs components={p.components} code={p.code}>
          {p.children}
        </ExampleTabs>
      ) : (
        p.children
      )}
    </section>
  );
}
```

- [ ] **Step 2: Add `components` prop to each existing Sec call**

Update the opening tag of each existing section (leave children untouched):

```tsx
<Sec id="buttons" ... components={["Button"]}>
<Sec id="badges" ... components={["Badge"]}>
<Sec id="feedback" ... components={["Alert", "ToastProvider", "Progress", "Spinner", "Skeleton"]}>
<Sec id="forms" ... components={["Input", "TextField", "Textarea", "Select", "SelectField", "FormField"]}>
<Sec id="selection" ... components={["Checkbox", "CheckboxField", "Radio", "Switch", "Slider", "Segmented"]}>
<Sec id="cards" ... components={["Card", "CardHeader", "CardTitle", "CardDescription", "CardContent", "CardFooter", "Stat", "MetricCard", "Avatar"]}>
<Sec id="navigation" ... components={["Tabs", "DropdownMenu", "Accordion", "Breadcrumb", "Pagination", "BottomNavigation"]}>
<Sec id="data" ... components={["DataTable", "DataTableColumn", "Table", "TableToolbar", "EmptyState", "ErrorState"]}>
<Sec id="overlays" ... components={["Modal", "ConfirmDialog", "Drawer", "CommandPalette", "Tooltip", "BottomSheet", "Fab"]}>
<Sec id="layouts" ... components={["DashboardShell", "SettingsLayout", "DetailPageLayout", "PageHeader", "SidebarNav"]}>
```

(`...` = keep the existing `title`/`desc` attributes exactly as they are. The names above all exist in `components.json` — the `data` section's first entry is `DataTable` so its curated override drives the Code tab.)

- [ ] **Step 3: Add the Primitives section**

Extend the kit import at the top of `site/src/main.tsx` with `Popover, PopoverTrigger, PopoverContent, Kbd, CodeBlock`.

Insert after the closing `</Sec>` of the `overlays` section (before the `layouts` section):

```tsx
<Sec
  id="primitives"
  title="Primitives"
  desc="Popover panels, keyboard hints and code blocks."
  components={["Popover", "PopoverContent", "Kbd", "CodeBlock"]}
  code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Filters</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" className="w-64">
    Any content here.
  </PopoverContent>
</Popover>`}
>
  <Box>
    <Sub>Popover</Sub>
    <div className="flex flex-wrap gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-64">
          <p className="m-0 mb-1 text-sm font-semibold">Quick help</p>
          <p className="m-0 text-sm text-muted-foreground">
            Popovers hold arbitrary content — filters, hints, pickers.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  </Box>
  <Box>
    <Sub>Keyboard hints</Sub>
    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        Command palette <Kbd keys={["⌘", "K"]} />
      </span>
      <span className="inline-flex items-center gap-2">
        Save <Kbd>⌘S</Kbd>
      </span>
      <span className="inline-flex items-center gap-2">
        Close <Kbd>Esc</Kbd>
      </span>
    </div>
  </Box>
  <Box>
    <Sub>Code block</Sub>
    <CodeBlock
      filename="save-button.tsx"
      code={`import { Button } from "@kjaniec-dev/ui";

<Button variant="primary">Save</Button>`}
    />
  </Box>
</Sec>
```

- [ ] **Step 4: Update NAV and the component-count badge**

In the `NAV` constant (~line 293), insert before the `layouts` entry:

```tsx
  ["primitives", "Primitives"],
```

In the topbar, change `47 components` to `50 components`.

- [ ] **Step 5: Typecheck and build the site**

Run: `npm run typecheck --workspace @kjaniec-dev/site` then `npm run build --workspace @kjaniec-dev/site`
Expected: both clean. If typecheck complains about JSON type width on `componentsData`, the `as unknown as ComponentDoc[]` cast in `example-tabs.tsx` already handles it.

- [ ] **Step 6: Commit**

```bash
git add site/src/main.tsx
git commit -m "feat(site): add Demo|Props|Code tabs to all gallery sections and Primitives section

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: End-to-end verification

**Files:** none created — verification only.

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: verified, shippable state.

- [ ] **Step 1: Full workspace checks**

Run from repo root:
```bash
npm run typecheck
npm run test
npm run build
```
Expected: all clean. (`npm run build` also re-runs the MCP extractor via tsup `onSuccess`; if `components.json` changes, `git status` stays clean because Task 4 already committed the regenerated data.)

- [ ] **Step 2: Visual verification with Playwright MCP**

Start the dev server in the background: `npm run site:dev` (port 5173, strict).

Using Playwright MCP against `http://localhost:5173`:
1. Snapshot the page — confirm the sidebar lists **Primitives** between Overlays and Layouts and the badge reads "50 components".
2. Confirm every section shows the Demo | Props | Code tab strip and the demo content underneath is unchanged (Demo is the default tab).
3. In the Buttons section: click **Props** — table with `variant`, `size`, `loading`, `leadingIcon`, `trailingIcon` rows; click **Code** — snippet starts with `import { Button } from "@kjaniec-dev/ui";` followed by the curated multi-button example; click **Copy** — button label flips to "Copied".
4. In the Primitives section: click "Open popover" — panel appears below the trigger; press Escape — panel closes; check `Kbd` chips and the `CodeBlock` with `save-button.tsx` header render.
5. In the Table section: click **Props** — tables for DataTable, DataTableColumn, Table, TableToolbar, EmptyState, ErrorState render; type column does not force horizontal page scroll (tables scroll internally).
6. Toggle dark mode via the topbar button — tabs, props tables, and CodeBlock remain legible.
7. Check the browser console for `ExampleTabs: no docs found` warnings — there must be none.

Stop the dev server when done.

- [ ] **Step 3: Fix anything found, then final commit if needed**

If visual verification surfaced fixes, apply them, re-verify, and commit:

```bash
git add -A site/src packages/ui/src
git commit -m "fix(site): polish gallery example tabs after visual verification

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Plan Self-Review Notes

- **Spec coverage:** Popover (§2) → Task 3; Kbd (§3) → Task 1; CodeBlock (§4) → Task 2; showcase data source + ExampleTabs + overrides (§5.1–5.3) → Task 5; rollout + new sections (§5.4) → Task 6; MCP regen (§6) → Task 4; error handling (§7) → context-misuse throw in Task 3, clipboard rejection handler in Task 2, lookup-miss warning in Task 5; testing (§8) → per-task tests + Task 7.
- **Deviation from spec (deliberate):** curated override set narrowed from 8 to 4 (`Button`, `DataTable`, `ToastProvider`, `CommandPalette`) — inspection of `components.json` showed `Drawer`, `Tabs`, `FormField`, `DashboardShell` auto-snippets are already rich. YAGNI.
- **Type consistency:** `ExampleTabsProps.components/code` match `SecProps.components/code` pass-through; `exampleOverrides: Record<string, string>` matches lookup in `ExampleTabs`; `CommandPaletteItem` fields (`title`, `category`, `shortcut`) verified against extractor output.
