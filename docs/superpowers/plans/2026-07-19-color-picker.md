# ColorPicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `ColorPicker` component suite (`ColorPicker`, `ColorPickerField`, `ColorPickerSwatch`, `DEFAULT_COLOR_SWATCHES`, and color utilities) with full Vitest unit tests, Storybook stories, and a live showcase demo.

**Architecture:** A single `color-picker.tsx` file containing all component exports and color conversion helpers. `ColorPicker` uses the existing `Popover` component for popover positioning, rendering a compact swatch button trigger and a popover panel containing a 12-color palette grid, Hue slider, and Hex input.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (kit tokens), Vitest + React Testing Library, Storybook 8.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `packages/ui/src/components/color-picker.tsx` | Main component, types, and color helper exports |
| Create | `packages/ui/src/components/color-picker.test.tsx` | Unit tests |
| Create | `packages/ui/src/components/color-picker.stories.tsx` | Storybook stories |
| Modify | `packages/ui/src/index.ts` | Barrel exports |
| Modify | `site/src/main.tsx` | Showcase gallery section |
| Modify | `docs/BACKLOG.md` | Check off ColorPicker in backlog |

---

## Task 1: Color helper utilities & `DEFAULT_COLOR_SWATCHES` constant

**Files:**
- Create: `packages/ui/src/components/color-picker.tsx` (initial file with types & helpers)
- Create: `packages/ui/src/components/color-picker.test.tsx` (helper tests)

- [ ] **Step 1.1: Write failing tests for color helpers**

Create `packages/ui/src/components/color-picker.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { isValidHex, hexToHsl, hslToHex, DEFAULT_COLOR_SWATCHES } from "./color-picker";

describe("Color Picker Utilities", () => {
  it("exports DEFAULT_COLOR_SWATCHES array with 12 colors", () => {
    expect(DEFAULT_COLOR_SWATCHES).toHaveLength(12);
    expect(DEFAULT_COLOR_SWATCHES[0]).toBe("#EF4444");
  });

  it("isValidHex validates 3 and 6-digit hex strings", () => {
    expect(isValidHex("#3B82F6")).toBe(true);
    expect(isValidHex("#fff")).toBe(true);
    expect(isValidHex("3B82F6")).toBe(true);
    expect(isValidHex("#3B82")).toBe(false);
    expect(isValidHex("invalid")).toBe(false);
  });

  it("hexToHsl converts valid hex strings to HSL object", () => {
    const hsl = hexToHsl("#3B82F6");
    expect(hsl.h).toBeGreaterThanOrEqual(0);
    expect(hsl.h).toBeLessThanOrEqual(360);
    expect(hsl.s).toBeGreaterThanOrEqual(0);
    expect(hsl.l).toBeGreaterThanOrEqual(0);
  });

  it("hslToHex converts HSL values back to hex string", () => {
    const hex = hslToHex(217, 91, 60);
    expect(hex.toUpperCase()).toMatch(/^#[0-9A-F]{6}$/);
  });
});
```

- [ ] **Step 1.2: Run tests to confirm they fail**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 1.3: Implement color utilities in `color-picker.tsx`**

Create `packages/ui/src/components/color-picker.tsx`:

```tsx
"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export const DEFAULT_COLOR_SWATCHES = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#64748B", // Slate
  "#1E293B", // Charcoal
] as const;

export function isValidHex(hex: string): boolean {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean);
}

export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  if (!clean.startsWith("#")) clean = `#${clean}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(clean)) {
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean.toUpperCase();
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sPct = s / 100;
  const lPct = l / 100;

  const c = (1 - Math.abs(2 * lPct - 1)) * sPct;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lPct - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
```

- [ ] **Step 1.4: Run tests to confirm helper tests pass**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 1.5: Commit**

```bash
git add packages/ui/src/components/color-picker.tsx packages/ui/src/components/color-picker.test.tsx
git commit -m "feat(color-picker): add DEFAULT_COLOR_SWATCHES and color conversion utilities"
```

---

## Task 2: `ColorPickerSwatch` component

**Files:**
- Modify: `packages/ui/src/components/color-picker.tsx` (append `ColorPickerSwatch`)
- Modify: `packages/ui/src/components/color-picker.test.tsx` (append swatch tests)

- [ ] **Step 2.1: Write failing tests for `ColorPickerSwatch`**

Append to `packages/ui/src/components/color-picker.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPickerSwatch } from "./color-picker";

describe("ColorPickerSwatch", () => {
  it("renders a button with background color", () => {
    render(<ColorPickerSwatch color="#EF4444" aria-label="Red swatch" />);
    const button = screen.getByRole("button", { name: "Red swatch" });
    expect(button).toBeInTheDocument();
  });

  it("shows checkmark when selected is true", () => {
    render(<ColorPickerSwatch color="#EF4444" selected aria-label="Red swatch" />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ColorPickerSwatch color="#EF4444" onClick={onClick} aria-label="Red swatch" />);
    fireEvent.click(screen.getByRole("button", { name: "Red swatch" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2.2: Run tests to confirm fail**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: FAIL — `ColorPickerSwatch` not exported.

- [ ] **Step 2.3: Implement `ColorPickerSwatch`**

Append to `packages/ui/src/components/color-picker.tsx`:

```tsx
export interface ColorPickerSwatchProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color: string;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ColorPickerSwatch = React.forwardRef<
  HTMLButtonElement,
  ColorPickerSwatchProps
>(({ color, selected = false, size = "md", className, style, ...props }, ref) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <button
      ref={ref}
      type="button"
      style={{ backgroundColor: color, ...style }}
      className={cn(
        "relative shrink-0 rounded-full border border-border/50 shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex items-center justify-center text-white text-xs font-bold",
        sizeClasses[size],
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
        className
      )}
      {...props}
    >
      {selected && <span aria-hidden="true">✓</span>}
    </button>
  );
});
ColorPickerSwatch.displayName = "ColorPickerSwatch";
```

- [ ] **Step 2.4: Run tests to confirm pass**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: 7 tests pass.

- [ ] **Step 2.5: Commit**

```bash
git add packages/ui/src/components/color-picker.tsx packages/ui/src/components/color-picker.test.tsx
git commit -m "feat(color-picker): add ColorPickerSwatch component"
```

---

## Task 3: `ColorPicker` component (Trigger + Popover + Swatches + Hue Slider + Hex Input)

**Files:**
- Modify: `packages/ui/src/components/color-picker.tsx` (append `ColorPicker`)
- Modify: `packages/ui/src/components/color-picker.test.tsx` (append `ColorPicker` tests)

- [ ] **Step 3.1: Write failing tests for `ColorPicker`**

Append to `packages/ui/src/components/color-picker.test.tsx`:

```tsx
import userEvent from "@testing-library/user-event";
import { ColorPicker } from "./color-picker";

describe("ColorPicker", () => {
  it("renders trigger button displaying initial hex value", () => {
    render(<ColorPicker defaultValue="#3B82F6" />);
    expect(screen.getByRole("button", { name: /#3B82F6/i })).toBeInTheDocument();
  });

  it("opens popover on click and shows swatch grid", async () => {
    render(<ColorPicker defaultValue="#3B82F6" />);
    const trigger = screen.getByRole("button", { name: /#3B82F6/i });
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("selecting a swatch calls onChange and updates selected color", async () => {
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#3B82F6" onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: /#3B82F6/i });
    await userEvent.click(trigger);
    const redSwatch = screen.getByRole("button", { name: "Select color #EF4444" });
    await userEvent.click(redSwatch);
    expect(onChange).toHaveBeenCalledWith("#EF4444");
  });

  it("typing a valid hex value into input updates the color", async () => {
    const onChange = vi.fn();
    render(<ColorPicker defaultValue="#3B82F6" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /#3B82F6/i }));
    const hexInput = screen.getByPlaceholderText("#000000");
    await userEvent.clear(hexInput);
    await userEvent.type(hexInput, "#10B981{Enter}");
    expect(onChange).toHaveBeenCalledWith("#10B981");
  });

  it("does not open popover when disabled", async () => {
    render(<ColorPicker disabled defaultValue="#3B82F6" />);
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3.2: Run tests to confirm fail**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: FAIL — `ColorPicker` not exported.

- [ ] **Step 3.3: Implement `ColorPicker`**

Append to `packages/ui/src/components/color-picker.tsx`:

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  /** Current hex color value (controlled). */
  value?: string;
  /** Initial hex color value (uncontrolled). Defaults to "#3B82F6". */
  defaultValue?: string;
  /** Called when color changes. */
  onChange?: (hex: string) => void;
  /** Array of hex color strings for preset palette. Defaults to DEFAULT_COLOR_SWATCHES. */
  swatches?: readonly string[] | string[];
  /** Whether the picker is disabled. */
  disabled?: boolean;
  /** Whether to show the manual Hex text input inside the popover. Defaults to true. */
  showHexInput?: boolean;
  /** Additional class name for the container. */
  className?: string;
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      defaultValue = "#3B82F6",
      onChange,
      swatches = DEFAULT_COLOR_SWATCHES,
      disabled = false,
      showHexInput = true,
      className,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [localColor, setLocalColor] = React.useState<string>(
      normalizeHex(defaultValue)
    );
    const color = isControlled ? normalizeHex(value) : localColor;

    const [hexInputValue, setHexInputValue] = React.useState<string>(color);

    React.useEffect(() => {
      setHexInputValue(color);
    }, [color]);

    const handleColorChange = React.useCallback(
      (newHex: string) => {
        const normalized = normalizeHex(newHex);
        if (!isControlled) {
          setLocalColor(normalized);
        }
        onChange?.(normalized);
      },
      [isControlled, onChange]
    );

    const hsl = React.useMemo(() => hexToHsl(color), [color]);

    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const h = Number(e.target.value);
      const newHex = hslToHex(h, Math.max(hsl.s, 40), Math.max(hsl.l, 30));
      handleColorChange(newHex);
    };

    const handleHexSubmit = () => {
      if (isValidHex(hexInputValue)) {
        handleColorChange(hexInputValue);
      } else {
        setHexInputValue(color);
      }
    };

    return (
      <div ref={ref} className={cn("inline-block", className)} {...props}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Select color, current ${color}`}
              className={cn(
                "inline-flex items-center gap-2.5 px-3 py-1.5 rounded-kj-md border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <span
                style={{ backgroundColor: color }}
                className="w-5 h-5 rounded-full border border-border/50 shadow-sm shrink-0"
              />
              <span className="font-mono text-xs uppercase">{color}</span>
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground ml-auto"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-64 p-3.5 space-y-3.5">
            {/* Header Banner */}
            <div className="flex items-center gap-3 p-2 rounded-kj-md bg-muted/40 border border-border">
              <span
                style={{ backgroundColor: color }}
                className="w-8 h-8 rounded-full border border-border/50 shadow-sm shrink-0"
              />
              <div>
                <p className="text-xs text-muted-foreground">Selected Color</p>
                <p className="text-sm font-mono font-bold text-foreground uppercase">{color}</p>
              </div>
            </div>

            {/* Swatches Grid */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Preset Swatches</p>
              <div className="grid grid-cols-6 gap-2">
                {swatches.map((swatch) => {
                  const normalizedSwatch = normalizeHex(swatch);
                  return (
                    <ColorPickerSwatch
                      key={swatch}
                      color={swatch}
                      selected={normalizedSwatch === color}
                      aria-label={`Select color ${swatch}`}
                      onClick={() => handleColorChange(swatch)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hue Slider */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">Hue</p>
              <input
                type="range"
                min={0}
                max={360}
                value={hsl.h}
                onChange={handleHueChange}
                aria-label="Hue slider"
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
            </div>

            {/* Manual Hex Input */}
            {showHexInput && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Hex Code</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hexInputValue}
                    onChange={(e) => setHexInputValue(e.target.value)}
                    onBlur={handleHexSubmit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleHexSubmit();
                    }}
                    placeholder="#000000"
                    className="flex-1 px-2.5 py-1 text-xs font-mono rounded-kj-md border border-border bg-surface text-foreground uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
ColorPicker.displayName = "ColorPicker";
```

- [ ] **Step 3.4: Run tests to confirm pass**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: 12 tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add packages/ui/src/components/color-picker.tsx packages/ui/src/components/color-picker.test.tsx
git commit -m "feat(color-picker): add ColorPicker popover component"
```

---

## Task 4: `ColorPickerField` wrapper component

**Files:**
- Modify: `packages/ui/src/components/color-picker.tsx` (append `ColorPickerField`)
- Modify: `packages/ui/src/components/color-picker.test.tsx` (append field tests)

- [ ] **Step 4.1: Write failing tests for `ColorPickerField`**

Append to `packages/ui/src/components/color-picker.test.tsx`:

```tsx
import { ColorPickerField } from "./color-picker";

describe("ColorPickerField", () => {
  it("renders label, hint, and error message", () => {
    render(
      <ColorPickerField
        label="Brand Color"
        hint="Primary theme accent"
        error="Invalid color"
        defaultValue="#3B82F6"
      />
    );
    expect(screen.getByText("Brand Color")).toBeInTheDocument();
    expect(screen.getByText("Primary theme accent")).toBeInTheDocument();
    expect(screen.getByText("Invalid color")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4.2: Run tests to confirm fail**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: FAIL — `ColorPickerField` not exported.

- [ ] **Step 4.3: Implement `ColorPickerField`**

Append to `packages/ui/src/components/color-picker.tsx`:

```tsx
import { Field } from "./field";

export interface ColorPickerFieldProps extends ColorPickerProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

export const ColorPickerField = React.forwardRef<
  HTMLDivElement,
  ColorPickerFieldProps
>(({ label, hint, error, required, ...props }, ref) => {
  return (
    <Field label={label} hint={hint} error={error} required={required}>
      <ColorPicker ref={ref} {...props} />
    </Field>
  );
});
ColorPickerField.displayName = "ColorPickerField";
```

- [ ] **Step 4.4: Run tests to confirm pass**

```bash
cd packages/ui && npx vitest run src/components/color-picker.test.tsx
```

Expected: 13 tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add packages/ui/src/components/color-picker.tsx packages/ui/src/components/color-picker.test.tsx
git commit -m "feat(color-picker): add ColorPickerField wrapper component"
```

---

## Task 5: Barrel exports in `@kjaniec-dev/ui`

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 5.1: Add exports to `packages/ui/src/index.ts`**

Append after `InboxPopover` export block:

```ts
export {
  ColorPicker,
  ColorPickerField,
  ColorPickerSwatch,
  DEFAULT_COLOR_SWATCHES,
  isValidHex,
  normalizeHex,
  hexToHsl,
  hslToHex,
  type ColorPickerProps,
  type ColorPickerFieldProps,
  type ColorPickerSwatchProps,
} from "./components/color-picker";
```

- [ ] **Step 5.2: Typecheck & build**

```bash
cd packages/ui && npm run typecheck && npm run build
```

Expected: TypeScript passes, tsup build succeeds.

- [ ] **Step 5.3: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(color-picker): add barrel exports to @kjaniec-dev/ui"
```

---

## Task 6: Storybook stories

**Files:**
- Create: `packages/ui/src/components/color-picker.stories.tsx`

- [ ] **Step 6.1: Create `color-picker.stories.tsx`**

Create `packages/ui/src/components/color-picker.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ColorPicker, ColorPickerField, ColorPickerSwatch } from "./color-picker";

const meta: Meta<typeof ColorPicker> = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "#3B82F6",
  },
};

export const CustomSwatches: Story = {
  args: {
    defaultValue: "#10B981",
    swatches: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#1E293B"],
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "#6366F1",
    disabled: true,
  },
};

export const FieldWrapper: Story = {
  render: () => (
    <ColorPickerField
      label="Brand Primary Color"
      hint="Choose your main product accent color"
      defaultValue="#3B82F6"
    />
  ),
};
```

- [ ] **Step 6.2: Typecheck**

```bash
cd packages/ui && npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 6.3: Commit**

```bash
git add packages/ui/src/components/color-picker.stories.tsx
git commit -m "feat(color-picker): add Storybook stories"
```

---

## Task 7: Showcase section in `site/`

**Files:**
- Modify: `site/src/main.tsx`

- [ ] **Step 7.1: Add `ColorPicker` showcase section in `site/src/main.tsx`**

Add import to `site/src/main.tsx`:
```tsx
import { ColorPicker, ColorPickerField } from "@kjaniec-dev/ui";
```

Add demo component in `site/src/main.tsx`:
```tsx
function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3B82F6");
  return (
    <div className="space-y-4 max-w-sm">
      <ColorPickerField
        label="Accent Color"
        hint="Used for primary buttons and interactive highlights"
        value={color}
        onChange={setColor}
      />
      <div className="p-3 rounded-kj-md border border-border flex items-center gap-3">
        <span className="w-6 h-6 rounded-full border border-border shrink-0" style={{ backgroundColor: color }} />
        <span className="text-xs font-mono text-muted-foreground uppercase">Active: {color}</span>
      </div>
    </div>
  );
}
```

Add section in `NAV` array (`["color-picker", "ColorPicker"]`) and section JSX under forms or primitives.

- [ ] **Step 7.2: Build site & test**

```bash
npm run build --workspace=site
npm test
```

Expected: site build succeeds, full test suite passes.

- [ ] **Step 7.3: Commit**

```bash
git add site/src/main.tsx
git commit -m "feat(color-picker): add showcase demo section to site/"
```

---

## Task 8: Backlog update & final verification

**Files:**
- Modify: `docs/BACKLOG.md`

- [ ] **Step 8.1: Mark ColorPicker as complete in `docs/BACKLOG.md`**

In `docs/BACKLOG.md`:
```markdown
- [x] `ColorPicker`
```

- [ ] **Step 8.2: Run full monorepo verification**

```bash
npm test
npm run build --workspace=packages/ui
npm run build --workspace=site
```

Expected: All tests pass, builds succeed.

- [ ] **Step 8.3: Commit**

```bash
git add docs/BACKLOG.md
git commit -m "chore: mark ColorPicker as complete in BACKLOG"
```
