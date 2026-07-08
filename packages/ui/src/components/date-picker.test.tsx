import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatePicker } from "./date-picker";

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const fullDateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full" });

describe("DatePicker", () => {
  it("renders the placeholder when nothing is selected", () => {
    render(<DatePicker placeholder="Pick a date" />);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  });

  it("opens the calendar panel on trigger click", () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("selecting a day closes the panel, updates the trigger, and fires onChange", () => {
    const onChange = vi.fn();
    render(<DatePicker onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    const today = new Date();
    fireEvent.click(screen.getByRole("gridcell", { name: fullDateFormat.format(today) }));
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: displayFormat.format(today) })).toBeInTheDocument();
  });

  it("reflects a controlled value on the trigger", () => {
    render(<DatePicker value={new Date(2026, 6, 15)} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: displayFormat.format(new Date(2026, 6, 15)) })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(<DatePicker />);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Escape" });
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("does not open when disabled", () => {
    render(<DatePicker disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("sets aria-invalid and aria-required on the trigger", () => {
    render(<DatePicker error required />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-required", "true");
  });

  it("forwards its ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("closes on outside click", () => {
    render(<DatePicker />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
