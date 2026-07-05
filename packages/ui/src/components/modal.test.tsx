import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Modal, ModalTitle, ModalDescription } from "./modal";

function BasicModal(props: Partial<React.ComponentProps<typeof Modal>>) {
  return (
    <Modal open onClose={() => {}} {...props}>
      <ModalTitle>Delete item</ModalTitle>
      <ModalDescription>This cannot be undone.</ModalDescription>
      <button>Confirm</button>
    </Modal>
  );
}

afterEach(() => {
  document.body.style.overflow = "";
});

describe("Modal", () => {
  describe("aria wiring", () => {
    it("exposes a dialog labelled by its title and described by its description", () => {
      render(<BasicModal />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAccessibleName("Delete item");
      expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    });
  });

  describe("closing", () => {
    it("calls onClose on Escape", () => {
      const onClose = vi.fn();
      render(<BasicModal onClose={onClose} />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop is clicked", () => {
      const onClose = vi.fn();
      render(<BasicModal onClose={onClose} />);
      // the backdrop is the direct parent of the dialog panel (context provider adds no DOM node)
      const backdrop = screen.getByRole("dialog").parentElement!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside the panel", () => {
      const onClose = vi.fn();
      render(<BasicModal onClose={onClose} />);
      fireEvent.click(screen.getByRole("dialog"));
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose from the built-in close button", () => {
      const onClose = vi.fn();
      render(<BasicModal onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("omits the close button when showClose is false", () => {
      render(<BasicModal showClose={false} />);
      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });
  });

  describe("scroll lock", () => {
    it("locks body scroll while open and restores it on close", () => {
      const { rerender } = render(<BasicModal open />);
      expect(document.body.style.overflow).toBe("hidden");
      rerender(<BasicModal open={false} />);
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("focus trap", () => {
    function TrapModal() {
      return (
        <Modal open onClose={() => {}} showClose={false}>
          <button>First</button>
          <button>Last</button>
        </Modal>
      );
    }

    it("wraps focus from the last focusable back to the first on Tab", () => {
      render(<TrapModal />);
      const last = screen.getByRole("button", { name: "Last" });
      const first = screen.getByRole("button", { name: "First" });
      last.focus();
      fireEvent.keyDown(document, { key: "Tab" });
      expect(document.activeElement).toBe(first);
    });

    it("wraps focus from the first focusable to the last on Shift+Tab", () => {
      render(<TrapModal />);
      const first = screen.getByRole("button", { name: "First" });
      const last = screen.getByRole("button", { name: "Last" });
      first.focus();
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(last);
    });

    it("focuses the first focusable element after opening", () => {
      vi.useFakeTimers();
      try {
        render(<TrapModal />);
        act(() => {
          vi.advanceTimersByTime(60);
        });
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "First" }));
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("focus restore", () => {
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open modal</button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <ModalTitle>Panel</ModalTitle>
            <button>Inside</button>
          </Modal>
        </>
      );
    }

    it("restores focus to the opener after closing", () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const opener = screen.getByRole("button", { name: "Open modal" });
        opener.focus();
        fireEvent.click(opener);
        // close via Escape without letting the initial-focus timer move focus
        fireEvent.keyDown(document, { key: "Escape" });
        expect(document.activeElement).toBe(opener);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
