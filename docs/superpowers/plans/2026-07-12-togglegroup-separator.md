# ToggleGroup / Separator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `ToggleGroup` (multi-select toggle row) and a `Separator` (layout divider) to `@kjaniec-dev/ui`, closing the `ToggleGroup` / `Separator` (Divider) P1 backlog gap.

**Architecture:** Two small, independent, single-file components — no shared internals file (neither has async/validation logic to extract). `ToggleGroup` is a controlled `role="group"` row of `aria-pressed` toggle buttons, styled like `Segmented`'s track but with independent (non-exclusive) active state. `Separator` is a stateless `<div>` styled as a thin line, decorative by default (`role="none"`) or semantic (`role="separator"` + `aria-orientation`) via a prop.

**Tech Stack:** React 19, TypeScript, Tailwind (kj design tokens), Vitest + `@testing-library/react`, Storybook, the MCP extractor (`npm run mcp:build`).

## Global Constraints

- Design-token classes only (no raw colors). Reuse tokens already used by `Segmented`/`Kbd`/`BreadcrumbSeparator`: `bg-muted`, `bg-surface`, `bg-border`, `text-foreground`, `text-muted-foreground`, `shadow-kj-xs`, `rounded-kj-md`.
- Works in light and dark automatically (tokens handle it) — no theme-specific code.
- Tests import components directly (`from "./toggle-group"`, `from "./separator"`), matching the kit's existing test convention. Use `fireEvent` from `@testing-library/react` for clicks (the convention used in `dropdown-menu.test.tsx`).
- `ToggleGroup` is **always controlled** (`value: T[]`, no `defaultValue`) — same as `Segmented`, which has no uncontrolled mode either.
- `ToggleGroup` is **multi-select only** — do not add a single-select mode; that's `Segmented`'s responsibility.
- `toggle-group.tsx` must start with `"use client";` (it has click handlers). `separator.tsx` must NOT (it's purely presentational, no hooks/handlers — matches `kbd.tsx`/`badge.tsx`/`breadcrumb.tsx`, which also omit `"use client"`).
- No new npm dependency.
- Commit after each task with a Conventional Commit message ending:
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`

---

## File Structure

- Create: `packages/ui/src/components/toggle-group.tsx` — `ToggleGroup` component.
- Create: `packages/ui/src/components/toggle-group.test.tsx` — Vitest suite.
- Create: `packages/ui/src/components/toggle-group.stories.tsx` — Storybook, `title: "Selection/ToggleGroup"`.
- Create: `packages/ui/src/components/separator.tsx` — `Separator` component.
- Create: `packages/ui/src/components/separator.test.tsx` — Vitest suite.
- Create: `packages/ui/src/components/separator.stories.tsx` — Storybook, `title: "Primitives/Separator"`.
- Modify: `packages/ui/src/index.ts` — barrel exports.
- Modify (generated): `packages/mcp/data/components.json` — via `npm run mcp:build`.
- Modify: `site/src/main.tsx` — `ToggleGroup` demo in the Selection controls section, `Separator` demo in the Primitives section, bump the "45 components" badge to "47 components".
- Modify: `docs/BACKLOG.md` — check the `ToggleGroup` / `Separator` item off.

---

## Task 1: `ToggleGroup` component

**Files:**
- Create: `packages/ui/src/components/toggle-group.tsx`
- Test: `packages/ui/src/components/toggle-group.test.tsx`

**Interfaces:**
- Produces: `interface ToggleGroupOption<T extends string> { value: T; label: React.ReactNode }`.
- Produces: `interface ToggleGroupProps<T extends string> { options: ToggleGroupOption<T>[]; value: T[]; onChange: (value: T[]) => void; disabled?: boolean; className?: string; "aria-label": string }`.
- Produces: `function ToggleGroup<T extends string>(props: ToggleGroupProps<T>): JSX.Element`.

- [ ] **Step 1: Write the failing test file**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleGroup } from "./toggle-group";

const options = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
] as const;

describe("ToggleGroup", () => {
  it("renders a group with the given aria-label", () => {
    render(<ToggleGroup options={options} value={[]} onChange={() => {}} aria-label="Text formatting" />);
    expect(screen.getByRole("group", { name: "Text formatting" })).toBeInTheDocument();
  });

  it("reflects value via aria-pressed on each button", () => {
    render(
      <ToggleGroup options={options} value={["bold", "underline"]} onChange={() => {}} aria-label="Text formatting" />
    );
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "I" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "U" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the value appended when clicking an inactive option", () => {
    const onChange = vi.fn();
    render(<ToggleGroup options={options} value={["bold"]} onChange={onChange} aria-label="Text formatting" />);
    fireEvent.click(screen.getByRole("button", { name: "I" }));
    expect(onChange).toHaveBeenCalledWith(["bold", "italic"]);
  });

  it("calls onChange with the value removed when clicking an active option", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup options={options} value={["bold", "italic"]} onChange={onChange} aria-label="Text formatting" />
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith(["italic"]);
  });

  it("does not mutate the value passed in", () => {
    const onChange = vi.fn();
    const value = ["bold"];
    render(<ToggleGroup options={options} value={value} onChange={onChange} aria-label="Text formatting" />);
    fireEvent.click(screen.getByRole("button", { name: "I" }));
    expect(value).toEqual(["bold"]);
  });

  it("disables every button and ignores clicks when disabled", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup options={options} value={["bold"]} onChange={onChange} disabled aria-label="Text formatting" />
    );
    const btn = screen.getByRole("button", { name: "B" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui && npx vitest run src/components/toggle-group.test.tsx`
Expected: FAIL with a module-not-found error for `./toggle-group`.

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface ToggleGroupOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface ToggleGroupProps<T extends string> {
  options: ToggleGroupOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}

/** Multi-select toggle row. Always controlled — each button's pressed state is independent. */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className,
  ...props
}: ToggleGroupProps<T>) {
  const toggle = (optionValue: T) => {
    if (disabled) return;
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  return (
    <div
      role="group"
      className={cn("inline-flex gap-0.5 p-[3px] rounded-kj-md bg-muted", className)}
      {...props}
    >
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => toggle(opt.value)}
            className={cn(
              "px-3.5 py-1.5 text-[0.82rem] font-semibold rounded-[calc(var(--kj-radius-md)-3px)] cursor-pointer transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "bg-surface text-foreground shadow-kj-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui && npx vitest run src/components/toggle-group.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/toggle-group.tsx packages/ui/src/components/toggle-group.test.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add ToggleGroup multi-select toggle row

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `Separator` component

**Files:**
- Create: `packages/ui/src/components/separator.tsx`
- Test: `packages/ui/src/components/separator.test.tsx`

**Interfaces:**
- Produces: `interface SeparatorProps { orientation?: "horizontal" | "vertical"; decorative?: boolean; className?: string }`.
- Produces: `function Separator(props: SeparatorProps): JSX.Element`.

- [ ] **Step 1: Write the failing test file**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("defaults to decorative: role=none, aria-hidden=true, no aria-orientation", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  it("decorative=false renders role=separator with aria-orientation matching orientation", () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("vertical orientation stays decorative (no aria-orientation) unless decorative=false", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  it("horizontal orientation applies a full-width, thin-height class", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("h-px");
  });

  it("vertical orientation applies a full-height, thin-width class", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("h-full");
    expect(el.className).toContain("w-px");
  });

  it("merges a custom className", () => {
    const { container } = render(<Separator className="my-4" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("my-4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/ui && npx vitest run src/components/separator.test.tsx`
Expected: FAIL with a module-not-found error for `./separator`.

- [ ] **Step 3: Write the implementation**

```tsx
import * as React from "react";
import { cn } from "../lib/cn";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  /** Purely visual by default (role="none", hidden from a11y tree). Set false for a semantically meaningful divider. */
  decorative?: boolean;
  className?: string;
}

/** Thin layout divider. Decorative by default; pass decorative={false} for a semantic role="separator". */
export function Separator({ orientation = "horizontal", decorative = true, className }: SeparatorProps) {
  const semanticProps = decorative
    ? { role: "none" as const, "aria-hidden": true as const }
    : { role: "separator" as const, "aria-orientation": orientation };

  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...semanticProps}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/ui && npx vitest run src/components/separator.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/separator.tsx packages/ui/src/components/separator.test.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add Separator layout divider

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Barrel exports

**Files:**
- Modify: `packages/ui/src/index.ts:19` (add `ToggleGroup` after `Segmented`)
- Modify: `packages/ui/src/index.ts:87-95` (add `Separator` near `Kbd`/`CodeBlock`)

**Interfaces:**
- Consumes: `ToggleGroup`, `ToggleGroupProps`, `ToggleGroupOption` from `./components/toggle-group` (Task 1); `Separator`, `SeparatorProps` from `./components/separator` (Task 2).
- Produces: both are now importable from `@kjaniec-dev/ui`.

- [ ] **Step 1: Add the `ToggleGroup` export**

In `packages/ui/src/index.ts`, change line 19 from:

```ts
export { Segmented, type SegmentedProps, type SegmentedOption } from "./components/segmented";
```

to:

```ts
export { Segmented, type SegmentedProps, type SegmentedOption } from "./components/segmented";
export { ToggleGroup, type ToggleGroupProps, type ToggleGroupOption } from "./components/toggle-group";
```

- [ ] **Step 2: Add the `Separator` export**

In `packages/ui/src/index.ts`, find:

```ts
export { Kbd, type KbdProps } from "./components/kbd";
export { CodeBlock, type CodeBlockProps } from "./components/code-block";
```

and add directly after `CodeBlock`'s export line:

```ts
export { Kbd, type KbdProps } from "./components/kbd";
export { CodeBlock, type CodeBlockProps } from "./components/code-block";
export { Separator, type SeparatorProps } from "./components/separator";
```

- [ ] **Step 3: Typecheck**

Run: `cd packages/ui && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "$(cat <<'EOF'
feat(ui): export ToggleGroup and Separator from the barrel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Storybook stories

**Files:**
- Create: `packages/ui/src/components/toggle-group.stories.tsx`
- Create: `packages/ui/src/components/separator.stories.tsx`

**Interfaces:**
- Consumes: `ToggleGroup` (Task 1, via `./toggle-group`), `Separator` (Task 2, via `./separator`).

- [ ] **Step 1: Write `toggle-group.stories.tsx`**

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "Selection/ToggleGroup",
  component: ToggleGroup,
};
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

const options = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(["bold"]);
    return <ToggleGroup options={options} value={value} onChange={setValue} aria-label="Text formatting" />;
  },
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup options={options} value={["bold", "italic"]} onChange={() => {}} disabled aria-label="Text formatting" />
  ),
};
```

- [ ] **Step 2: Write `separator.stories.tsx`**

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="m-0 text-sm">Above</p>
      <Separator className="my-3" />
      <p className="m-0 text-sm">Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-stretch gap-3 h-8">
      <span className="text-sm">Left</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Right</span>
    </div>
  ),
};
```

- [ ] **Step 3: Verify Storybook builds**

Run: `npm run build-storybook --workspace @kjaniec-dev/ui`
Expected: build succeeds, no errors referencing `toggle-group.stories` or `separator.stories`.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/toggle-group.stories.tsx packages/ui/src/components/separator.stories.tsx
git commit -m "$(cat <<'EOF'
feat(ui): add Storybook stories for ToggleGroup and Separator

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Site gallery demo + MCP data + backlog

**Files:**
- Modify: `site/src/main.tsx:19` (import `ToggleGroup`)
- Modify: `site/src/main.tsx:97-98` (import `Separator`)
- Modify: `site/src/main.tsx:335` (add toggle-group demo state)
- Modify: `site/src/main.tsx:892` (add `ToggleGroup` to the Selection controls demo + `components` list)
- Modify: `site/src/main.tsx:1264` (add `Separator` to the Primitives demo + `components` list)
- Modify: `site/src/main.tsx:571` (bump "45 components" → "47 components")
- Modify (generated): `packages/mcp/data/components.json`
- Modify: `docs/BACKLOG.md:36`

**Interfaces:**
- Consumes: `ToggleGroup` (Task 1), `Separator` (Task 2), both exported from `@kjaniec-dev/ui` (Task 3).

- [ ] **Step 1: Import `ToggleGroup` and `Separator` in `site/src/main.tsx`**

Change line 19 from:

```tsx
  Segmented,
```

to:

```tsx
  Segmented,
  ToggleGroup,
```

Change lines 97-98 from:

```tsx
  Kbd,
  CodeBlock
```

to:

```tsx
  Kbd,
  CodeBlock,
  Separator
```

- [ ] **Step 2: Add demo state for `ToggleGroup`**

Directly after line 335 (`const [seg, setSeg] = React.useState("day");`), add:

```tsx
  const [format, setFormat] = React.useState<string[]>(["bold"]);
```

- [ ] **Step 3: Add the `ToggleGroup` demo to the Selection controls section**

In the `Sec id="selection"` block, change the `components` list on line 892 from:

```tsx
          <Sec id="selection" title="Selection controls" desc="Checkboxes, radios, switches, a slider and a segmented control." components={["Checkbox", "CheckboxField", "Radio", "Switch", "Slider", "Segmented"]}>
```

to:

```tsx
          <Sec id="selection" title="Selection controls" desc="Checkboxes, radios, switches, a slider, a segmented control and a multi-select toggle group." components={["Checkbox", "CheckboxField", "Radio", "Switch", "Slider", "Segmented", "ToggleGroup"]}>
```

Then, inside the "Switches, slider, segments" `Box` (after the `<Segmented ... />` block, still inside its `<div className="flex flex-col gap-4">`), add:

```tsx
                  <ToggleGroup
                    value={format}
                    onChange={setFormat}
                    aria-label="Text formatting"
                    options={[
                      { value: "bold", label: <strong>B</strong> },
                      { value: "italic", label: <em>I</em> },
                      { value: "underline", label: <span className="underline">U</span> },
                    ]}
                  />
```

so the full `Box` reads:

```tsx
              <Box className="mb-0">
                <Sub>Switches, slider, segments</Sub>
                <div className="flex flex-col gap-4">
                  <Switch defaultChecked label="Dark mode for new users" />
                  <Switch label="Automatic backups" />
                  <Field>
                    <Label htmlFor="volume-field">Volume</Label>
                    <Slider id="volume-field" min={0} max={100} defaultValue={65} />
                  </Field>
                  <Segmented
                    value={seg}
                    onChange={setSeg}
                    options={[
                      { value: "day", label: "Day" },
                      { value: "week", label: "Week" },
                      { value: "month", label: "Month" },
                    ]}
                  />
                  <ToggleGroup
                    value={format}
                    onChange={setFormat}
                    aria-label="Text formatting"
                    options={[
                      { value: "bold", label: <strong>B</strong> },
                      { value: "italic", label: <em>I</em> },
                      { value: "underline", label: <span className="underline">U</span> },
                    ]}
                  />
                </div>
              </Box>
```

- [ ] **Step 4: Add the `Separator` demo to the Primitives section**

Change the `components` list on line 1264 from:

```tsx
            components={["Popover", "PopoverContent", "Kbd", "CodeBlock"]}
```

to:

```tsx
            components={["Popover", "PopoverContent", "Kbd", "CodeBlock", "Separator"]}
```

Then, still inside the `Sec id="primitives"` block, add a new `Box` directly after the "Keyboard hints" `Box` (before the "Code block" `Box`):

```tsx
            <Box>
              <Sub>Separator</Sub>
              <div className="w-64">
                <p className="m-0 text-sm">Above</p>
                <Separator className="my-3" />
                <p className="m-0 text-sm">Below</p>
              </div>
              <div className="mt-4 flex items-stretch gap-3 h-8">
                <span className="text-sm text-muted-foreground">Left</span>
                <Separator orientation="vertical" />
                <span className="text-sm text-muted-foreground">Right</span>
              </div>
            </Box>
```

- [ ] **Step 5: Bump the component count badge**

Change line 571 from:

```tsx
              45 components
```

to:

```tsx
              47 components
```

- [ ] **Step 6: Regenerate MCP data**

Run: `npm run mcp:build`
Expected: succeeds, `packages/mcp/data/components.json` now includes `ToggleGroup` and `Separator` entries.

- [ ] **Step 7: Check the backlog item off**

In `docs/BACKLOG.md`, change line 36 from:

```markdown
- [ ] `ToggleGroup` / `Separator` (Divider) — small but commonly used primitives, missing despite `Segmented`/`Tabs` already existing.
```

to:

```markdown
- [x] `ToggleGroup` / `Separator` (Divider) — multi-select toggle row and a generic layout divider (horizontal/vertical, decorative or semantic) shipped.
```

- [ ] **Step 8: Verify visually**

Run: `npm run site:dev`, open the dev URL, navigate to the "Selection" and "Primitives" nav sections, confirm:
- The `ToggleGroup` (B/I/U) renders, clicking each button toggles its pressed state independently (multiple can be active), the badge in the header reads "47 components".
- The `Separator` renders a horizontal line between "Above"/"Below" and a vertical line between "Left"/"Right".
- No console errors.

- [ ] **Step 9: Commit**

```bash
git add site/src/main.tsx packages/mcp/data/components.json docs/BACKLOG.md
git commit -m "$(cat <<'EOF'
feat(ui): showcase ToggleGroup/Separator in Storybook + site, regen MCP data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm run test --workspace @kjaniec-dev/ui`
Expected: all tests pass, including the new `toggle-group.test.tsx` and `separator.test.tsx`.

- [ ] **Step 2: Typecheck the whole workspace**

Run: `npm run typecheck --workspaces --if-present`
Expected: no errors.

- [ ] **Step 3: Build the `ui` package**

Run: `npm run build --workspace @kjaniec-dev/ui`
Expected: succeeds, `packages/ui/dist/index.js` now exports `ToggleGroup` and `Separator` (`grep -c "ToggleGroup\|Separator" packages/ui/dist/index.js` returns > 0).

- [ ] **Step 4: No further commit needed**

This task is verification-only; Task 5 Step 9 already committed the working tree. If any step above fails, fix the underlying issue in the relevant earlier task and re-commit there — do not bundle unrelated fixes into a new commit here.
