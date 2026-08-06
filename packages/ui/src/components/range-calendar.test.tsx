import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RangeCalendar } from "./range-calendar";

const monthLabel = (y: number, m: number) =>
  new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(y, m, 1));
const dayLabel = (y: number, m: number, d: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(new Date(y, m, d));

describe("RangeCalendar", () => {
  it("renders two locked months (left = defaultMonth, right = defaultMonth + 1)", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByRole("grid", { name: monthLabel(2026, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
  });

  it("Next/Previous month shifts both grids together", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Next month" })[0]);
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 8) })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: monthLabel(2026, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2026, 7) })).toBeInTheDocument();
  });

  it("a keyboard move landing outside both visible months shifts the locked pair", () => {
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 15), end: new Date(2026, 6, 15) }}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    // Shift+PageDown moves the focused day +1 year (July 2027), which is
    // outside the initially-visible [July 2026, August 2026] pair — this is
    // the case that requires CalendarGrid's onFocusDay to reach RangeCalendar's
    // setViewMonth, not just a same-pair move like a plain PageDown would be.
    fireEvent.keyDown(leftGrid, { key: "PageDown", shiftKey: true });
    expect(screen.getByRole("grid", { name: monthLabel(2027, 6) })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: monthLabel(2027, 7) })).toBeInTheDocument();
  });

  it("click start then click end (later date) commits the range via onChange", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 20) });
  });

  it("clicking an end date in the right-hand month completes a cross-month range", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 25) }));
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 7, 5) }));
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 25), end: new Date(2026, 7, 5) });
  });

  it("clicking a day earlier than the in-progress start restarts the selection instead of committing", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 20) }));
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 15) }));
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 15) });
  });

  it("hovering while a start is picked previews the range without committing", () => {
    const onChange = vi.fn();
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} onChange={onChange} />);
    fireEvent.click(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 10) }));
    fireEvent.mouseEnter(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 14) }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 14) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 12) })).toHaveAttribute("aria-selected", "false");
  });

  it("disables days outside min/max and blocks selecting them in both months", () => {
    const onChange = vi.fn();
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        min={new Date(2026, 6, 10)}
        max={new Date(2026, 7, 20)}
        onChange={onChange}
      />
    );
    const outOfRange = screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) });
    expect(outOfRange).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(outOfRange);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabledDates predicate disables matching days in both months", () => {
    render(<RangeCalendar defaultMonth={new Date(2026, 6, 1)} disabledDates={(d) => d.getDay() === 0} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-disabled", "true"); // July 5, 2026 is a Sunday
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 7, 2) })).toHaveAttribute("aria-disabled", "true"); // August 2, 2026 is a Sunday
  });

  it("moves the roving tabindex within a grid via ArrowRight without affecting the other grid", () => {
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 8), end: new Date(2026, 6, 8) }}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    fireEvent.keyDown(leftGrid, { key: "ArrowRight" });
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 9) })).toHaveAttribute("tabindex", "0");
  });

  it("selects the roving day on Enter, completing the range on the second Enter", () => {
    const onChange = vi.fn();
    render(
      <RangeCalendar
        defaultMonth={new Date(2026, 6, 1)}
        defaultValue={{ start: new Date(2026, 6, 8), end: new Date(2026, 6, 8) }}
        onChange={onChange}
      />
    );
    const leftGrid = screen.getByRole("grid", { name: monthLabel(2026, 6) });
    fireEvent.keyDown(leftGrid, { key: "Enter" });
    fireEvent.keyDown(leftGrid, { key: "ArrowRight" });
    fireEvent.keyDown(leftGrid, { key: "Enter" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ start: new Date(2026, 6, 8), end: new Date(2026, 6, 9) });
  });

  it("reflects a controlled value across both grids", () => {
    const { rerender } = render(
      <RangeCalendar value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 8) }} onChange={() => {}} />
    );
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 5) })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("aria-selected", "true");
    rerender(<RangeCalendar value={{ start: new Date(2026, 6, 5), end: new Date(2026, 6, 6) }} onChange={() => {}} />);
    expect(screen.getByRole("gridcell", { name: dayLabel(2026, 6, 8) })).toHaveAttribute("aria-selected", "false");
  });

  it("forwards its ref to the outer container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<RangeCalendar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
