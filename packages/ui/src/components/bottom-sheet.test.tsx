import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetContent,
  BottomSheetFooter,
} from "./bottom-sheet";

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

  it("has correct accessibility attributes and matches title/description IDs", () => {
    render(
      <BottomSheet open={true} onClose={() => {}}>
        <BottomSheetHeader>
          <BottomSheetTitle>Test Title</BottomSheetTitle>
          <BottomSheetDescription>Test Description</BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetContent>Test Content</BottomSheetContent>
        <BottomSheetFooter>Test Footer</BottomSheetFooter>
      </BottomSheet>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const title = screen.getByText("Test Title");
    const description = screen.getByText("Test Description");

    expect(dialog).toHaveAttribute("aria-labelledby", title.id);
    expect(dialog).toHaveAttribute("aria-describedby", description.id);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByText("Test Footer")).toBeInTheDocument();
  });
});
