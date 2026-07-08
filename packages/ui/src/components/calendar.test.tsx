import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar } from "./calendar";

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
const dayLabel = (y: number, m: number, d: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(y, m, d));

describe("Calendar", () => {
  it("renders the month label and 7 weekday headers", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByText(monthLabel(2026, 6))).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("renders a gridcell for every day in the month", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />); // July 2026 has 31 days
    expect(screen.getAllByRole("gridcell")).toHaveLength(31);
  });

  it("navigates to the next/previous month via header buttons", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} />);
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(monthLabel(2026, 7))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText(monthLabel(2026, 5))).toBeInTheDocument();
  });

  it("selects a day on click and fires onChange", () => {
    const onChange = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 15));
  });

  it("marks the selected day aria-selected only after the value is set", () => {
    render(<Calendar value={new Date(2026, 6, 1)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "false");
  });

  it("disables days outside min/max and blocks selecting them", () => {
    const onChange = vi.fn();
    render(
      <Calendar
        defaultMonth={new Date(2026, 6, 1)}
        min={new Date(2026, 6, 10)}
        max={new Date(2026, 6, 20)}
        onChange={onChange}
      />
    );
    const outOfRange = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) });
    expect(outOfRange).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(outOfRange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledDates predicate disables matching days", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} disabledDates={(d) => d.getDay() === 0} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-disabled", "true"); // July 5, 2026 is a Sunday
  });

  it("moves the roving tabindex with ArrowRight, Home, and End", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 8)} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 9) })).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(grid, { key: "Home" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(grid, { key: "End" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 11) })).toHaveAttribute("tabindex", "0");
  });

  it("selects the roving day on Enter", () => {
    const onChange = vi.fn();
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 8)} onChange={onChange} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 9));
  });

  it("PageUp/PageDown move by a month; Shift+PageUp/PageDown move by a year", () => {
    render(<Calendar defaultMonth={new Date(2026, 6, 1)} defaultValue={new Date(2026, 6, 15)} />);
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "PageDown" });
    expect(screen.getByText(monthLabel(2026, 7))).toBeInTheDocument();
    fireEvent.keyDown(grid, { key: "PageDown", shiftKey: true });
    expect(screen.getByText(monthLabel(2027, 7))).toBeInTheDocument();
  });

  it("ArrowLeft skips a disabled day", () => {
    render(
      <Calendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={new Date(2026, 6, 10)}
        disabledDates={(d) => d.getDate() === 9}
      />
    );
    const grid = screen.getByRole("grid");
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("tabindex", "0");
  });

  it("reflects a controlled value and only updates after the parent re-renders", () => {
    const { rerender } = render(<Calendar value={new Date(2026, 6, 1)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "false");
    rerender(<Calendar value={new Date(2026, 6, 15)} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) })).toHaveAttribute("aria-selected", "true");
  });

  it("forwards its ref to the outer container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Calendar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
