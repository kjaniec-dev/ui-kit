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

  const setStep = React.useCallback((step: number) => {
    if (step >= 0 && step < safeStepsCount) {
      setActiveStep(step);
    }
  }, [safeStepsCount]);

  const nextStep = React.useCallback(() => {
    setActiveStep((prev) => Math.min(prev + 1, safeStepsCount - 1));
  }, [safeStepsCount]);

  const prevStep = React.useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const completeStep = React.useCallback((step: number) => {
    setCompletedSteps((prev) => {
      if (step < 0 || step >= safeStepsCount) return prev; // ignore out-of-range
      if (prev.includes(step)) return prev;
      return [...prev, step].sort((a, b) => a - b);
    });
  }, [safeStepsCount]);

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
