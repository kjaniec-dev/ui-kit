import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Combobox, ComboboxField } from "./combobox";

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

  it("skips a disabled option when navigating with the keyboard", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    const input = screen.getByRole("combobox");
    // active starts at apple (index 0). Three ArrowDown presses cycle
    // apple -> banana -> cherry -> (durian is disabled, skipped) -> apple.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalledWith("durian");
    expect(onChange).toHaveBeenCalledWith("apple");
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

  it("sets aria-required on the trigger only when required is true", () => {
    const { rerender } = render(<Combobox options={options} placeholder="Pick fruit" />);
    expect(screen.getByRole("button", { name: "Pick fruit" })).not.toHaveAttribute("aria-required");
    rerender(<Combobox options={options} placeholder="Pick fruit" required />);
    expect(screen.getByRole("button", { name: "Pick fruit" })).toHaveAttribute("aria-required", "true");
  });

  it("navigates backward with ArrowUp, skipping a disabled option", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    const input = screen.getByRole("combobox");
    // active starts at apple (index 0); ArrowUp wraps past disabled durian to cherry.
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("cherry");
  });

  it("Home jumps to the first enabled option", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("apple");
  });

  it("End jumps to the last enabled option, skipping a trailing disabled one", () => {
    const onChange = vi.fn();
    render(<Combobox options={options} placeholder="Pick fruit" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("cherry");
  });

  it("renders the empty message and no options when the option list is empty", () => {
    render(<Combobox options={[]} placeholder="Pick fruit" emptyMessage="Nothing here" />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("closes when clicking outside the component", () => {
    render(<Combobox options={options} placeholder="Pick fruit" />);
    fireEvent.click(screen.getByRole("button", { name: "Pick fruit" }));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});

describe("Combobox (multiple)", () => {
  // The trigger is the only button carrying aria-expanded.
  const openMenu = () => fireEvent.click(screen.getByRole("button", { expanded: false }));

  it("toggles values and fires onChange with an array, staying open", () => {
    const onChange = vi.fn();
    render(<Combobox multiple options={options} placeholder="Pick" onChange={onChange} />);
    openMenu();
    fireEvent.click(screen.getByRole("option", { name: "Apple" }));
    expect(onChange).toHaveBeenLastCalledWith(["apple"]);
    expect(screen.getByRole("listbox")).toBeInTheDocument(); // still open
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenLastCalledWith(["apple", "banana"]);
    fireEvent.click(screen.getByRole("option", { name: "Apple" })); // toggle off
    expect(onChange).toHaveBeenLastCalledWith(["banana"]);
  });

  it("renders removable chips and removes on the chip button", () => {
    const onChange = vi.fn();
    render(
      <Combobox multiple options={options} defaultValue={["apple", "banana"]} placeholder="Pick" onChange={onChange} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(onChange).toHaveBeenLastCalledWith(["banana"]);
  });

  it("marks the listbox aria-multiselectable", () => {
    render(<Combobox multiple options={options} placeholder="Pick" />);
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("removes the last chip on Backspace when the search is empty", () => {
    const onChange = vi.fn();
    render(
      <Combobox multiple options={options} defaultValue={["apple", "banana"]} placeholder="Pick" onChange={onChange} />
    );
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith(["apple"]);
  });

  it("reflects a controlled value and only updates after the parent re-renders", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Combobox multiple options={options} value={["apple"]} placeholder="Pick" onChange={onChange} />
    );
    expect(screen.getByRole("button", { name: "Remove Apple" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenLastCalledWith(["apple", "banana"]);
    expect(screen.queryByRole("button", { name: "Remove Banana" })).not.toBeInTheDocument();
    rerender(<Combobox multiple options={options} value={["apple", "banana"]} placeholder="Pick" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Remove Banana" })).toBeInTheDocument();
  });
});

describe("ComboboxField", () => {
  it("associates the label with the combobox trigger", () => {
    render(<ComboboxField label="Fruit" options={options} />);
    expect(screen.getByLabelText("Fruit")).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<ComboboxField label="Fruit" hint="Pick one" options={options} />);
    const trigger = screen.getByLabelText("Fruit");
    expect(screen.getByText("Pick one")).toBeInTheDocument();
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Pick one").id);
  });

  it("shows the error, hides the hint, and marks the trigger invalid", () => {
    render(<ComboboxField label="Fruit" hint="Pick one" error="Required" options={options} />);
    const trigger = screen.getByLabelText("Fruit");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Required").id);
  });

  it("supports multiple mode and associates label/hint/error the same as single-select", () => {
    const onChange = vi.fn();
    render(
      <ComboboxField
        label="Fruit"
        hint="Pick one"
        error="Required"
        multiple
        options={options}
        defaultValue={["apple"]}
        onChange={onChange}
      />
    );
    const trigger = screen.getByLabelText("Fruit");
    expect(screen.getByText("Apple")).toBeInTheDocument(); // rendered chip
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Required").id);

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Banana" }));
    expect(onChange).toHaveBeenLastCalledWith(["apple", "banana"]);
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ComboboxField label="Fruit" options={options} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
