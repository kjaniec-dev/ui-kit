// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Rating } from "./rating";

afterEach(() => {
  cleanup();
});


describe("Rating Primitive", () => {
  it("renders default rating with correct ARIA attributes", () => {
    render(<Rating value={3} max={5} aria-label="Product rating" />);
    const group = screen.getByRole("radiogroup", { name: "Product rating" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-valuenow", "3");
    expect(group).toHaveAttribute("aria-valuemin", "0");
    expect(group).toHaveAttribute("aria-valuemax", "5");

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[2]).toHaveAttribute("aria-checked", "true");
    expect(radios[3]).toHaveAttribute("aria-checked", "false");
  });

  it("handles click selection", () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={0} onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByRole("radio");
    expect(stars.length).toBe(5);

    // Click 4th star
    fireEvent.click(stars[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("handles fractional precision (half-star) mouse clicks and hovers", () => {
    const onChange = vi.fn();
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetWidth"
    );
    const originalOffsetX = Object.getOwnPropertyDescriptor(
      MouseEvent.prototype,
      "offsetX"
    );
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      value: 40,
      configurable: true,
    });

    let currentOffsetX = 0;
    Object.defineProperty(MouseEvent.prototype, "offsetX", {
      get() {
        return currentOffsetX;
      },
      configurable: true,
    });

    try {
      render(
        <Rating
          defaultValue={0}
          precision={0.5}
          onChange={onChange}
          aria-label="Rating"
        />
      );
      let stars = screen.getAllByRole("radio");

      // Hover left-half -> 2.5
      currentOffsetX = 10;
      fireEvent.mouseMove(stars[2]);
      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-valuenow", "2.5");

      // Click left-half -> 2.5
      currentOffsetX = 10;
      fireEvent.click(stars[2]);
      expect(onChange).toHaveBeenCalledWith(2.5);

      // Re-query stars after state rerender
      stars = screen.getAllByRole("radio");

      // Click right-half -> 3
      currentOffsetX = 30;
      fireEvent.click(stars[2]);
      expect(onChange).toHaveBeenCalledWith(3);
    } finally {
      if (originalOffsetWidth) {
        Object.defineProperty(
          HTMLElement.prototype,
          "offsetWidth",
          originalOffsetWidth
        );
      } else {
        delete (HTMLElement.prototype as any).offsetWidth;
      }
      if (originalOffsetX) {
        Object.defineProperty(
          MouseEvent.prototype,
          "offsetX",
          originalOffsetX
        );
      } else {
        delete (MouseEvent.prototype as any).offsetX;
      }
    }
  });

  it("handles keyboard navigation (ArrowRight, ArrowLeft, Home, End)", () => {
    const onChange = vi.fn();
    render(<Rating value={2} precision={1} onChange={onChange} aria-label="Rating" />);
    const radiogroup = screen.getByRole("radiogroup");

    // ArrowRight -> increment to 3
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(3);

    // ArrowLeft -> decrement to 1
    fireEvent.keyDown(radiogroup, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(1);

    // Home -> reset to 0
    fireEvent.keyDown(radiogroup, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(0);

    // End -> set to max (5)
    fireEvent.keyDown(radiogroup, { key: "End" });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("resets value when clicking current value if allowClear is true", () => {
    const onChange = vi.fn();
    render(<Rating value={3} allowClear onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByRole("radio");

    // Click 3rd star (current value)
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does not reset value when clicking current value if allowClear is false", () => {
    const onChange = vi.fn();
    render(<Rating value={3} allowClear={false} onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByRole("radio");

    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("respects disabled state and ignores interactions", () => {
    const onChange = vi.fn();
    render(<Rating value={2} disabled onChange={onChange} aria-label="Rating" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-disabled", "true");

    const stars = screen.getAllByRole("radio");
    fireEvent.click(stars[3]);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("respects readOnly state and uses img role", () => {
    const onChange = vi.fn();
    render(<Rating value={2} readOnly onChange={onChange} aria-label="Rating" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("aria-readonly", "true");
    expect(screen.queryAllByRole("radio")).toHaveLength(0);

    const starBtns = screen.getAllByTestId("rating-star");
    fireEvent.click(starBtns[3]);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(img, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders custom icon component and built-in icon types", () => {
    const CustomHeart = ({ className }: { className?: string }) => (
      <span data-testid="custom-heart" className={className}>♥</span>
    );
    render(<Rating icon={CustomHeart} value={3} readOnly />);
    expect(screen.getAllByTestId("custom-heart")).toHaveLength(5);

    const { container } = render(<Rating icon="heart" value={3} readOnly />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute("d")).toContain("M19 14");
  });

  it("supports Tailwind CSS color and emptyColor classes", () => {
    const { container } = render(
      <Rating
        value={3}
        color="text-amber-400 fill-amber-400"
        emptyColor="text-slate-300 fill-slate-200"
        readOnly
      />
    );
    const paths = container.querySelectorAll("path");
    expect(paths[0]).toHaveClass("text-amber-400");
    expect(paths[3]).toHaveClass("text-slate-300");
  });

  it("renders precision gradient SVG fills for partial ratings", () => {
    const { container } = render(<Rating value={3.5} precision={0.5} aria-label="Rating" />);
    const gradients = container.querySelectorAll("linearGradient");
    expect(gradients.length).toBeGreaterThan(0);
    
    // Star 4 (index 3) should have a partial fill gradient (50%)
    const partialStop = container.querySelector("stop[offset='50%']");
    expect(partialStop).toBeInTheDocument();
  });

  it("renders size variants (sm, md, lg, xl)", () => {
    const { rerender, container } = render(<Rating value={3} size="sm" />);
    expect(container.firstChild).toHaveClass("kj-rating-sm");

    rerender(<Rating value={3} size="xl" />);
    expect(container.firstChild).toHaveClass("kj-rating-xl");
  });

  it("renders value and count badges when configured", () => {
    render(<Rating value={4.2} count={128} showValue showCount aria-label="Rating" />);
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("(128)")).toBeInTheDocument();
  });

  it("renders hidden form input when name prop is present", () => {
    render(<Rating name="user_rating" value={4} aria-label="Rating" />);
    const hiddenInput = document.querySelector('input[type="hidden"][name="user_rating"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveValue("4");
  });

  it("supports hover preview interaction", () => {
    render(<Rating value={2} hoverPreview aria-label="Rating" />);
    const stars = screen.getAllByRole("radio");

    fireEvent.mouseEnter(stars[3]); // hover over 4th star
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-valuenow", "4");

    fireEvent.mouseLeave(radiogroup);
    expect(radiogroup).toHaveAttribute("aria-valuenow", "2");
  });
});

