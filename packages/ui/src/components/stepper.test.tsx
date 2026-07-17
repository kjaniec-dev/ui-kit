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

  it("should treat stepsCount 0 safely (clamp to 1)", () => {
    const { result } = renderHook(() => useStepper({ stepsCount: 0 }));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(true);
    act(() => { result.current.nextStep(); });
    expect(result.current.activeStep).toBe(0); // clamped, not -1
  });

  it("should ignore out-of-range indices in completeStep", () => {
    const { result } = renderHook(() => useStepper({ stepsCount: 3 }));
    act(() => { result.current.completeStep(99); });
    expect(result.current.completedSteps).toEqual([]);
  });
});
