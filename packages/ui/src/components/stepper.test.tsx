import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useStepper } from "./stepper";
import {
  Stepper,
  StepperContent,
  StepperList,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
  StepperIndicator,
} from "./stepper";

afterEach(() => {
  cleanup();
});

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

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.activeStep).toBe(1);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);

    act(() => {
      result.current.nextStep();
    });
    expect(result.current.activeStep).toBe(2);
    expect(result.current.isLastStep).toBe(true);

    // Prevent overflow
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.activeStep).toBe(2);

    // Go back
    act(() => {
      result.current.prevStep();
    });
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

    act(() => {
      result.current.completeStep(0);
    });
    expect(result.current.completedSteps).toEqual([0]);

    act(() => {
      result.current.completeStep(1);
    });
    expect(result.current.completedSteps).toEqual([0, 1]);

    act(() => {
      result.current.uncompleteStep(0);
    });
    expect(result.current.completedSteps).toEqual([1]);

    act(() => {
      result.current.reset();
    });
    expect(result.current.activeStep).toBe(0);
    expect(result.current.completedSteps).toEqual([]);
  });

  it("should treat stepsCount 0 safely (clamp to 1)", () => {
    const { result } = renderHook(() => useStepper({ stepsCount: 0 }));
    expect(result.current.activeStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(true);
    act(() => {
      result.current.nextStep();
    });
    expect(result.current.activeStep).toBe(0); // clamped, not -1
  });

  it("should ignore out-of-range indices in completeStep", () => {
    const { result } = renderHook(() => useStepper({ stepsCount: 3 }));
    act(() => {
      result.current.completeStep(99);
    });
    expect(result.current.completedSteps).toEqual([]);
  });
});

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

  it("should throw an error if StepperContent is used outside Stepper", () => {
    expect(() => render(<StepperContent value={0}>Content</StepperContent>)).toThrow(
      "StepperContent must be used within a Stepper"
    );
  });
});

describe("Stepper Layout Primitives", () => {
  it("applies responsive orientation classes when responsive prop is true", () => {
    render(
      <Stepper orientation="horizontal" responsive>
        <StepperList data-testid="stepper-list">
          <StepperItem value={0}>Step 1</StepperItem>
        </StepperList>
      </Stepper>
    );
    const list = screen.getByTestId("stepper-list");
    expect(list.className).toContain("flex-col");
    expect(list.className).toContain("sm:flex-row");
  });

  it("should render lists with correct layout orientations", () => {
    const { rerender } = render(
      <Stepper orientation="horizontal" responsive={false}>
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

describe("Stepper Interaction validation", () => {
  it("should prevent clicking future steps in linear mode", () => {
    const handleChange = vi.fn();
    render(
      <Stepper value={0} onValueChange={handleChange} linear={true}>
        <StepperList>
          <StepperItem value={0}>
            <StepperTrigger data-testid="t-0">
              <StepperIndicator />
            </StepperTrigger>
          </StepperItem>
          <StepperItem value={1}>
            <StepperTrigger data-testid="t-1">
              <StepperIndicator />
            </StepperTrigger>
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
            <StepperTrigger data-testid="t-0">
              <StepperIndicator />
            </StepperTrigger>
          </StepperItem>
          <StepperItem value={1}>
            <StepperTrigger data-testid="t-1">
              <StepperIndicator />
            </StepperTrigger>
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
            <StepperTrigger data-testid="t-0">
              <StepperIndicator />
            </StepperTrigger>
          </StepperItem>
          <StepperItem value={1}>
            <StepperTrigger data-testid="t-1">
              <StepperIndicator />
            </StepperTrigger>
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
