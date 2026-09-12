import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field, Label, Hint } from "./field";

describe("Label", () => {
  it("renders a label element with children", () => {
    render(<Label htmlFor="test-input">Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "test-input");
  });

  it("applies default typography and font styling classes", () => {
    render(<Label>Email Address</Label>);
    const label = screen.getByText("Email Address");
    expect(label).toHaveClass("text-[0.8rem]", "font-semibold", "text-foreground");
  });

  it("merges custom className with default classes", () => {
    render(<Label className="custom-label uppercase">Custom Label</Label>);
    const label = screen.getByText("Custom Label");
    expect(label).toHaveClass("custom-label", "uppercase", "text-[0.8rem]", "font-semibold");
  });

  it("does not render an asterisk when required is false or omitted", () => {
    const { rerender } = render(<Label>Optional Field</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();

    rerender(<Label required={false}>Optional Field</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders a red required marker when required is true", () => {
    render(<Label required>Required Field</Label>);
    const asterisk = screen.getByText("*");
    expect(asterisk).toBeInTheDocument();
    expect(asterisk.tagName).toBe("SPAN");
    expect(asterisk).toHaveClass("text-danger");
  });

  it("forwards ref to HTMLLabelElement", () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Ref Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    expect(ref.current?.tagName).toBe("LABEL");
  });

  it("passes through standard label attributes", () => {
    render(
      <Label id="label-id" data-testid="test-label" title="Tooltip">
        Full Name
      </Label>
    );
    const label = screen.getByTestId("test-label");
    expect(label).toHaveAttribute("id", "label-id");
    expect(label).toHaveAttribute("title", "Tooltip");
  });
});

describe("Hint", () => {
  it("renders a span element with default hint styling", () => {
    render(<Hint>Must be at least 8 characters</Hint>);
    const hint = screen.getByText("Must be at least 8 characters");
    expect(hint).toBeInTheDocument();
    expect(hint.tagName).toBe("SPAN");
    expect(hint).toHaveClass("text-[0.76rem]", "text-muted-foreground");
    expect(hint).not.toHaveClass("text-danger");
  });

  it("renders error styling with text-danger when error prop is true", () => {
    render(<Hint error>This field is required</Hint>);
    const hint = screen.getByText("This field is required");
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveClass("text-[0.76rem]", "text-danger");
    expect(hint).not.toHaveClass("text-muted-foreground");
  });

  it("does not apply error styling when error is false", () => {
    render(<Hint error={false}>Neutral hint text</Hint>);
    const hint = screen.getByText("Neutral hint text");
    expect(hint).toHaveClass("text-muted-foreground");
    expect(hint).not.toHaveClass("text-danger");
  });

  it("merges custom className", () => {
    render(<Hint className="custom-hint italic">Formatted hint</Hint>);
    const hint = screen.getByText("Formatted hint");
    expect(hint).toHaveClass("custom-hint", "italic", "text-[0.76rem]");
  });

  it("forwards ref to HTMLSpanElement", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Hint ref={ref}>Ref Hint</Hint>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("passes through HTML attributes like id and role", () => {
    render(
      <Hint id="hint-msg" role="alert" data-testid="hint-element">
        Notice
      </Hint>
    );
    const hint = screen.getByTestId("hint-element");
    expect(hint).toHaveAttribute("id", "hint-msg");
    expect(hint).toHaveAttribute("role", "alert");
  });
});

describe("Field", () => {
  it("renders a div container with vertical flex and gap classes", () => {
    render(
      <Field data-testid="field-wrapper">
        <span>Field Content</span>
      </Field>
    );
    const wrapper = screen.getByTestId("field-wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe("DIV");
    expect(wrapper).toHaveClass("flex", "flex-col", "gap-1.5");
  });

  it("merges custom className with default classes", () => {
    render(
      <Field data-testid="styled-field" className="custom-field-class max-w-sm">
        <span>Field Content</span>
      </Field>
    );
    const wrapper = screen.getByTestId("styled-field");
    expect(wrapper).toHaveClass("custom-field-class", "max-w-sm", "flex", "flex-col", "gap-1.5");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Field ref={ref}>
        <span>Content</span>
      </Field>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.tagName).toBe("DIV");
  });

  it("composes Label, input control, and Hint properly", () => {
    render(
      <Field data-testid="profile-field">
        <Label htmlFor="bio" required>
          Biography
        </Label>
        <textarea id="bio" />
        <Hint id="bio-hint">Brief summary of your background</Hint>
      </Field>
    );

    const wrapper = screen.getByTestId("profile-field");
    expect(wrapper).toBeInTheDocument();

    const label = screen.getByText("Biography");
    expect(label).toHaveAttribute("for", "bio");
    expect(screen.getByText("*")).toBeInTheDocument();

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("id", "bio");

    const hint = screen.getByText("Brief summary of your background");
    expect(hint).toHaveAttribute("id", "bio-hint");
  });
});
