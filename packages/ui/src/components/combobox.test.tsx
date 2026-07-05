import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Combobox } from "./combobox";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "durian", label: "Durian", disabled: true },
];

describe("Combobox (single)", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<Combobox options={options} placeholder="Pick fruit" />);
    expect(screen.getByRole("button", { name: "Pick fruit" })).toBeInTheDocument();
  });

  it("opens the popup on trigger click and lists all options", () => {
    render(<Combobox options={options} placeholder="Pick fruit" />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    expect(screen.getByRole("combobox")).toBeInTheDocument(); // the search input
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("filters options by typed text and shows the empty message", () => {
    render(<Combobox options={options} placeholder="Pick fruit" emptyMessage="Nothing here" />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ban" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("selecting an option sets the label, closes, and fires onChange", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    fireEvent.click(screen.getByRole("option", { name: "Cherry" }));
    expect(onChange).toHaveBeenCalledWith("cherry");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument(); // popup closed
    expect(screen.getByRole("button", { name: "Cherry" })).toBeInTheDocument();
  });

  it("reflects a controlled value", () => {
    render(<Combobox options={options} value="banana" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Banana" })).toBeInTheDocument();
  });

  it("navigates with the keyboard and selects with Enter", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" }); // active moves apple -> banana
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("banana");
  });

  it("skips a disabled option on click", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    fireEvent.click(screen.getByRole("option", { name: "Durian" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    render(<Combobox options={options} placeholder="Pick fruit" />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("sets aria-invalid on the trigger only when error is true", () => {
    const { rerender } = render(<Combobox options={options} placeholder="Pick fruit" />);
    expect(screen.getByRole("button", { name: "Pick fruit" })).not.toHaveAttribute("aria-invalid");
    rerender(<Combobox options={options} placeholder="Pick fruit" error />);
    expect(screen.getByRole("button", { name: "Pick fruit" })).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Combobox options={options} placeholder="Pick fruit" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
