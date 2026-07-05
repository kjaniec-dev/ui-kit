import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette, type CommandPaletteItem } from "./command-palette";

function makeItems(actions: Partial<Record<string, () => void>> = {}): CommandPaletteItem[] {
  return [
    { id: "new", title: "New File", category: "File", action: actions.new ?? (() => {}) },
    {
      id: "open",
      title: "Open File",
      subtitle: "from disk",
      category: "File",
      action: actions.open ?? (() => {}),
    },
    { id: "settings", title: "Settings", category: "App", action: actions.settings ?? (() => {}) },
  ];
}

function renderPalette(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  return render(
    <CommandPalette open onClose={() => {}} items={makeItems()} {...props} />
  );
}

const input = () => screen.getByRole("combobox");
const selectedOption = () => screen.getByRole("option", { selected: true });

afterEach(() => {
  document.body.style.overflow = "";
});

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    render(<CommandPalette open={false} onClose={() => {}} items={makeItems()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a search combobox and one option per item when open", () => {
    renderPalette();
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(input()).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects the first item by default", () => {
    renderPalette();
    expect(selectedOption()).toHaveTextContent("New File");
    expect(input()).toHaveAttribute("aria-activedescendant", "cmd-item-0");
  });

  it("groups items by category", () => {
    renderPalette();
    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(2); // File, App
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("App")).toBeInTheDocument();
  });

  describe("filtering", () => {
    it("filters by title, case-insensitively", () => {
      renderPalette();
      fireEvent.change(input(), { target: { value: "OPEN" } });
      expect(screen.getAllByRole("option")).toHaveLength(1);
      expect(screen.getByRole("option")).toHaveTextContent("Open File");
    });

    it("filters by subtitle", () => {
      renderPalette();
      fireEvent.change(input(), { target: { value: "disk" } });
      expect(screen.getAllByRole("option")).toHaveLength(1);
      expect(screen.getByRole("option")).toHaveTextContent("Open File");
    });

    it("filters by category", () => {
      renderPalette();
      fireEvent.change(input(), { target: { value: "App" } });
      expect(screen.getAllByRole("option")).toHaveLength(1);
      expect(screen.getByRole("option")).toHaveTextContent("Settings");
    });

    it("shows an empty state when nothing matches", () => {
      renderPalette();
      fireEvent.change(input(), { target: { value: "zzz" } });
      expect(screen.queryAllByRole("option")).toHaveLength(0);
      expect(screen.getByText(/No results found for "zzz"/)).toBeInTheDocument();
    });

    it("resets the active item to the first match after filtering", () => {
      renderPalette();
      fireEvent.keyDown(document, { key: "ArrowDown" });
      expect(input()).toHaveAttribute("aria-activedescendant", "cmd-item-1");
      fireEvent.change(input(), { target: { value: "File" } });
      expect(input()).toHaveAttribute("aria-activedescendant", "cmd-item-0");
    });
  });

  describe("keyboard navigation", () => {
    it("moves the selection down and wraps to the top", () => {
      renderPalette();
      fireEvent.keyDown(document, { key: "ArrowDown" });
      expect(selectedOption()).toHaveTextContent("Open File");
      fireEvent.keyDown(document, { key: "ArrowDown" });
      expect(selectedOption()).toHaveTextContent("Settings");
      fireEvent.keyDown(document, { key: "ArrowDown" });
      expect(selectedOption()).toHaveTextContent("New File");
    });

    it("moves the selection up and wraps to the bottom", () => {
      renderPalette();
      fireEvent.keyDown(document, { key: "ArrowUp" });
      expect(selectedOption()).toHaveTextContent("Settings");
    });

    it("runs the active item's action and closes on Enter", () => {
      const settings = vi.fn();
      const onClose = vi.fn();
      renderPalette({ items: makeItems({ settings }), onClose });
      fireEvent.keyDown(document, { key: "ArrowUp" }); // wraps to Settings
      fireEvent.keyDown(document, { key: "Enter" });
      expect(settings).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape without running any action", () => {
      const onClose = vi.fn();
      const newFile = vi.fn();
      renderPalette({ items: makeItems({ new: newFile }), onClose });
      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(newFile).not.toHaveBeenCalled();
    });
  });

  describe("pointer selection", () => {
    it("runs the item's action and closes when an option is clicked", () => {
      const open = vi.fn();
      const onClose = vi.fn();
      renderPalette({ items: makeItems({ open }), onClose });
      fireEvent.click(screen.getByText("Open File"));
      expect(open).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes when the backdrop is clicked", () => {
      const onClose = vi.fn();
      renderPalette({ onClose });
      const backdrop = screen.getByRole("dialog").parentElement!;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("scroll lock", () => {
    it("locks body scroll while open and restores it on close", () => {
      const { rerender } = render(
        <CommandPalette open onClose={() => {}} items={makeItems()} />
      );
      expect(document.body.style.overflow).toBe("hidden");
      rerender(<CommandPalette open={false} onClose={() => {}} items={makeItems()} />);
      expect(document.body.style.overflow).toBe("");
    });
  });
});
