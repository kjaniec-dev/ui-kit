import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { isValidHex, hexToHsl, hslToHex, DEFAULT_COLOR_SWATCHES, ColorPickerSwatch } from "./color-picker";

describe("Color Picker Utilities", () => {
  it("exports DEFAULT_COLOR_SWATCHES array with 12 colors", () => {
    expect(DEFAULT_COLOR_SWATCHES).toHaveLength(12);
    expect(DEFAULT_COLOR_SWATCHES[0]).toBe("#EF4444");
  });

  it("isValidHex validates 3 and 6-digit hex strings", () => {
    expect(isValidHex("#3B82F6")).toBe(true);
    expect(isValidHex("#fff")).toBe(true);
    expect(isValidHex("3B82F6")).toBe(true);
    expect(isValidHex(" #3B82F6 ")).toBe(true);
    expect(isValidHex("#3B82")).toBe(false);
    expect(isValidHex("invalid")).toBe(false);
  });

  it("hexToHsl converts valid hex strings to HSL object", () => {
    const hsl = hexToHsl("#3B82F6");
    expect(hsl.h).toBeGreaterThanOrEqual(0);
    expect(hsl.h).toBeLessThanOrEqual(360);
    expect(hsl.s).toBeGreaterThanOrEqual(0);
    expect(hsl.l).toBeGreaterThanOrEqual(0);
  });

  it("hexToHsl handles invalid hex gracefully", () => {
    expect(hexToHsl("invalid")).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("hslToHex converts HSL values back to hex string", () => {
    const hex = hslToHex(217, 91, 60);
    expect(hex.toUpperCase()).toMatch(/^#[0-9A-F]{6}$/);
    expect(hslToHex(360, 100, 50)).toBe("#FF0000");
  });
});

describe("ColorPickerSwatch", () => {
  it("renders a button with background color", () => {
    render(<ColorPickerSwatch color="#EF4444" aria-label="Red swatch" />);
    const button = screen.getByRole("button", { name: "Red swatch" });
    expect(button).toBeInTheDocument();
  });

  it("shows checkmark when selected is true", () => {
    render(<ColorPickerSwatch color="#EF4444" selected aria-label="Red swatch" />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ColorPickerSwatch color="#EF4444" onClick={onClick} aria-label="Red swatch" />);
    fireEvent.click(screen.getByRole("button", { name: "Red swatch" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});


