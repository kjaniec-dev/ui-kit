import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

function UncontrolledPopover() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Panel body</PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("is closed initially and opens on trigger click", () => {
    render(<UncontrolledPopover />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Panel body");
  });

  it("sets aria attributes on the trigger", () => {
    render(<UncontrolledPopover />);
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on outside mousedown", () => {
    render(<UncontrolledPopover />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<UncontrolledPopover />);
    const trigger = screen.getByRole("button", { name: "Open" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("supports controlled mode without mutating its own state", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover open={true} onOpenChange={onOpenChange}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Panel body</PopoverContent>
      </Popover>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // still open — parent owns the state and did not update it
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("throws a clear error when parts are used outside <Popover>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<PopoverContent>orphan</PopoverContent>)).toThrow(
      "PopoverContent must be used inside <Popover>"
    );
    spy.mockRestore();
  });

  it("forces type=button and aria attributes, rejecting caller overrides", () => {
    render(
      <Popover>
        <PopoverTrigger
          type={"submit" as any}
          aria-haspopup={"menu" as any}
          aria-expanded={"true" as any}
        >
          Open
        </PopoverTrigger>
        <PopoverContent>Panel body</PopoverContent>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "Open" });

    // Before click: computed attributes must override caller props
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // After click: aria-expanded updates, panel appears
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toHaveTextContent("Panel body");
  });
});
