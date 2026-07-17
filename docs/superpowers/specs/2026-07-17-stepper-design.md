# Stepper / Wizard — Design

## Summary

Add a compound `Stepper` component system to `@kjaniec-dev/ui`. Closes the `Stepper` / `Wizard` item in `docs/BACKLOG.md`'s "New components: common B2B/dashboard gaps" section. This component is essential for structured multi-step forms such as signups, onboarding wizards, configuration flows, and checkouts.

## Scope

- **Compound API design**: Expose modular primitives (`Stepper`, `StepperList`, `StepperItem`, `StepperTrigger`, `StepperIndicator`, `StepperTitle`, `StepperDescription`, `StepperSeparator`, `StepperContent`) to allow high layout flexibility.
- **Orientations**: Support both `horizontal` (standard top-of-form headers) and `vertical` (timeline-like or sidebar-based step guides).
- **Navigation Modes**: Support linear flows (sequentially lock future steps, allowing back navigation) and non-linear flows (jumping back and forth freely via header triggers).
- **State Management**: Dual-mode supporting both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue` + internal state fallback) behavior.
- **State Hook**: Package a custom hook `useStepper` to manage step state, bounds checks, completion states, and transition actions.
- **A11y**: Full keyboard navigation (Arrow keys, Tab, Enter/Space), screen reader labels, and correct focus management.

## Architecture

The stepper uses React Context to share state across compound children. The structure comprises:
- `StepperContext`: Tracks `activeStep`, `orientation`, `linear`, `onStepClick`, and completion states.
- `StepperItemContext`: Supplies individual step indexes (`value`) to downstream child elements (Triggers, Indicators).

```
[Stepper] (Context Provider)
   ├── [StepperList]
   │     ├── [StepperItem (value=0)] ──── [StepperTrigger]
   │     │                                  ├── [StepperIndicator]
   │     │                                  ├── [StepperTitle]
   │     │                                  └── [StepperDescription]
   │     ├── [StepperSeparator]
   │     └── [StepperItem (value=1)]
   └── [StepperContent (value=0)]
```

## Component API

```tsx
import * as React from "react";

export type StepperOrientation = "horizontal" | "vertical";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // Controlled active step index (0-indexed)
  defaultValue?: number; // Uncontrolled initial step index
  onValueChange?: (value: number) => void; // Triggered when active step changes
  orientation?: StepperOrientation; // default "horizontal"
  linear?: boolean; // default true
}

export interface StepperListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // The step index
  disabled?: boolean;
}

export interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface StepperIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Can be left empty to auto-render step index/checkmark or customized with icons
}

export interface StepperTitleProps extends React.HTMLAttributes<HTMLSpanElement> {}

export interface StepperDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {}

export interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface StepperContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // The step index that controls visibility
}

// React Hook
export interface UseStepperOptions {
  initialStep?: number; // default 0
  stepsCount: number;
}

export interface UseStepperReturn {
  activeStep: number;
  completedSteps: number[];
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: number) => void;
  uncompleteStep: (step: number) => void;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}
```

## Styling & Layout Mechanics (Tailwind / CSS)

- **Colors & Branding**:
  - **Active state**: Amber primary accent highlight (`border-amber-500 text-amber-500` or `shadow-amber-500/20`).
  - **Completed state**: Teal secondary accent background with checkmark icon (`bg-teal-600 border-teal-600 text-white`).
  - **Pending state**: Zinc neutral base borders and text (`border-zinc-700 text-zinc-400 bg-zinc-900/50`).
- **`StepperList`**:
  - `horizontal`: `flex items-center justify-between w-full relative gap-4`
  - `vertical`: `flex flex-col items-start gap-6 relative`
- **`StepperItem`**:
  - `horizontal`: `flex items-center gap-3 relative z-10 bg-background px-2`
  - `vertical`: `flex items-start gap-4 relative z-10 w-full`
- **`StepperSeparator`**:
  - `horizontal`: `flex-1 h-0.5 bg-zinc-700 transition-all duration-300` (can dynamically colorize parts that are completed/active).
  - `vertical`: `w-0.5 bg-zinc-700 absolute left-4.5 top-8 bottom-0 -ml-px z-0` (stretching between indicators).

## Accessibility (A11y)

- **Roles**:
  - `StepperList` is given `role="tablist"` and `aria-orientation`.
  - `StepperTrigger` renders a semantic `<button>` tag with `role="tab"`, `aria-selected`, `aria-controls` pointing to the corresponding `StepperContent` panel.
  - `StepperContent` gets `role="tabpanel"` and `tabIndex={0}`.
- **Keyboard Navigation**:
  - Arrow keys (`ArrowRight` / `ArrowDown` to focus next step; `ArrowLeft` / `ArrowUp` to focus previous step).
  - Triggers are activated by pressing `Space` or `Enter`.
  - Correct visual focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`).

## Testing Plan

Write extensive tests in `stepper.test.tsx`:
1. **State Behaviors**:
   - Verify controlled state transitions on `value` property updates.
   - Verify uncontrolled default state starts from `defaultValue` and changes active steps internally.
2. **Linear Constraint validation**:
   - In `linear={true}` mode, clicking step 2 when active is step 0 should NOT trigger `onValueChange`.
   - In `linear={false}` mode, clicking step 2 should trigger `onStepClick` and update active state immediately.
3. **Hook Functionality**:
   - Test `useStepper` increments step correctly, bounds checks (prevents going below 0 or beyond `stepsCount - 1`), sets correct completed arrays, and exports helper boolean properties (`isFirstStep`, `isLastStep`).
4. **Orientation layouts**:
   - Verify correct layout classes (e.g. flex direction) are toggled based on the `orientation` prop.
5. **Keyboard controls**:
   - Simulate key presses (`ArrowRight`, `Space`, `Enter`) to confirm focused steps navigate correctly.

## Non-goals (this iteration)

- **Built-in form validation integration**: Forms validation is left to established standard validators (e.g., standard HTML validation, React Hook Form, or Zod schema validation). The consumer manages error states and conditionally permits/blocks step advancement.
- **Complex entry animations**: Presenting layout transitions is left to the consumer's preference (e.g., wrapping `StepperContent` in Framer Motion or pure CSS animations).
