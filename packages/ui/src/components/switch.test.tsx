import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./switch";

describe("Switch", () => {
  describe("rendering and accessibility", () => {
    it("renders with role switch and associated label", () => {
      render(<Switch label="Airplane Mode" />);
      const switchEl = screen.getByRole("switch", { name: "Airplane Mode" });
      expect(switchEl).toBeInTheDocument();
      expect(switchEl).toHaveAttribute("type", "checkbox");
      expect(switchEl).not.toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "false");
    });

    it("uses auto-generated id linked to label htmlFor", () => {
      render(<Switch label="Auto ID Switch" />);
      const switchEl = screen.getByRole("switch", { name: "Auto ID Switch" });
      const id = switchEl.getAttribute("id");
      expect(id).toBeTruthy();
      const label = switchEl.closest("label");
      expect(label).toHaveAttribute("for", id);
    });

    it("uses custom id when provided", () => {
      render(<Switch id="custom-switch-id" label="Custom ID Switch" />);
      const switchEl = screen.getByRole("switch", { name: "Custom ID Switch" });
      expect(switchEl).toHaveAttribute("id", "custom-switch-id");
      const label = switchEl.closest("label");
      expect(label).toHaveAttribute("for", "custom-switch-id");
    });

    it("supports accessible aria-label when visual label is omitted", () => {
      render(<Switch aria-label="Mute Audio" />);
      const switchEl = screen.getByRole("switch", { name: "Mute Audio" });
      expect(switchEl).toBeInTheDocument();
    });
  });

  describe("uncontrolled mode", () => {
    it("starts unchecked by default and toggles on click", () => {
      const handleChange = vi.fn();
      render(<Switch label="Dark Mode" onChange={handleChange} />);
      const switchEl = screen.getByRole("switch", { name: "Dark Mode" });

      expect(switchEl).not.toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "false");

      fireEvent.click(switchEl);
      expect(switchEl).toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "true");
      expect(handleChange).toHaveBeenCalledTimes(1);

      fireEvent.click(switchEl);
      expect(switchEl).not.toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "false");
      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it("respects defaultChecked prop", () => {
      render(<Switch label="Enable Wi-Fi" defaultChecked />);
      const switchEl = screen.getByRole("switch", { name: "Enable Wi-Fi" });
      expect(switchEl).toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "true");
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled checked=true and checked=false state", () => {
      const { rerender } = render(
        <Switch label="Controlled Switch" checked={true} onChange={() => {}} />
      );
      const switchEl = screen.getByRole("switch", { name: "Controlled Switch" });
      expect(switchEl).toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "true");

      rerender(<Switch label="Controlled Switch" checked={false} onChange={() => {}} />);
      expect(switchEl).not.toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "false");
    });

    it("calls onChange when clicked in controlled mode", () => {
      const handleChange = vi.fn();
      render(<Switch label="Controlled Click" checked={false} onChange={handleChange} />);
      const switchEl = screen.getByRole("switch", { name: "Controlled Click" });

      fireEvent.click(switchEl);
      expect(handleChange).toHaveBeenCalledTimes(1);
      // Controlled without parent state update remains unchanged
      expect(switchEl).not.toBeChecked();
      expect(switchEl).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("disabled state", () => {
    it("disables the switch input when disabled is true", () => {
      render(<Switch label="Locked Setting" disabled />);
      const switchEl = screen.getByRole("switch", { name: "Locked Setting" });
      expect(switchEl).toBeDisabled();
      expect(switchEl).toHaveAttribute("disabled");
    });
  });

  describe("ref and HTML attributes", () => {
    it("forwards ref to the underlying HTML input element", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Switch ref={ref} label="Ref Switch" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.getAttribute("role")).toBe("switch");
    });

    it("merges custom className on the wrapper label", () => {
      render(<Switch label="Styled Switch" className="custom-switch-class" />);
      const switchEl = screen.getByRole("switch", { name: "Styled Switch" });
      const label = switchEl.closest("label");
      expect(label).toHaveClass("custom-switch-class");
    });

    it("passes through standard attributes like name and value", () => {
      render(<Switch label="Form Switch" name="notifications" value="enabled" />);
      const switchEl = screen.getByRole("switch", { name: "Form Switch" });
      expect(switchEl).toHaveAttribute("name", "notifications");
      expect(switchEl).toHaveAttribute("value", "enabled");
    });
  });
});
