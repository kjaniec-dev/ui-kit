import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangePicker, DateRangePickerField } from "./date-range-picker";

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

// DateRangePicker exposes no month/defaultMonth prop (matching DatePicker's own
// shape — it doesn't expose one either), so tests that need to click two
// distinct, deterministic days use the 1st and 2nd of the real current month
// rather than a fixed year/month. Every month has at least 28 days, so day 2
// always exists regardless of when the suite runs.
const base = new Date();
const day1 = new Date(base.getFullYear(), base.getMonth(), 1);
const day2 = new Date(base.getFullYear(), base.getMonth(), 2);

describe("DateRangePicker", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<DateRangePicker placeholder="Pick a date range" />);
    expect(screen.getByRole("button", { name: "Pick a date range" })).toBeInTheDocument();
  });

  it("opens the range calendar panel on trigger click", () => {
    render(<DateRangePicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("grid")).toHaveLength(2);
  });

  it("completing a range closes the panel, updates the trigger, and fires onChange once", () => {
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) }));
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day2) }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: day1, end: day2 });
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    const expectedLabel = `${displayFormat.format(day1)} – ${displayFormat.format(day2)}`;
    expect(screen.getByRole("button", { name: expectedLabel })).toBeInTheDocument();
  });

  it("reflects a controlled value on the trigger", () => {
    render(<DateRangePicker value={{ start: day1, end: day2 }} onChange={() => {}} />);
    const expectedLabel = `${displayFormat.format(day1)} – ${displayFormat.format(day2)}`;
    expect(screen.getByRole("button", { name: expectedLabel })).toBeInTheDocument();
  });

  it("closes on Escape from the trigger without opening a grid first", () => {
    render(<DateRangePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    expect(trigger).toHaveFocus();
  });

  it("Escape during a partial (start-only) pick reverts it and closes without committing", () => {
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />);
    const trigger = screen.getByRole("button", { name: "Pick a date range…" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) }));
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Pick a date range…" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pick a date range…" }));
    expect(screen.getByRole("gridcell", { name: fullDateFormat.format(day1) })).toHaveAttribute("aria-selected", "false");
  });

  it("does not open when disabled", () => {
    render(<DateRangePicker disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryAllByRole("grid")).toHaveLength(0);
  });

  it("sets aria-invalid and aria-required on the trigger", () => {
    render(<DateRangePicker error required />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DateRangePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

describe("DateRangePickerField", () => {
  it("associates the label with the trigger", () => {
    render(<DateRangePickerField label="Booking dates" />);
    expect(screen.getByLabelText("Booking dates")).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("shows the hint and links it via aria-describedby", () => {
    render(<DateRangePickerField label="Booking dates" hint="Choose your stay" />);
    const trigger = screen.getByLabelText("Booking dates");
    expect(screen.getByText("Choose your stay")).toBeInTheDocument();
    expect(trigger.getAttribute("aria-describedby")).toContain(screen.getByText("Choose your stay").id);
  });

  it("shows the error, hides the hint, and marks the trigger invalid", () => {
    render(<DateRangePickerField label="Booking dates" hint="Choose your stay" error="Required" />);
    const trigger = screen.getByLabelText("Booking dates");
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("Choose your stay")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DateRangePickerField label="Booking dates" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
