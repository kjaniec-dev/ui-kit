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
