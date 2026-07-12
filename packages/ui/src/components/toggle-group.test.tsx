import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleGroup } from "./toggle-group";

const options = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
] as const;

describe("ToggleGroup", () => {
  it("renders a group with the given aria-label", () => {
    render(<ToggleGroup options={options} value={[]} onChange={() => {}} aria-label="Text formatting" />);
    expect(screen.getByRole("group", { name: "Text formatting" })).toBeInTheDocument();
  });

  it("reflects value via aria-pressed on each button", () => {
    render(
      <ToggleGroup options={options} value={["bold", "underline"]} onChange={() => {}} aria-label="Text formatting" />
    );
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "I" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "U" })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the value appended when clicking an inactive option", () => {
    const onChange = vi.fn();
    render(<ToggleGroup options={options} value={["bold"]} onChange={onChange} aria-label="Text formatting" />);
    fireEvent.click(screen.getByRole("button", { name: "I" }));
    expect(onChange).toHaveBeenCalledWith(["bold", "italic"]);
  });

  it("calls onChange with the value removed when clicking an active option", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup options={options} value={["bold", "italic"]} onChange={onChange} aria-label="Text formatting" />
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith(["italic"]);
  });

  it("does not mutate the value passed in", () => {
    const onChange = vi.fn();
    const value = ["bold"];
    render(<ToggleGroup options={options} value={value} onChange={onChange} aria-label="Text formatting" />);
    fireEvent.click(screen.getByRole("button", { name: "I" }));
    expect(value).toEqual(["bold"]);
  });

  it("disables every button and ignores clicks when disabled", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup options={options} value={["bold"]} onChange={onChange} disabled aria-label="Text formatting" />
    );
    const btn = screen.getByRole("button", { name: "B" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onChange).not.toHaveBeenCalled();
  });
});
