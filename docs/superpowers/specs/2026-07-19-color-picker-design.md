# ColorPicker & ColorPickerField Design Specification

**Date:** 2026-07-19  
**Status:** Approved  
**Target Package:** `@kjaniec-dev/ui`  

---

## 1. Overview & Objectives

The `ColorPicker` suite provides a durable, popover-triggered color selection component for forms, theme settings, and SaaS admin panels. It features a compact swatch button trigger, an interactive 12-color curated palette grid, a smooth Hue slider, and an editable Hex input. It also provides a `ColorPickerField` wrapper for form integration.

### Key Deliverables

1. `ColorPicker` — Main popover-triggered color picker component supporting controlled and uncontrolled state.
2. `ColorPickerField` — Form field wrapper with `Label`, `Hint`, `ErrorMessage`, and `required` indicator.
3. `ColorPickerSwatch` — Standalone rounded color preview button.
4. `DEFAULT_COLOR_SWATCHES` — 12-color curated design kit palette array.
5. Unit tests — Vitest + React Testing Library unit test suite (`color-picker.test.tsx`).
6. Storybook stories — `color-picker.stories.tsx` (Default, Custom Swatches, Disabled, Field Wrapper).
7. Showcase integration — Live section in `site/src/main.tsx`.

---

## 2. Architecture & File Structure

```
packages/ui/src/components/
├── color-picker.tsx        # Main component + hook exports
├── color-picker.test.tsx   # Vitest / RTL unit tests
└── color-picker.stories.tsx
```

All exports added to `packages/ui/src/index.ts`.

---

## 3. Data Types & API

```typescript
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
  /** Additional class name for the trigger element. */
  className?: string;
}

export interface ColorPickerFieldProps extends ColorPickerProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}
```

---

## 4. Component Structure & Interactions

### 4.1 Trigger Button
- Renders a `<button>` containing:
  - 24×24 rounded color swatch preview box (`border border-border/50 shadow-sm`).
  - Text label showing uppercase Hex string (e.g., `#3B82F6`).
  - Chevron down icon.
- Styled using kit tokens: `bg-surface border border-border rounded-kj-md text-foreground hover:bg-muted`.

### 4.2 Popover Panel
- Floating dialog positioned below the trigger.
- **Header**: Banner showing current color swatch and bold uppercase Hex value.
- **Palette Grid**: 6-column grid displaying the `swatches` array. Active swatch shows a checkmark (`✓`) overlay.
- **Hue Slider**: Interactive range slider (0°–360°) that updates the active color hue while keeping saturation & lightness balanced.
- **Hex Input**: Text input validating 3 or 6-character hex strings (e.g., `#FFF` or `#3B82F6`). On blur or Enter, updates the selected color if valid.

---

## 5. Accessibility & Keyboard Navigation

- Swatch trigger: `aria-haspopup="dialog"`, `aria-expanded={open}`, `aria-label="Select color, current #3B82F6"`.
- Palette swatches: `role="button"`, `aria-label="Select color #EF4444"`, keyboard focusable with Enter/Space to select.
- Popover panel: `role="dialog"`, `aria-label="Color picker"`, `tabIndex={-1}`, closes on `Escape` key and click-outside with focus returned to trigger.

---

## 6. Verification Plan

1. **Unit tests (`color-picker.test.tsx`)**:
   - Renders trigger with initial hex value.
   - Opens popover panel on click.
   - Clicking a swatch updates the selected color and calls `onChange`.
   - Changing Hue slider updates the color.
   - Entering valid Hex string updates color; invalid Hex string is rejected.
   - `disabled` state prevents opening popover.
   - `ColorPickerField` renders label, hint, and error message.
2. **Build & Typecheck**:
   - `npm run typecheck`
   - `npm run build`
3. **Showcase & Storybook**:
   - Add interactive `ColorPicker` section in `site/src/main.tsx`.
   - Add Storybook stories (`color-picker.stories.tsx`).
