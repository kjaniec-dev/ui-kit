import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox, Radio, CheckboxField } from "./checkbox";

describe("Checkbox", () => {
  it("renders with accessible label and checkbox role", () => {
    render(<Checkbox label="Accept terms and conditions" />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms and conditions" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(checkbox).not.toBeDisabled();
  });

  it("toggles state when clicked in uncontrolled mode", () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Subscribe to newsletter" onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Subscribe to newsletter" });

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(handleChange).toHaveBeenCalledTimes(1);

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it("respects defaultChecked prop", () => {
    render(<Checkbox label="Pre-checked" defaultChecked />);
    const checkbox = screen.getByRole("checkbox", { name: "Pre-checked" });
    expect(checkbox).toBeChecked();
  });

  it("works as a controlled component", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Checkbox label="Controlled" checked={false} onChange={handleChange} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Controlled" });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    // In controlled mode without state update, it remains unchecked
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox label="Controlled" checked={true} onChange={handleChange} />);
    expect(checkbox).toBeChecked();
  });

  it("disables interaction when disabled is true", () => {
    render(<Checkbox label="Disabled option" disabled />);
    const checkbox = screen.getByRole("checkbox", { name: "Disabled option" });
    expect(checkbox).toBeDisabled();
    expect(checkbox).toHaveAttribute("disabled");
  });

  it("links label htmlFor to input id with custom id", () => {
    render(<Checkbox id="custom-chk-id" label="Custom ID Label" />);
    const input = screen.getByRole("checkbox", { name: "Custom ID Label" });
    expect(input).toHaveAttribute("id", "custom-chk-id");
    const label = input.closest("label");
    expect(label).toHaveAttribute("for", "custom-chk-id");
  });

  it("auto-generates id and binds label htmlFor when id is not provided", () => {
    render(<Checkbox label="Auto ID Label" />);
    const input = screen.getByRole("checkbox", { name: "Auto ID Label" });
    const id = input.getAttribute("id");
    expect(id).toBeTruthy();
    const label = input.closest("label");
    expect(label).toHaveAttribute("for", id);
  });

  it("forwards ref to the underlying HTML input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Ref Checkbox" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  it("merges custom className on the wrapper label", () => {
    render(<Checkbox label="Styled" className="custom-chk-wrapper" />);
    const input = screen.getByRole("checkbox", { name: "Styled" });
    const label = input.closest("label");
    expect(label).toHaveClass("custom-chk-wrapper");
  });

  it("supports HTML input attributes like name, value, and required", () => {
    render(<Checkbox label="Form Value" name="agreement" value="yes" required />);
    const input = screen.getByRole("checkbox", { name: "Form Value" });
    expect(input).toHaveAttribute("name", "agreement");
    expect(input).toHaveAttribute("value", "yes");
    expect(input).toBeRequired();
  });
});

describe("Radio", () => {
  it("renders with accessible label and radio role", () => {
    render(<Radio label="Option One" />);
    const radio = screen.getByRole("radio", { name: "Option One" });
    expect(radio).toBeInTheDocument();
    expect(radio).not.toBeChecked();
  });

  it("handles selection and onChange when clicked", () => {
    const handleChange = vi.fn();
    render(<Radio label="Select me" onChange={handleChange} />);
    const radio = screen.getByRole("radio", { name: "Select me" });

    fireEvent.click(radio);
    expect(radio).toBeChecked();
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("behaves as a radio group when sharing name attribute", () => {
    render(
      <fieldset>
        <Radio name="delivery" label="Standard" value="std" defaultChecked />
        <Radio name="delivery" label="Express" value="exp" />
      </fieldset>
    );
    const standard = screen.getByRole("radio", { name: "Standard" });
    const express = screen.getByRole("radio", { name: "Express" });

    expect(standard).toBeChecked();
    expect(express).not.toBeChecked();

    fireEvent.click(express);
    expect(express).toBeChecked();
    expect(standard).not.toBeChecked();
  });

  it("respects controlled checked state", () => {
    const { rerender } = render(<Radio label="Controlled Radio" checked={false} onChange={() => {}} />);
    const radio = screen.getByRole("radio", { name: "Controlled Radio" });
    expect(radio).not.toBeChecked();

    rerender(<Radio label="Controlled Radio" checked={true} onChange={() => {}} />);
    expect(radio).toBeChecked();
  });

  it("disables interaction when disabled is true", () => {
    render(<Radio label="Disabled Radio" disabled />);
    const radio = screen.getByRole("radio", { name: "Disabled Radio" });
    expect(radio).toBeDisabled();
    expect(radio).toHaveAttribute("disabled");
  });

  it("forwards ref to the underlying HTML radio input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Radio ref={ref} label="Radio Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("radio");
  });

  it("links label htmlFor and merges custom className", () => {
    render(<Radio id="custom-radio-id" label="Custom Radio" className="custom-radio-label" />);
    const radio = screen.getByRole("radio", { name: "Custom Radio" });
    expect(radio).toHaveAttribute("id", "custom-radio-id");
    const label = radio.closest("label");
    expect(label).toHaveAttribute("for", "custom-radio-id");
    expect(label).toHaveClass("custom-radio-label");
  });
});

describe("CheckboxField", () => {
  it("renders checkbox with label", () => {
    render(<CheckboxField label="Enable notifications" />);
    const checkbox = screen.getByRole("checkbox", { name: "Enable notifications" });
    expect(checkbox).toBeInTheDocument();
  });

  it("renders hint and links it via aria-describedby", () => {
    render(
      <CheckboxField
        label="Auto-renew subscription"
        hint="Billed automatically each year."
      />
    );
    const hint = screen.getByText("Billed automatically each year.");
    expect(hint).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox", { name: "Auto-renew subscription" });
    expect(checkbox).toHaveAttribute("aria-describedby", hint.id);
  });

  it("renders error message, sets aria-invalid, and links via aria-describedby", () => {
    render(
      <CheckboxField
        label="Accept privacy policy"
        error="You must accept the privacy policy to continue"
      />
    );
    const error = screen.getByText("You must accept the privacy policy to continue");
    expect(error).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox", { name: "Accept privacy policy" });
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", error.id);
  });

  it("hides hint when error is present", () => {
    render(
      <CheckboxField
        label="Terms"
        hint="Optional marketing emails"
        error="Consent is mandatory"
      />
    );
    expect(screen.queryByText("Optional marketing emails")).not.toBeInTheDocument();
    expect(screen.getByText("Consent is mandatory")).toBeInTheDocument();
  });

  it("forwards ref to the underlying checkbox input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<CheckboxField ref={ref} label="Field with Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe("checkbox");
  });

  it("handles click and change events", () => {
    const handleChange = vi.fn();
    render(<CheckboxField label="Receive SMS" onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Receive SMS" });
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });

  it("supports disabled state on CheckboxField", () => {
    render(<CheckboxField label="Locked setting" disabled />);
    const checkbox = screen.getByRole("checkbox", { name: "Locked setting" });
    expect(checkbox).toBeDisabled();
  });

  it("merges custom className on the outer container", () => {
    const { container } = render(
      <CheckboxField label="Styled Container" className="custom-chk-field-container" />
    );
    expect(container.firstChild).toHaveClass("custom-chk-field-container");
  });
});
