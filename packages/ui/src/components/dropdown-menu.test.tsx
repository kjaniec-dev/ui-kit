import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";

function Menu({
  onEdit = () => {},
  align,
}: {
  onEdit?: () => void;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const trigger = () => screen.getByRole("button", { name: "Actions" });

describe("DropdownMenu", () => {
  describe("open / close", () => {
    it("is closed initially and renders no menu", () => {
      render(<Menu />);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
      expect(trigger()).toHaveAttribute("aria-expanded", "false");
    });

    it("opens on trigger click and reflects aria-expanded", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(trigger()).toHaveAttribute("aria-expanded", "true");
    });

    it("toggles closed on a second trigger click", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      fireEvent.click(trigger());
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on outside mousedown", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on Escape", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("item selection", () => {
    it("fires the item handler and closes the menu on select", () => {
      const onEdit = vi.fn();
      render(<Menu onEdit={onEdit} />);
      fireEvent.click(trigger());
      fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("moves focus to the next item on ArrowDown and wraps at the end", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      const menu = screen.getByRole("menu");
      const edit = screen.getByRole("menuitem", { name: "Edit" });
      const del = screen.getByRole("menuitem", { name: "Delete" });

      edit.focus();
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(document.activeElement).toBe(del);

      // wraps back to the first item
      fireEvent.keyDown(menu, { key: "ArrowDown" });
      expect(document.activeElement).toBe(edit);
    });

    it("moves focus to the previous item on ArrowUp and wraps at the start", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      const menu = screen.getByRole("menu");
      const edit = screen.getByRole("menuitem", { name: "Edit" });
      const del = screen.getByRole("menuitem", { name: "Delete" });

      edit.focus();
      fireEvent.keyDown(menu, { key: "ArrowUp" });
      expect(document.activeElement).toBe(del);
    });

    it("closes when Tab is pressed inside the menu", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("aligns to the left edge by default and the right edge for align='end'", () => {
      const { rerender } = render(<Menu align="start" />);
      fireEvent.click(trigger());
      expect(screen.getByRole("menu").className).toContain("left-0");

      rerender(<Menu align="end" />);
      // rerender keeps the open state; re-open if needed
      if (!screen.queryByRole("menu")) fireEvent.click(trigger());
      expect(screen.getByRole("menu").className).toContain("right-0");
    });

    it("renders a separator with the separator role", () => {
      render(<Menu />);
      fireEvent.click(trigger());
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });

  describe("asChild trigger", () => {
    it("projects menu aria attributes onto a custom trigger element", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>Custom</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
      const custom = screen.getByRole("button", { name: "Custom" });
      expect(custom).toHaveAttribute("aria-haspopup", "menu");
      expect(custom).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(custom);
      expect(custom).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });
  });
});
