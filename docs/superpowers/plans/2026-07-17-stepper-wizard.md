# Stepper / Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compound, keyboard-accessible `Stepper` component system and a custom state hook `useStepper` to `@kjaniec-dev/ui` to support multi-step forms.

**Architecture:** Use React Context to propagate active state, orientation, and linear constraints from a central `Stepper` provider to compound child elements, allowing arbitrary nested layouts.

**Tech Stack:** React, Tailwind CSS, TypeScript, Vitest, Storybook.

---

### Task 1: Hook `useStepper` Implementation

**Files:**
- Create: `packages/ui/src/components/stepper.tsx` (Hook definition)
- Create: `packages/ui/src/components/stepper.test.tsx` (Unit tests)

- [ ] **Step 1: Write the hook unit test**
  Write tests in `packages/ui/src/components/stepper.test.tsx` that import and verify `useStepper` behavior.
  
  ```tsx
  import { describe, it, expect } from "vitest";
  import { renderHook, act } from "@testing-library/react";
  import { useStepper } from "./stepper";

  describe("useStepper", () => {
    it("should initialize step state correctly", () => {
      const { result } = renderHook(() => useStepper({ initialStep: 0, stepsCount: 3 }));
      expect(result.current.activeStep).toBe(0);
      expect(result.current.completedSteps).toEqual([]);
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
    });

    it("should navigate steps forward and backward within bounds", () => {
      const { result } = renderHook(() => useStepper({ initialStep: 0, stepsCount: 3 }));
      
      act(() => { result.current.nextStep(); });
      expect(result.current.activeStep).toBe(1);
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);

      act(() => { result.current.nextStep(); });
      expect(result.current.activeStep).toBe(2);
      expect(result.current.isLastStep).toBe(true);

      // Prevent overflow
      act(() => { result.current.nextStep(); });
      expect(result.current.activeStep).toBe(2);

      // Go back
      act(() => { result.current.prevStep(); });
      expect(result.current.activeStep).toBe(1);

      // Prevent underflow
      act(() => {
        result.current.prevStep();
        result.current.prevStep();
      });
      expect(result.current.activeStep).toBe(0);
    });

    it("should manage completed steps list", () => {
      const { result } = renderHook(() => useStepper({ initialStep: 0, stepsCount: 3 }));
      
      act(() => { result.current.completeStep(0); });
      expect(result.current.completedSteps).toEqual([0]);

      act(() => { result.current.completeStep(1); });
      expect(result.current.completedSteps).toEqual([0, 1]);

      act(() => { result.current.uncompleteStep(0); });
      expect(result.current.completedSteps).toEqual([1]);

      act(() => { result.current.reset(); });
      expect(result.current.activeStep).toBe(0);
      expect(result.current.completedSteps).toEqual([]);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: FAIL with "useStepper not defined"

- [ ] **Step 3: Implement useStepper hook**
  Write the minimal code in `packages/ui/src/components/stepper.tsx`:
  
  ```tsx
  import * as React from "react";

  export interface UseStepperOptions {
    initialStep?: number;
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

  export function useStepper({ initialStep = 0, stepsCount }: UseStepperOptions): UseStepperReturn {
    const [activeStep, setActiveStep] = React.useState(initialStep);
    const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

    const setStep = React.useCallback((step: number) => {
      if (step >= 0 && step < stepsCount) {
        setActiveStep(step);
      }
    }, [stepsCount]);

    const nextStep = React.useCallback(() => {
      setActiveStep((prev) => Math.min(prev + 1, stepsCount - 1));
    }, [stepsCount]);

    const prevStep = React.useCallback(() => {
      setActiveStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const completeStep = React.useCallback((step: number) => {
      setCompletedSteps((prev) => {
        if (prev.includes(step)) return prev;
        return [...prev, step].sort((a, b) => a - b);
      });
    }, []);

    const uncompleteStep = React.useCallback((step: number) => {
      setCompletedSteps((prev) => prev.filter((s) => s !== step));
    }, []);

    const reset = React.useCallback(() => {
      setActiveStep(initialStep);
      setCompletedSteps([]);
    }, [initialStep]);

    return {
      activeStep,
      completedSteps,
      setStep,
      nextStep,
      prevStep,
      completeStep,
      uncompleteStep,
      reset,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === stepsCount - 1,
    };
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add packages/ui/src/components/stepper.tsx packages/ui/src/components/stepper.test.tsx
  git commit -m "feat(ui): add useStepper state hook and baseline test"
  ```

---

### Task 2: Core Context and Stepper Wrapper

**Files:**
- Modify: `packages/ui/src/components/stepper.tsx` (Context + Stepper + StepperContent)
- Modify: `packages/ui/src/components/stepper.test.tsx` (Controlled/Uncontrolled tests)

- [ ] **Step 1: Write tests for controlled/uncontrolled state**
  Add tests inside `packages/ui/src/components/stepper.test.tsx`:
  
  ```tsx
  import { render, screen } from "@testing-library/react";
  import * as React from "react";
  import { Stepper, StepperContent } from "./stepper";

  describe("Stepper Core State", () => {
    it("should render active content panel correctly in uncontrolled mode", () => {
      render(
        <Stepper defaultValue={1}>
          <StepperContent value={0}>Panel 0</StepperContent>
          <StepperContent value={1}>Panel 1</StepperContent>
        </Stepper>
      );
      expect(screen.queryByText("Panel 0")).toBeNull();
      expect(screen.getByText("Panel 1")).toBeDefined();
    });

    it("should follow parent changes in controlled mode", () => {
      const { rerender } = render(
        <Stepper value={0}>
          <StepperContent value={0}>Panel 0</StepperContent>
          <StepperContent value={1}>Panel 1</StepperContent>
        </Stepper>
      );
      expect(screen.getByText("Panel 0")).toBeDefined();
      expect(screen.queryByText("Panel 1")).toBeNull();

      rerender(
        <Stepper value={1}>
          <StepperContent value={0}>Panel 0</StepperContent>
          <StepperContent value={1}>Panel 1</StepperContent>
        </Stepper>
      );
      expect(screen.queryByText("Panel 0")).toBeNull();
      expect(screen.getByText("Panel 1")).toBeDefined();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: FAIL with "Stepper not defined"

- [ ] **Step 3: Implement Contexts, Stepper, and StepperContent**
  Append code inside `packages/ui/src/components/stepper.tsx`:
  
  ```tsx
  import { cn } from "../lib/cn";

  export type StepperOrientation = "horizontal" | "vertical";

  interface StepperCtx {
    activeStep: number;
    orientation: StepperOrientation;
    linear: boolean;
    setStep: (step: number) => void;
    completedSteps: number[];
    registerStep: (value: number) => void;
    unregisterStep: (value: number) => void;
    steps: number[];
  }

  export const StepperContext = React.createContext<StepperCtx | null>(null);

  interface StepperItemCtx {
    value: number;
    disabled: boolean;
    isLast: boolean;
  }

  export const StepperItemContext = React.createContext<StepperItemCtx | null>(null);

  export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    orientation?: StepperOrientation;
    linear?: boolean;
  }

  export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
    ({ value, defaultValue, onValueChange, orientation = "horizontal", linear = true, children, className, ...props }, ref) => {
      const [localValue, setLocalValue] = React.useState(defaultValue ?? 0);
      const isControlled = value !== undefined;
      const activeStep = isControlled ? value : localValue;

      const [steps, setSteps] = React.useState<number[]>([]);
      const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

      const registerStep = React.useCallback((val: number) => {
        setSteps((prev) => (prev.includes(val) ? prev : [...prev, val].sort((a, b) => a - b)));
      }, []);

      const unregisterStep = React.useCallback((val: number) => {
        setSteps((prev) => prev.filter((v) => v !== val));
      }, []);

      const setStep = React.useCallback((step: number) => {
        if (!isControlled) {
          setLocalValue(step);
        }
        onValueChange?.(step);

        // Auto mark previous steps as completed in linear mode
        if (linear) {
          setCompletedSteps((prev) => {
            const nextCompleted = [...prev];
            for (let i = 0; i < step; i++) {
              if (!nextCompleted.includes(i)) nextCompleted.push(i);
            }
            return nextCompleted.filter((s) => s < step).sort((a, b) => a - b);
          });
        }
      }, [isControlled, onValueChange, linear]);

      return (
        <StepperContext.Provider
          value={{
            activeStep,
            orientation,
            linear,
            setStep,
            completedSteps,
            registerStep,
            unregisterStep,
            steps,
          }}
        >
          <div
            ref={ref}
            className={cn(
              "w-full",
              orientation === "vertical" ? "flex flex-col gap-6" : "space-y-6",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </StepperContext.Provider>
      );
    }
  );
  Stepper.displayName = "Stepper";

  export interface StepperContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
  }

  export const StepperContent = React.forwardRef<HTMLDivElement, StepperContentProps>(
    ({ value, className, children, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      if (!ctx) throw new Error("StepperContent must be used within a Stepper");

      const isActive = ctx.activeStep === value;

      if (!isActive) return null;

      return (
        <div
          ref={ref}
          role="tabpanel"
          tabIndex={0}
          className={cn("focus-visible:outline-none w-full", className)}
          {...props}
        >
          {children}
        </div>
      );
    }
  );
  StepperContent.displayName = "StepperContent";
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add packages/ui/src/components/stepper.tsx packages/ui/src/components/stepper.test.tsx
  git commit -m "feat(ui): implement Stepper core context and StepperContent container"
  ```

---

### Task 3: Layout Structure (`StepperList`, `StepperItem`, `StepperSeparator`)

**Files:**
- Modify: `packages/ui/src/components/stepper.tsx` (List, Item, Separator)
- Modify: `packages/ui/src/components/stepper.test.tsx` (Verify layout & tracks)

- [ ] **Step 1: Write test verifying layout orientation classes**
  Add tests inside `packages/ui/src/components/stepper.test.tsx`:
  
  ```tsx
  import { StepperList, StepperItem, StepperSeparator } from "./stepper";

  describe("Stepper Layout Primitives", () => {
    it("should render lists with correct layout orientations", () => {
      const { rerender } = render(
        <Stepper orientation="horizontal">
          <StepperList>
            <StepperItem value={0}>First</StepperItem>
            <StepperSeparator />
            <StepperItem value={1}>Second</StepperItem>
          </StepperList>
        </Stepper>
      );
      const list = screen.getByRole("tablist");
      expect(list.className).toContain("flex items-center");

      rerender(
        <Stepper orientation="vertical">
          <StepperList>
            <StepperItem value={0}>First</StepperItem>
            <StepperSeparator />
            <StepperItem value={1}>Second</StepperItem>
          </StepperList>
        </Stepper>
      );
      const updatedList = screen.getByRole("tablist");
      expect(updatedList.className).toContain("flex flex-col");
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: FAIL with "StepperList not defined"

- [ ] **Step 3: Implement StepperList, StepperItem, and StepperSeparator**
  Append code to `packages/ui/src/components/stepper.tsx`:
  
  ```tsx
  export interface StepperListProps extends React.HTMLAttributes<HTMLDivElement> {}

  export const StepperList = React.forwardRef<HTMLDivElement, StepperListProps>(
    ({ className, children, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      if (!ctx) throw new Error("StepperList must be used within a Stepper");

      return (
        <div
          ref={ref}
          role="tablist"
          aria-orientation={ctx.orientation}
          className={cn(
            ctx.orientation === "horizontal"
              ? "flex items-center justify-between w-full relative gap-4"
              : "flex flex-col items-start gap-6 relative w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }
  );
  StepperList.displayName = "StepperList";

  export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    disabled?: boolean;
  }

  export const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
    ({ value, disabled = false, className, children, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      if (!ctx) throw new Error("StepperItem must be used within a Stepper");

      React.useEffect(() => {
        ctx.registerStep(value);
        return () => ctx.unregisterStep(value);
      }, [value, ctx.registerStep, ctx.unregisterStep]);

      const isLast = ctx.steps[ctx.steps.length - 1] === value;

      return (
        <StepperItemContext.Provider value={{ value, disabled, isLast }}>
          <div
            ref={ref}
            className={cn(
              "group relative flex items-center gap-3 z-10",
              ctx.orientation === "vertical" ? "flex items-start w-full" : "bg-zinc-950 px-2",
              className
            )}
            {...props}
          >
            {children}
          </div>
        </StepperItemContext.Provider>
      );
    }
  );
  StepperItem.displayName = "StepperItem";

  export interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

  export const StepperSeparator = React.forwardRef<HTMLDivElement, StepperSeparatorProps>(
    ({ className, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      if (!ctx) throw new Error("StepperSeparator must be used within a Stepper");

      return (
        <div
          ref={ref}
          className={cn(
            ctx.orientation === "horizontal"
              ? "flex-1 h-[2px] bg-zinc-800 transition-all duration-300"
              : "w-[2px] bg-zinc-800 absolute left-[17px] top-8 bottom-0 -ml-px z-0",
            className
          )}
          {...props}
        />
      );
    }
  );
  StepperSeparator.displayName = "StepperSeparator";
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add packages/ui/src/components/stepper.tsx packages/ui/src/components/stepper.test.tsx
  git commit -m "feat(ui): add StepperList, StepperItem, and StepperSeparator primitives"
  ```

---

### Task 4: Interactive Navigation & Headers

**Files:**
- Modify: `packages/ui/src/components/stepper.tsx` (Trigger, Indicator, Labels)
- Modify: `packages/ui/src/components/stepper.test.tsx` (Validation & keyboard interactions)

- [ ] **Step 1: Write test for interactive linear vs non-linear locks and Arrow key controls**
  Add tests inside `packages/ui/src/components/stepper.test.tsx`:
  
  ```tsx
  import { fireEvent } from "@testing-library/react";
  import { StepperTrigger, StepperIndicator, StepperTitle } from "./stepper";

  describe("Stepper Interaction validation", () => {
    it("should prevent clicking future steps in linear mode", () => {
      const handleChange = vi.fn();
      render(
        <Stepper value={0} onValueChange={handleChange} linear={true}>
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger data-testid="t-0"><StepperIndicator /></StepperItem>
            </StepperItem>
            <StepperItem value={1}>
              <StepperTrigger data-testid="t-1"><StepperIndicator /></StepperItem>
            </StepperItem>
          </StepperList>
        </Stepper>
      );
      
      fireEvent.click(screen.getByTestId("t-1"));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("should allow clicking future steps in non-linear mode", () => {
      const handleChange = vi.fn();
      render(
        <Stepper value={0} onValueChange={handleChange} linear={false}>
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger data-testid="t-0"><StepperIndicator /></StepperItem>
            </StepperItem>
            <StepperItem value={1}>
              <StepperTrigger data-testid="t-1"><StepperIndicator /></StepperItem>
            </StepperItem>
          </StepperList>
        </Stepper>
      );

      fireEvent.click(screen.getByTestId("t-1"));
      expect(handleChange).toHaveBeenCalledWith(1);
    });

    it("should handle keyboard navigation using arrows", () => {
      const handleChange = vi.fn();
      render(
        <Stepper value={0} onValueChange={handleChange} linear={false}>
          <StepperList>
            <StepperItem value={0}>
              <StepperTrigger data-testid="t-0"><StepperIndicator /></StepperItem>
            </StepperItem>
            <StepperItem value={1}>
              <StepperTrigger data-testid="t-1"><StepperIndicator /></StepperItem>
            </StepperItem>
          </StepperList>
        </Stepper>
      );

      const firstTrigger = screen.getByTestId("t-0");
      firstTrigger.focus();
      fireEvent.keyDown(firstTrigger, { key: "ArrowRight" });
      
      // Focus should jump to step 1 trigger
      expect(document.activeElement).toBe(screen.getByTestId("t-1"));
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: FAIL with "StepperTrigger not defined"

- [ ] **Step 3: Implement Trigger, Indicator, Title, and Description**
  Append code to `packages/ui/src/components/stepper.tsx`:
  
  ```tsx
  export interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

  export const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
    ({ className, children, onClick, onKeyDown, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      const itemCtx = React.useContext(StepperItemContext);
      
      if (!ctx || !itemCtx) {
        throw new Error("StepperTrigger must be used within a StepperItem inside a Stepper");
      }

      const isCompleted = ctx.completedSteps.includes(itemCtx.value) || itemCtx.value < ctx.activeStep;
      const isActive = ctx.activeStep === itemCtx.value;

      // In linear mode, user can click completed steps to go back, but not future uncompleted ones
      const isClickable = !ctx.linear || isCompleted || isActive;
      const disabled = itemCtx.disabled || !isClickable;

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        ctx.setStep(itemCtx.value);
        onClick?.(e);
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        
        const triggers = Array.from(
          e.currentTarget.closest('[role="tablist"]')?.querySelectorAll('[role="tab"]') || []
        ) as HTMLElement[];

        const currentIndex = triggers.indexOf(e.currentTarget);
        if (currentIndex === -1) return;

        let targetIndex = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          targetIndex = Math.min(currentIndex + 1, triggers.length - 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          targetIndex = Math.max(currentIndex - 1, 0);
        }

        if (targetIndex !== -1 && triggers[targetIndex]) {
          e.preventDefault();
          triggers[targetIndex].focus();
        }
      };

      return (
        <button
          ref={ref}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-disabled={disabled}
          tabIndex={isActive ? 0 : -1}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex items-center gap-3 bg-transparent border-0 p-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md disabled:cursor-not-allowed disabled:opacity-50",
            ctx.orientation === "vertical" ? "w-full" : "",
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }
  );
  StepperTrigger.displayName = "StepperTrigger";

  export interface StepperIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {}

  export const StepperIndicator = React.forwardRef<HTMLSpanElement, StepperIndicatorProps>(
    ({ className, children, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      const itemCtx = React.useContext(StepperItemContext);
      
      if (!ctx || !itemCtx) {
        throw new Error("StepperIndicator must be used within a StepperItem inside a Stepper");
      }

      const isCompleted = ctx.completedSteps.includes(itemCtx.value) || itemCtx.value < ctx.activeStep;
      const isActive = ctx.activeStep === itemCtx.value;

      return (
        <span
          ref={ref}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200",
            isCompleted
              ? "bg-teal-600 border-teal-600 text-white"
              : isActive
              ? "border-amber-500 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "border-zinc-700 text-zinc-400 bg-zinc-900/50",
            className
          )}
          {...props}
        >
          {children ?? (isCompleted ? "✓" : itemCtx.value + 1)}
        </span>
      );
    }
  );
  StepperIndicator.displayName = "StepperIndicator";

  export interface StepperTitleProps extends React.HTMLAttributes<HTMLSpanElement> {}

  export const StepperTitle = React.forwardRef<HTMLSpanElement, StepperTitleProps>(
    ({ className, ...props }, ref) => {
      const ctx = React.useContext(StepperContext);
      const itemCtx = React.useContext(StepperItemContext);
      
      if (!ctx || !itemCtx) {
        throw new Error("StepperTitle must be used within a StepperItem inside a Stepper");
      }

      const isActive = ctx.activeStep === itemCtx.value;

      return (
        <span
          ref={ref}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isActive ? "text-zinc-100 font-semibold" : "text-zinc-400",
            className
          )}
          {...props}
        />
      );
    }
  );
  StepperTitle.displayName = "StepperTitle";

  export interface StepperDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {}

  export const StepperDescription = React.forwardRef<HTMLSpanElement, StepperDescriptionProps>(
    ({ className, ...props }, ref) => {
      const itemCtx = React.useContext(StepperItemContext);
      if (!itemCtx) throw new Error("StepperDescription must be used within a StepperItem");

      return (
        <span
          ref={ref}
          className={cn("text-xs text-zinc-500 text-left block", className)}
          {...props}
        />
      );
    }
  );
  StepperDescription.displayName = "StepperDescription";
  ```

- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run packages/ui/src/components/stepper.test.tsx`
  Expected: PASS

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add packages/ui/src/components/stepper.tsx packages/ui/src/components/stepper.test.tsx
  git commit -m "feat(ui): add StepperTrigger, StepperIndicator, and Labels components with linear flow checks"
  ```

---

### Task 5: Exports and Storybook Stories

**Files:**
- Modify: `packages/ui/src/index.ts` (Export definitions)
- Create: `packages/ui/src/components/stepper.stories.tsx` (Component stories)

- [ ] **Step 1: Export stepper elements in barrel file**
  Add exports to `packages/ui/src/index.ts`:
  
  ```tsx
  export {
    Stepper,
    StepperList,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperTitle,
    StepperDescription,
    StepperSeparator,
    StepperContent,
    useStepper,
    type StepperProps,
    type StepperListProps,
    type StepperItemProps,
    type StepperTriggerProps,
    type StepperIndicatorProps,
    type StepperTitleProps,
    type StepperDescriptionProps,
    type StepperSeparatorProps,
    type StepperContentProps,
    type StepperOrientation,
    type UseStepperOptions,
    type UseStepperReturn,
  } from "./components/stepper";
  ```

- [ ] **Step 2: Create Storybook stories file**
  Write stories in `packages/ui/src/components/stepper.stories.tsx`:
  
  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import * as React from "react";
  import {
    Stepper,
    StepperList,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperTitle,
    StepperDescription,
    StepperSeparator,
    StepperContent,
    useStepper,
  } from "./stepper";
  import { Button } from "./button";

  const meta: Meta<typeof Stepper> = {
    title: "Components/Stepper",
    component: Stepper,
  };

  export default meta;
  type Story = StoryObj<typeof Stepper>;

  export const Horizontal: Story = {
    render: () => {
      const stepper = useStepper({ stepsCount: 3 });
      return (
        <div className="max-w-2xl mx-auto p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-100 space-y-6">
          <Stepper value={stepper.activeStep} onValueChange={stepper.setStep}>
            <StepperList>
              <StepperItem value={0}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Profile</StepperTitle>
                    <StepperDescription>User details</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
              <StepperSeparator />
              <StepperItem value={1}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Billing</StepperTitle>
                    <StepperDescription>Card info</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
              <StepperSeparator />
              <StepperItem value={2}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Review</StepperTitle>
                    <StepperDescription>Confirm</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
            </StepperList>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg min-h-[100px]">
              <StepperContent value={0}>
                <p>Step 1 Form Content: Please input username.</p>
              </StepperContent>
              <StepperContent value={1}>
                <p>Step 2 Form Content: Enter credit card details.</p>
              </StepperContent>
              <StepperContent value={2}>
                <p>Step 3 Form Content: Review and click Submit.</p>
              </StepperContent>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={stepper.prevStep} disabled={stepper.isFirstStep}>
                Back
              </Button>
              <Button onClick={stepper.isLastStep ? () => alert("Done") : stepper.nextStep}>
                {stepper.isLastStep ? "Submit" : "Next"}
              </Button>
            </div>
          </Stepper>
        </div>
      );
    },
  };

  export const Vertical: Story = {
    render: () => {
      const stepper = useStepper({ stepsCount: 3 });
      return (
        <div className="max-w-md mx-auto p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-100">
          <Stepper value={stepper.activeStep} onValueChange={stepper.setStep} orientation="vertical">
            <StepperList>
              <StepperItem value={0}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Account Details</StepperTitle>
                    <StepperDescription>Set credentials</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
              <StepperSeparator />
              <StepperItem value={1}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Address info</StepperTitle>
                    <StepperDescription>Delivery details</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
              <StepperSeparator />
              <StepperItem value={2}>
                <StepperTrigger>
                  <StepperIndicator />
                  <div className="flex flex-col">
                    <StepperTitle>Overview</StepperTitle>
                    <StepperDescription>Final details</StepperDescription>
                  </div>
                </StepperTrigger>
              </StepperItem>
            </StepperList>
          </Stepper>
        </div>
      );
    },
  };
  ```

- [ ] **Step 3: Run Storybook compile check**
  Run: `npm run build`
  Expected: Success without typecheck or module-resolution errors.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add packages/ui/src/index.ts packages/ui/src/components/stepper.stories.tsx
  git commit -m "feat(ui): export Stepper components and add Storybook configurations"
  ```

---

### Task 6: Gallery Showcase Integration

**Files:**
- Modify: `site/src/main.tsx` (Gallery page integration)
- Modify: `docs/BACKLOG.md` (Update backlog status)

- [ ] **Step 1: Verify where to add stepper in Main Gallery**
  Search `site/src/main.tsx` to find where the other components (e.g. `Timeline`, `Tabs`, `Accordion`) are listed in the gallery.

- [ ] **Step 2: Add Stepper wizard code showcase**
  Locate the tab contents sections or the components list. Add a new card/section displaying an interactive checkout form wizard built with the new compound `Stepper`.
  
  ```tsx
  // Insert Stepper showcase:
  <section className="space-y-4">
    <h2 className="text-xl font-bold text-zinc-100">Stepper / Wizard</h2>
    <p className="text-sm text-zinc-400">Compound steps wrapper with state management hook.</p>
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
      {/* Render horizontal interactive Stepper here */}
    </div>
  </section>
  ```

- [ ] **Step 3: Verify the whole monorepo builds and tests pass**
  Run: `npm run build && npm test`
  Expected: PASS

- [ ] **Step 4: Update backlog checklist**
  Change `- [ ] Stepper / Wizard` to `- [x] Stepper / Wizard` in `docs/BACKLOG.md`.

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add site/src/main.tsx docs/BACKLOG.md
  git commit -m "feat(site): showcase Stepper component in gallery and close backlog item"
  ```
