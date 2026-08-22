import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select, SelectField } from "./select";

const options = (
  <>
    <option value="a">Apple</option>
    <option value="b">Banana</option>
    <option value="c">Cherry</option>
  </>
);

describe("Select", () => {
  it("renders its options", () => {
    render(<Select aria-label="fruit">{options}</Select>);
    expect(screen.getByRole("combobox", { name: "fruit" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Banana" })).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("fires onChange with the selected value", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="fruit" onChange={onChange}>
        {options}
      </Select>
    );
    fireEvent.change(screen.getByRole("combobox", { name: "fruit" }), {
      target: { value: "c" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe("c");
  });

  it("reflects a controlled value", () => {
    render(
      <Select aria-label="fruit" value="b" onChange={() => {}}>
        {options}
      </Select>
    );
    expect(screen.getByRole("combobox", { name: "fruit" })).toHaveValue("b");
  });

  it("sets aria-invalid only when error is true", () => {
    const { rerender } = render(<Select aria-label="fruit">{options}</Select>);
    expect(screen.getByRole("combobox", { name: "fruit" })).not.toHaveAttribute("aria-invalid");
    rerender(
      <Select aria-label="fruit" error>
        {options}
      </Select>
    );
    expect(screen.getByRole("combobox", { name: "fruit" })).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the underlying select element", () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(
      <Select aria-label="fruit" ref={ref}>
        {options}
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("passes through the disabled attribute", () => {
    render(
      <Select aria-label="fruit" disabled>
        {options}
      </Select>
    );
    expect(screen.getByRole("combobox", { name: "fruit" })).toBeDisabled();
  });
});

describe("SelectField", () => {
  it("associates the label with the select", () => {
    render(<SelectField label="Fruit">{options}</SelectField>);
    // getByLabelText resolves the label -> select association
    const select = screen.getByLabelText("Fruit");
    expect(select).toBeInstanceOf(HTMLSelectElement);
  });

  it("shows the hint when there is no error", () => {
    render(
      <SelectField label="Fruit" hint="Pick one">
        {options}
      </SelectField>
    );
    const select = screen.getByLabelText("Fruit");
    expect(screen.getByText("Pick one")).toBeInTheDocument();
    expect(select.getAttribute("aria-describedby")).toContain(screen.getByText("Pick one").id);
  });

  it("shows the error, hides the hint, and marks the select invalid", () => {
    render(
      <SelectField label="Fruit" hint="Pick one" error="Required">
        {options}
      </SelectField>
    );
    const select = screen.getByLabelText("Fruit");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Pick one")).not.toBeInTheDocument();
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select.getAttribute("aria-describedby")).toContain(screen.getByText("Required").id);
  });

  it("marks the field required", () => {
    render(
      <SelectField label="Fruit" required>
        {options}
      </SelectField>
    );
    expect(screen.getByLabelText(/Fruit/)).toBeRequired();
  });
});
