import * as React from "react";
import { cn } from "../lib/cn";

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
  const safeStepsCount = Math.max(1, stepsCount);
  const [activeStep, setActiveStep] = React.useState(initialStep);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  const setStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < safeStepsCount) {
        setActiveStep(step);
      }
    },
    [safeStepsCount]
  );

  const nextStep = React.useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, safeStepsCount - 1));
  }, [safeStepsCount]);

  const prevStep = React.useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const completeStep = React.useCallback(
    (step: number) => {
      setCompletedSteps((prev) => {
        if (step < 0 || step >= safeStepsCount) return prev; // ignore out-of-range
        if (prev.includes(step)) return prev;
        return [...prev, step].sort((a, b) => a - b);
      });
    },
    [safeStepsCount]
  );

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
    isLastStep: activeStep === safeStepsCount - 1,
  };
}

export type StepperOrientation = "horizontal" | "vertical";

interface StepperCtx {
  activeStep: number;
  orientation: StepperOrientation;
  responsive?: boolean;
  linear: boolean;
  setStep: (step: number) => void;
  completedSteps: number[];
  registerStep: (value: number) => void;
  unregisterStep: (value: number) => void;
  steps: number[];
}

const StepperContext = React.createContext<StepperCtx | null>(null);

interface StepperItemCtx {
  value: number;
  disabled: boolean;
  isLast: boolean;
}

const StepperItemContext = React.createContext<StepperItemCtx | null>(null);

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  responsive?: boolean;
  linear?: boolean;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      responsive = true,
      linear = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
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

    const setStep = React.useCallback(
      (step: number) => {
        if (!isControlled) {
          setLocalValue(step);
        }
        onValueChange?.(step);

        // Auto mark previous steps as completed in linear mode
        if (linear) {
          setCompletedSteps((prev) => {
            const priorSteps = steps.filter((s) => s < step);
            const nextCompleted = Array.from(new Set([...prev, ...priorSteps])).sort(
              (a, b) => a - b
            );
            return nextCompleted;
          });
        }
      },
      [isControlled, onValueChange, linear, steps]
    );

    const contextValue = React.useMemo(
      () => ({
        activeStep,
        orientation,
        responsive,
        linear,
        setStep,
        completedSteps,
        registerStep,
        unregisterStep,
        steps,
      }),
      [
        activeStep,
        orientation,
        responsive,
        linear,
        setStep,
        completedSteps,
        registerStep,
        unregisterStep,
        steps,
      ]
    );

    return (
      <StepperContext.Provider value={contextValue}>
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

export type StepperListProps = React.HTMLAttributes<HTMLDivElement>;

export const StepperList = React.forwardRef<HTMLDivElement, StepperListProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(StepperContext);
    if (!ctx) throw new Error("StepperList must be used within a Stepper");

    const isResponsiveHorizontal = ctx.orientation === "horizontal" && (ctx.responsive ?? true);

    const orientationClass = isResponsiveHorizontal
      ? "flex flex-col sm:flex-row items-start sm:items-center justify-between w-full relative gap-4"
      : ctx.orientation === "horizontal"
        ? "flex items-center justify-between w-full relative gap-4"
        : "flex flex-col items-start gap-6 relative w-full";

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={ctx.orientation}
        className={cn(orientationClass, className)}
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

    const { registerStep, unregisterStep } = ctx;

    React.useEffect(() => {
      registerStep(value);
      return () => unregisterStep(value);
    }, [value, registerStep, unregisterStep]);

    const isLast = ctx.steps[ctx.steps.length - 1] === value;
    const isResponsiveHorizontal = ctx.orientation === "horizontal" && (ctx.responsive ?? true);

    return (
      <StepperItemContext.Provider value={{ value, disabled, isLast }}>
        <div
          ref={ref}
          className={cn(
            "group relative flex items-center gap-3 z-10",
            ctx.orientation === "vertical"
              ? "flex items-start w-full"
              : isResponsiveHorizontal
                ? "w-full sm:w-auto items-start sm:items-center"
                : "",
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

export type StepperSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const StepperSeparator = React.forwardRef<HTMLDivElement, StepperSeparatorProps>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(StepperContext);
    if (!ctx) throw new Error("StepperSeparator must be used within a Stepper");

    const isResponsiveHorizontal = ctx.orientation === "horizontal" && (ctx.responsive ?? true);

    return (
      <div
        ref={ref}
        className={cn(
          isResponsiveHorizontal
            ? "hidden sm:block flex-1 h-[2px] bg-border transition-all duration-300"
            : ctx.orientation === "horizontal"
              ? "flex-1 h-[2px] bg-border transition-all duration-300"
              : "w-[2px] bg-border absolute left-[17px] top-8 bottom-0 -ml-px z-0",
          className
        )}
        {...props}
      />
    );
  }
);
StepperSeparator.displayName = "StepperSeparator";

export type StepperTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, children, onClick, onKeyDown, ...props }, ref) => {
    const ctx = React.useContext(StepperContext);
    const itemCtx = React.useContext(StepperItemContext);

    if (!ctx || !itemCtx) {
      throw new Error("StepperTrigger must be used within a StepperItem inside a Stepper");
    }

    const isCompleted =
      ctx.completedSteps.includes(itemCtx.value) || itemCtx.value < ctx.activeStep;
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
          "flex items-center gap-3 bg-transparent border-0 p-0 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md disabled:cursor-not-allowed disabled:opacity-50",
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

export type StepperIndicatorProps = React.HTMLAttributes<HTMLSpanElement>;

export const StepperIndicator = React.forwardRef<HTMLSpanElement, StepperIndicatorProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = React.useContext(StepperContext);
    const itemCtx = React.useContext(StepperItemContext);

    if (!ctx || !itemCtx) {
      throw new Error("StepperIndicator must be used within a StepperItem inside a Stepper");
    }

    const isCompleted =
      ctx.completedSteps.includes(itemCtx.value) || itemCtx.value < ctx.activeStep;
    const isActive = ctx.activeStep === itemCtx.value;

    return (
      <span
        ref={ref}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-200",
          isCompleted
            ? "bg-primary border-primary text-primary-foreground"
            : isActive
              ? "border-primary text-primary bg-primary/10 ring-2 ring-primary/20"
              : "border-border text-muted-foreground bg-muted/40",
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

export type StepperTitleProps = React.HTMLAttributes<HTMLSpanElement>;

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
          isActive ? "text-foreground font-semibold" : "text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
StepperTitle.displayName = "StepperTitle";

export type StepperDescriptionProps = React.HTMLAttributes<HTMLSpanElement>;

export const StepperDescription = React.forwardRef<HTMLSpanElement, StepperDescriptionProps>(
  ({ className, ...props }, ref) => {
    const itemCtx = React.useContext(StepperItemContext);
    if (!itemCtx) throw new Error("StepperDescription must be used within a StepperItem");

    return (
      <span
        ref={ref}
        className={cn("text-xs text-muted-foreground text-left block", className)}
        {...props}
      />
    );
  }
);
StepperDescription.displayName = "StepperDescription";
