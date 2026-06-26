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

  it("applies correct visibility classes when open vs closed", () => {
    const { rerender } = render(
      <BottomSheet open={true} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    const backdrop = screen.getByRole("presentation");
    const dialog = screen.getByRole("dialog");

    // Open states
    expect(backdrop).toHaveClass("opacity-100");
    expect(backdrop).toHaveClass("pointer-events-auto");
    expect(dialog).toHaveClass("translate-y-0");
    expect(dialog).toHaveClass("sm:scale-100");

    // Closed states
    rerender(
      <BottomSheet open={false} onClose={() => {}}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    expect(backdrop).toHaveClass("opacity-0");
    expect(backdrop).toHaveClass("pointer-events-none");
    expect(dialog).toHaveClass("translate-y-full");
    expect(dialog).toHaveClass("sm:scale-95");
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

  it("closes when the backdrop overlay is clicked", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    const backdrop = screen.getByRole("presentation");
    backdrop.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders a close button and triggers onClose when clicked", () => {
    const handleClose = vi.fn();
    render(
      <BottomSheet open={true} onClose={handleClose}>
        <div>Sheet Content</div>
      </BottomSheet>
    );

    const closeBtn = screen.getByRole("button", { name: /close/i });
    expect(closeBtn).toBeInTheDocument();
    closeBtn.click();
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("traps focus within the BottomSheet when open", async () => {
    const trigger = document.createElement("button");
    trigger.id = "trigger-id";
    document.body.appendChild(trigger);
    trigger.focus();

    const { getByRole } = render(
      <BottomSheet open={true} onClose={() => {}} showClose={false}>
        <BottomSheetContent>
          <button id="first-btn">First</button>
          <button id="second-btn">Second</button>
        </BottomSheetContent>
      </BottomSheet>
    );

    const dialog = getByRole("dialog");
    const firstBtn = document.getElementById("first-btn") as HTMLButtonElement;
    const secondBtn = document.getElementById("second-btn") as HTMLButtonElement;

    // Wait for the initial focus to settle inside the bottom sheet
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(document.activeElement).toBe(firstBtn);

    secondBtn.focus();
    expect(document.activeElement).toBe(secondBtn);

    const tabEvent = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    dialog.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(firstBtn);

    firstBtn.focus();
    const shiftTabEvent = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true });
    dialog.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(secondBtn);

    document.body.removeChild(trigger);
  });

  it("restores focus to the last active element when closed", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { rerender } = render(
      <BottomSheet open={true} onClose={() => {}} showClose={false}>
        <BottomSheetContent>
          <button id="first-btn">First</button>
        </BottomSheetContent>
      </BottomSheet>
    );

    await new Promise((resolve) => setTimeout(resolve, 60));
    const firstBtn = document.getElementById("first-btn");
    expect(document.activeElement).toBe(firstBtn);

    rerender(
      <BottomSheet open={false} onClose={() => {}} showClose={false}>
        <BottomSheetContent>
          <button id="first-btn">First</button>
        </BottomSheetContent>
      </BottomSheet>
    );

    expect(document.activeElement).toBe(trigger);

    document.body.removeChild(trigger);
  });
});
