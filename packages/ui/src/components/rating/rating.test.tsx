import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Rating } from "./rating";


describe("Rating Primitive", () => {
  it("renders default rating with correct ARIA attributes", () => {
    render(<Rating value={3} max={5} aria-label="Product rating" />);
    const slider = screen.getByRole("slider", { name: "Product rating" });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuenow", "3");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
  });

  it("handles click selection", () => {
    const onChange = vi.fn();
    render(<Rating defaultValue={0} onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByTestId("rating-star");
    expect(stars.length).toBe(5);

    // Click 4th star
    fireEvent.click(stars[3]);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("handles keyboard navigation (ArrowRight, ArrowLeft, Home, End)", () => {
    const onChange = vi.fn();
    render(<Rating value={2} precision={1} onChange={onChange} aria-label="Rating" />);
    const slider = screen.getByRole("slider");

    // ArrowRight -> increment to 3
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(3);

    // ArrowLeft -> decrement to 1
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(1);

    // Home -> reset to 0
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(0);

    // End -> set to max (5)
    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("resets value when clicking current value if allowClear is true", () => {
    const onChange = vi.fn();
    render(<Rating value={3} allowClear onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByTestId("rating-star");

    // Click 3rd star (current value)
    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does not reset value when clicking current value if allowClear is false", () => {
    const onChange = vi.fn();
    render(<Rating value={3} allowClear={false} onChange={onChange} aria-label="Rating" />);
    const stars = screen.getAllByTestId("rating-star");

    fireEvent.click(stars[2]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("respects disabled state and ignores interactions", () => {
    const onChange = vi.fn();
    render(<Rating value={2} disabled onChange={onChange} aria-label="Rating" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");

    const stars = screen.getAllByTestId("rating-star");
    fireEvent.click(stars[3]);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("respects readOnly state and ignores interactions", () => {
    const onChange = vi.fn();
    render(<Rating value={2} readOnly onChange={onChange} aria-label="Rating" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-readonly", "true");

    const stars = screen.getAllByTestId("rating-star");
    fireEvent.click(stars[3]);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
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
    const stars = screen.getAllByTestId("rating-star");

    fireEvent.mouseEnter(stars[3]); // hover over 4th star
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "4");

    fireEvent.mouseLeave(slider);
    expect(slider).toHaveAttribute("aria-valuenow", "2");
  });
});
