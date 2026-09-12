import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Slider, sliderThumbCSS } from "./slider";

describe("Slider", () => {
  describe("rendering and attributes", () => {
    it("renders an input element of type range with role slider", () => {
      render(<Slider aria-label="Volume" />);
      const slider = screen.getByRole("slider", { name: "Volume" });
      expect(slider).toBeInTheDocument();
      expect(slider.tagName).toBe("INPUT");
      expect(slider).toHaveAttribute("type", "range");
    });

    it("has default min 0 and max 100", () => {
      render(<Slider aria-label="Default range" />);
      const slider = screen.getByRole("slider", { name: "Default range" });
      expect(slider).toHaveAttribute("min", "0");
      expect(slider).toHaveAttribute("max", "100");
    });

    it("applies default kit slider classes", () => {
      render(<Slider aria-label="Styled range" />);
      const slider = screen.getByRole("slider", { name: "Styled range" });
      expect(slider).toHaveClass(
        "kj-slider",
        "w-full",
        "h-1.5",
        "rounded-full",
        "appearance-none",
        "cursor-pointer",
        "accent-primary"
      );
    });

    it("merges custom className with default classes", () => {
      render(<Slider aria-label="Custom class" className="custom-slider-class" />);
      const slider = screen.getByRole("slider", { name: "Custom class" });
      expect(slider).toHaveClass("custom-slider-class");
      expect(slider).toHaveClass("kj-slider");
    });

    it("forwards ref to the HTMLInputElement", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Slider ref={ref} aria-label="Ref test" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("range");
    });

    it("supports standard HTML input attributes like step, disabled, name, id", () => {
      render(
        <Slider
          id="brightness-slider"
          name="brightness"
          step={5}
          disabled
          aria-label="Brightness"
        />
      );
      const slider = screen.getByRole("slider", { name: "Brightness" });
      expect(slider).toHaveAttribute("id", "brightness-slider");
      expect(slider).toHaveAttribute("name", "brightness");
      expect(slider).toHaveAttribute("step", "5");
      expect(slider).toBeDisabled();
    });
  });

  describe("linear gradient background calculation", () => {
    it("defaults to 50% when neither value nor defaultValue is provided", () => {
      render(<Slider aria-label="Default value" />);
      const slider = screen.getByRole("slider", { name: "Default value" });
      expect(slider.style.background).toContain("50%");
      expect(slider.style.background).toBe(
        "linear-gradient(to right, var(--kj-primary) 50%, var(--kj-border, rgba(120, 120, 128, 0.2)) 50%)"
      );
    });

    it("calculates percentage correctly based on defaultValue", () => {
      render(<Slider defaultValue={25} aria-label="Quarter value" />);
      const slider = screen.getByRole("slider", { name: "Quarter value" });
      expect(slider.style.background).toContain("25%");
    });

    it("correctly treats 0 as a valid defaultValue and value without falling back to 50", () => {
      render(<Slider defaultValue={0} aria-label="Zero default" />);
      const slider = screen.getByRole("slider", { name: "Zero default" });
      expect(slider.style.background).toContain("0%");
    });

    it("calculates percentage based on custom min and max", () => {
      // min=20, max=80, defaultValue=50 -> (50-20)/(80-20) * 100 = 30/60 * 100 = 50%
      render(<Slider min={20} max={80} defaultValue={50} aria-label="Custom range" />);
      const slider = screen.getByRole("slider", { name: "Custom range" });
      expect(slider.style.background).toContain("50%");
    });

    it("calculates percentage when min and max are strings", () => {
      // min="0", max="200", defaultValue="50" -> 50/200 * 100 = 25%
      render(<Slider min="0" max="200" defaultValue="50" aria-label="String min max" />);
      const slider = screen.getByRole("slider", { name: "String min max" });
      expect(slider.style.background).toContain("25%");
    });

    it("clamps percentage between 0% and 100%", () => {
      const { rerender } = render(
        <Slider min={0} max={100} value={-20} onChange={() => {}} aria-label="Underflow" />
      );
      let slider = screen.getByRole("slider", { name: "Underflow" });
      expect(slider.style.background).toContain("0%");

      rerender(
        <Slider min={0} max={100} value={150} onChange={() => {}} aria-label="Overflow" />
      );
      slider = screen.getByRole("slider", { name: "Overflow" });
      expect(slider.style.background).toContain("100%");
    });

    it("merges custom style props with background style", () => {
      render(
        <Slider
          defaultValue={40}
          style={{ opacity: 0.9, marginTop: "10px" }}
          aria-label="Custom style"
        />
      );
      const slider = screen.getByRole("slider", { name: "Custom style" });
      expect(slider.style.background).toContain("40%");
      expect(slider.style.opacity).toBe("0.9");
      expect(slider.style.marginTop).toBe("10px");
    });
  });

  describe("uncontrolled mode", () => {
    it("updates background and calls onChange when slider changes", () => {
      const handleChange = vi.fn();
      render(<Slider defaultValue={10} onChange={handleChange} aria-label="Uncontrolled" />);
      const slider = screen.getByRole("slider", { name: "Uncontrolled" });

      expect(slider.style.background).toContain("10%");

      fireEvent.change(slider, { target: { value: "75" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(slider.style.background).toContain("75%");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled value and updates when prop changes", () => {
      const { rerender } = render(
        <Slider value={30} onChange={() => {}} aria-label="Controlled" />
      );
      const slider = screen.getByRole("slider", { name: "Controlled" });
      expect(slider).toHaveValue("30");
      expect(slider.style.background).toContain("30%");

      rerender(<Slider value={80} onChange={() => {}} aria-label="Controlled" />);
      expect(slider).toHaveValue("80");
      expect(slider.style.background).toContain("80%");

      rerender(<Slider value={0} onChange={() => {}} aria-label="Controlled" />);
      expect(slider).toHaveValue("0");
      expect(slider.style.background).toContain("0%");
    });

    it("calls onChange when user interacts in controlled mode without altering local value", () => {
      const handleChange = vi.fn();
      render(<Slider value={50} onChange={handleChange} aria-label="Controlled change" />);
      const slider = screen.getByRole("slider", { name: "Controlled change" });

      fireEvent.change(slider, { target: { value: "65" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
      // Value should remain 50% until parent passes updated prop
      expect(slider.style.background).toContain("50%");
    });
  });
});

describe("sliderThumbCSS", () => {
  it("contains webkit and moz thumb styles with primary kit variables", () => {
    expect(sliderThumbCSS).toContain(".kj-slider::-webkit-slider-thumb");
    expect(sliderThumbCSS).toContain(".kj-slider::-moz-range-thumb");
    expect(sliderThumbCSS).toContain("var(--kj-primary)");
    expect(sliderThumbCSS).toContain("var(--kj-surface)");
    expect(sliderThumbCSS).toContain("var(--kj-shadow-sm)");
  });
});
