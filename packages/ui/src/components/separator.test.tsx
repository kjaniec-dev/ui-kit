import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("defaults to decorative: role=none, aria-hidden=true, no aria-orientation", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  it("decorative=false renders role=separator with aria-orientation matching orientation", () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).not.toHaveAttribute("aria-hidden");
  });

  it("vertical orientation stays decorative (no aria-orientation) unless decorative=false", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("role", "none");
    expect(el).not.toHaveAttribute("aria-orientation");
  });

  it("horizontal orientation applies a full-width, thin-height class", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("w-full");
    expect(el.className).toContain("h-px");
  });

  it("vertical orientation applies a full-height, thin-width class", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("h-full");
    expect(el.className).toContain("w-px");
  });

  it("merges a custom className", () => {
    const { container } = render(<Separator className="my-4" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("my-4");
  });
});
