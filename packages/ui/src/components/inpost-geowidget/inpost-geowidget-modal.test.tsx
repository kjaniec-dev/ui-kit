import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InPostGeowidgetModal } from "./inpost-geowidget-modal";

vi.mock("./use-inpost-script", () => ({
  useInPostScript: () => ({ isLoaded: true, error: null }),
}));

describe("InPostGeowidgetModal", () => {
  it("opens modal on trigger button click and displays selected point", () => {
    const onSelect = vi.fn();
    render(<InPostGeowidgetModal onSelect={onSelect} triggerText="Wybierz Paczkomat" />);

    const triggerBtn = screen.getByRole("button", { name: /Wybierz Paczkomat/i });
    expect(triggerBtn).toBeDefined();

    fireEvent.click(triggerBtn);

    expect(screen.getByText("Wybierz punkt odbioru InPost")).toBeDefined();
  });
});
