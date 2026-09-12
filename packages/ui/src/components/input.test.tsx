import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input, Textarea, TextField } from "./input";

describe("Input", () => {
  it("renders a standard text input", () => {
    render(<Input placeholder="Enter username" />);
    const input = screen.getByPlaceholderText("Enter username");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveClass("border-input");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("handles onChange event when typing", () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    fireEvent.change(input, { target: { value: "test value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe("test value");
  });

  it("handles onFocus and onBlur events", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Focus test" />);
    const input = screen.getByPlaceholderText("Focus test");
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("renders visual error state and aria-invalid when error is true", () => {
    render(<Input error placeholder="Error state" />);
    const input = screen.getByPlaceholderText("Error state");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("border-danger", "focus:border-danger");
    expect(input).not.toHaveClass("border-input");
  });

  it("does not set aria-invalid when error is false", () => {
    render(<Input error={false} placeholder="Valid state" />);
    const input = screen.getByPlaceholderText("Valid state");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveClass("border-input");
  });

  it("respects disabled attribute", () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
  });

  it("renders leadingIcon inside a container and adds pl-[2.3rem] to input", () => {
    render(
      <Input
        leadingIcon={<span data-testid="search-icon">🔍</span>}
        placeholder="Search..."
      />
    );
    const icon = screen.getByTestId("search-icon");
    expect(icon).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toHaveClass("pl-[2.3rem]");
  });

  it("forwards ref to the underlying HTML input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe("Ref test");
  });

  it("supports HTML input attributes like type, name, readOnly", () => {
    render(<Input type="email" name="user_email" readOnly placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "user_email");
    expect(input).toHaveAttribute("readonly");
  });

  it("merges custom className with default styles", () => {
    render(<Input className="custom-input-class" placeholder="Custom" />);
    const input = screen.getByPlaceholderText("Custom");
    expect(input).toHaveClass("custom-input-class", "w-full", "bg-surface");
  });
});

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea placeholder="Enter biography" />);
    const textarea = screen.getByPlaceholderText("Enter biography");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveClass("border-input", "min-h-[84px]", "resize-y");
    expect(textarea).not.toHaveAttribute("aria-invalid");
  });

  it("handles onChange events", () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} placeholder="Message" />);
    const textarea = screen.getByPlaceholderText("Message");
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((textarea as HTMLTextAreaElement).value).toBe("Hello world");
  });

  it("renders error state with aria-invalid and border-danger", () => {
    render(<Textarea error placeholder="Error textarea" />);
    const textarea = screen.getByPlaceholderText("Error textarea");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveClass("border-danger", "focus:border-danger");
    expect(textarea).not.toHaveClass("border-input");
  });

  it("does not set aria-invalid when error is false", () => {
    render(<Textarea error={false} placeholder="Normal textarea" />);
    const textarea = screen.getByPlaceholderText("Normal textarea");
    expect(textarea).not.toHaveAttribute("aria-invalid");
    expect(textarea).toHaveClass("border-input");
  });

  it("respects disabled state", () => {
    render(<Textarea disabled placeholder="Disabled textarea" />);
    const textarea = screen.getByPlaceholderText("Disabled textarea");
    expect(textarea).toBeDisabled();
  });

  it("forwards ref to the underlying HTML textarea element", () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} placeholder="Ref textarea" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.placeholder).toBe("Ref textarea");
  });

  it("supports HTML attributes like rows, cols, and custom className", () => {
    render(<Textarea rows={6} className="custom-textarea" placeholder="Area" />);
    const textarea = screen.getByPlaceholderText("Area");
    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toHaveClass("custom-textarea");
  });
});

describe("TextField", () => {
  it("renders label associated with input via getByLabelText", () => {
    render(<TextField label="Email Address" placeholder="alex@example.com" />);
    const input = screen.getByLabelText("Email Address");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "alex@example.com");
  });

  it("renders hint text and associates it via aria-describedby", () => {
    render(
      <TextField
        label="Username"
        hint="Must be between 3-20 characters"
        placeholder="johndoe"
      />
    );
    const hint = screen.getByText("Must be between 3-20 characters");
    expect(hint).toBeInTheDocument();
    const input = screen.getByLabelText("Username");
    expect(input).toHaveAttribute("aria-describedby", hint.id);
  });

  it("renders error message, sets aria-invalid, and links via aria-describedby", () => {
    render(
      <TextField
        label="Password"
        error="Password is too short"
        type="password"
      />
    );
    const errorEl = screen.getByText("Password is too short");
    expect(errorEl).toBeInTheDocument();
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", errorEl.id);
    expect(input).toHaveClass("border-danger");
  });

  it("hides hint when error is present", () => {
    render(
      <TextField
        label="Password"
        hint="Must be at least 8 characters"
        error="Password is required"
      />
    );
    expect(screen.queryByText("Must be at least 8 characters")).not.toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("indicates required state on label and sets required attribute on input", () => {
    render(<TextField label="Full Name" required />);
    const input = screen.getByLabelText(/Full Name/i);
    expect(input).toBeRequired();
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("forwards ref to the underlying HTML input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="Field with Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("handles input change events", () => {
    const handleChange = vi.fn();
    render(<TextField label="Search" onChange={handleChange} />);
    const input = screen.getByLabelText("Search");
    fireEvent.change(input, { target: { value: "query text" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toBe("query text");
  });

  it("renders leadingIcon inside TextField", () => {
    render(
      <TextField
        label="Icon Field"
        leadingIcon={<span data-testid="field-icon">@</span>}
      />
    );
    expect(screen.getByTestId("field-icon")).toBeInTheDocument();
    const input = screen.getByLabelText("Icon Field");
    expect(input).toHaveClass("pl-[2.3rem]");
  });

  it("merges custom className on the FormField container", () => {
    const { container } = render(
      <TextField label="Container Styled" className="custom-container-class" />
    );
    expect(container.firstChild).toHaveClass("custom-container-class");
  });
});
