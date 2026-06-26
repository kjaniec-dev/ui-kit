import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomSheet } from "./bottom-sheet";

describe("BottomSheet", () => {
  it("renders children when open", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet Content")).toBeNull();
  });

  it("calls onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    window.dispatchEvent(event);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scrolling when open, and restores it when closed/unmounted", () => {
    const { unmount } = render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
