import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Drawer } from "./drawer";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("Drawer", () => {
  describe("aria wiring", () => {
    it("labels the dialog by its title and describes it by its description", () => {
      render(
        <Drawer open onClose={() => {}} title="Filters" description="Refine results">
          <button>Apply</button>
        </Drawer>
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAccessibleName("Filters");
      expect(dialog).toHaveAccessibleDescription("Refine results");
    });

    it('falls back to a "Drawer" label when no title is given', () => {
      render(
        <Drawer open onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      expect(screen.getByRole("dialog")).toHaveAccessibleName("Drawer");
    });
  });

  describe("closing", () => {
    it("calls onClose on Escape", () => {
      const onClose = vi.fn();
      render(
        <Drawer open onClose={onClose}>
          <button>Apply</button>
        </Drawer>
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop is clicked", () => {
      const onClose = vi.fn();
      render(
        <Drawer open onClose={onClose}>
          <button>Apply</button>
        </Drawer>
      );
      const backdrop = screen.getByRole("dialog").parentElement!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose when clicking inside the panel", () => {
      const onClose = vi.fn();
      render(
        <Drawer open onClose={onClose}>
          <button>Apply</button>
        </Drawer>
      );
      fireEvent.click(screen.getByRole("dialog"));
      fireEvent.click(screen.getByRole("button", { name: "Apply" }));
      expect(onClose).not.toHaveBeenCalled();
    });

    it("calls onClose from the header close button", () => {
      const onClose = vi.fn();
      render(
        <Drawer open onClose={onClose} title="Filters">
          <button>Apply</button>
        </Drawer>
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders no header (and no close button) without a title or description", () => {
      render(
        <Drawer open onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });
  });

  describe("scroll lock", () => {
    it("locks body scroll while open and restores it on close", () => {
      const { rerender } = render(
        <Drawer open onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      expect(document.body.style.overflow).toBe("hidden");
      rerender(
        <Drawer open={false} onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("side variants", () => {
    it("anchors to the right and slides in from the right edge by default", () => {
      render(
        <Drawer open onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      const panel = screen.getByRole("dialog");
      expect(panel.className).toContain("right-0");
      expect(panel.className).toContain("border-l");
      expect(panel.className).toContain("translate-x-0");
    });

    it("anchors to the left when side='left'", () => {
      render(
        <Drawer open onClose={() => {}} side="left">
          <button>Apply</button>
        </Drawer>
      );
      const panel = screen.getByRole("dialog");
      expect(panel.className).toContain("left-0");
      expect(panel.className).toContain("border-r");
      expect(panel.className).toContain("translate-x-0");
    });

    it("is translated off-screen to the right when closed", () => {
      render(
        <Drawer open={false} onClose={() => {}}>
          <button>Apply</button>
        </Drawer>
      );
      expect(screen.getByRole("dialog").className).toContain("translate-x-full");
    });
  });

  describe("focus trap", () => {
    function TrapDrawer() {
      return (
        <Drawer open onClose={() => {}}>
          <button>First</button>
          <button>Last</button>
        </Drawer>
      );
    }

    it("wraps focus from the last focusable back to the first on Tab", () => {
      render(<TrapDrawer />);
      screen.getByRole("button", { name: "Last" }).focus();
      fireEvent.keyDown(document, { key: "Tab" });
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "First" }));
    });

    it("wraps focus from the first focusable to the last on Shift+Tab", () => {
      render(<TrapDrawer />);
      screen.getByRole("button", { name: "First" }).focus();
      fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Last" }));
    });
  });

  describe("focus restore", () => {
    function Harness() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open drawer</button>
          <Drawer open={open} onClose={() => setOpen(false)}>
            <button>Inside</button>
          </Drawer>
        </>
      );
    }

    it("restores focus to the opener after closing", () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const opener = screen.getByRole("button", { name: "Open drawer" });
        opener.focus();
        fireEvent.click(opener);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(document.activeElement).toBe(opener);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
