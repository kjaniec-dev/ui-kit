import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShortcutsDialog } from "./shortcuts-dialog";

describe("ShortcutsDialog", () => {
  it("does not render content when open is false", () => {
    render(<ShortcutsDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("renders shortcuts when open is true", () => {
    render(<ShortcutsDialog open={true} onClose={vi.fn()} />);
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Actions & Theme")).toBeInTheDocument();
    expect(screen.getByText("Global Command Palette search")).toBeInTheDocument();
    expect(screen.getByText("Toggle Dark / Light color scheme")).toBeInTheDocument();
  });

  it("calls onClose when 'Got it' button is clicked", () => {
    const onClose = vi.fn();
    render(<ShortcutsDialog open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /Got it/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
