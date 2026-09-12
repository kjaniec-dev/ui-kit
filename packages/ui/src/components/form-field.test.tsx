import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./form-field";

describe("FormField", () => {
  describe("rendering and label association", () => {
    it("renders the label and associates it with the child input via generated id", () => {
      render(
        <FormField label="First Name">
          <input type="text" />
        </FormField>
      );

      const input = screen.getByLabelText("First Name");
      expect(input).toBeInTheDocument();
      expect(input.id).toBeTruthy();
    });

    it("preserves child custom id if one is already provided", () => {
      render(
        <FormField label="Email">
          <input type="email" id="custom-email-id" />
        </FormField>
      );

      const input = document.getElementById("custom-email-id");
      expect(input).toBeInTheDocument();
      expect(input?.getAttribute("type")).toBe("email");
    });
  });

  describe("hint and error handling with ARIA linking", () => {
    it("renders hint and links child input via aria-describedby", () => {
      render(
        <FormField label="Username" hint="Choose a unique handle">
          <input type="text" />
        </FormField>
      );

      const hint = screen.getByText("Choose a unique handle");
      expect(hint).toBeInTheDocument();
      expect(hint).not.toHaveClass("text-danger");

      const input = screen.getByLabelText("Username");
      expect(input).toHaveAttribute("aria-describedby", hint.id);
      expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("renders error message, sets aria-invalid, and links via aria-describedby", () => {
      render(
        <FormField label="Password" error="Password must be at least 8 characters">
          <input type="password" />
        </FormField>
      );

      const errorEl = screen.getByText("Password must be at least 8 characters");
      expect(errorEl).toBeInTheDocument();
      expect(errorEl).toHaveClass("text-danger");

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", errorEl.id);
    });

    it("hides hint text when error is present and sets aria-invalid", () => {
      render(
        <FormField
          label="Password"
          hint="Must include numbers and letters"
          error="Password is required"
        >
          <input type="password" />
        </FormField>
      );

      expect(screen.queryByText("Must include numbers and letters")).not.toBeInTheDocument();
      const errorEl = screen.getByText("Password is required");
      expect(errorEl).toBeInTheDocument();

      const input = screen.getByLabelText("Password");
      expect(input).toHaveAttribute("aria-invalid", "true");
      // aria-describedby includes errorId
      expect(input.getAttribute("aria-describedby")).toContain(errorEl.id);
    });

    it("merges existing child aria-describedby with hint id", () => {
      render(
        <FormField label="Description" hint="Optional notes">
          <textarea aria-describedby="external-counter" />
        </FormField>
      );

      const hint = screen.getByText("Optional notes");
      const textarea = screen.getByLabelText("Description");
      const describedBy = textarea.getAttribute("aria-describedby");
      expect(describedBy).toContain(hint.id);
      expect(describedBy).toContain("external-counter");
    });

    it("leaves aria-describedby and aria-invalid undefined when no hint or error is set", () => {
      render(
        <FormField label="Simple Field">
          <input type="text" />
        </FormField>
      );

      const input = screen.getByLabelText("Simple Field");
      expect(input).not.toHaveAttribute("aria-describedby");
      expect(input).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("required prop behavior", () => {
    it("renders asterisk on label and marks child as required when required=true", () => {
      render(
        <FormField label="Required Input" required>
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText("*")).toBeInTheDocument();
      const input = screen.getByLabelText(/Required Input/i);
      expect(input).toBeRequired();
    });

    it("does not render asterisk or mark child as required when required is false or omitted", () => {
      render(
        <FormField label="Optional Input">
          <input type="text" />
        </FormField>
      );

      expect(screen.queryByText("*")).not.toBeInTheDocument();
      const input = screen.getByLabelText("Optional Input");
      expect(input).not.toBeRequired();
    });

    it("preserves child explicit required=false even when FormField has required=true", () => {
      render(
        <FormField label="Override Input" required>
          <input type="text" required={false} />
        </FormField>
      );

      const input = screen.getByLabelText(/Override Input/i);
      expect(input).not.toBeRequired();
    });

    it("preserves child explicit required=true when FormField required is omitted", () => {
      render(
        <FormField label="Child Required Input">
          <input type="text" required />
        </FormField>
      );

      const input = screen.getByLabelText("Child Required Input");
      expect(input).toBeRequired();
    });
  });

  describe("wrapper, ref, and HTML attributes", () => {
    it("renders wrapper div with kit classes and merges custom className", () => {
      const { container } = render(
        <FormField label="Styled Field" className="my-custom-form-field">
          <input type="text" />
        </FormField>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("flex", "flex-col", "gap-1.5", "w-full", "my-custom-form-field");
    });

    it("forwards ref to the wrapper HTMLDivElement", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <FormField ref={ref} label="Ref Field">
          <input type="text" />
        </FormField>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe("DIV");
    });

    it("passes standard div attributes like data-testid and id", () => {
      render(
        <FormField label="Test Field" data-testid="form-field-wrapper" id="custom-wrapper-id">
          <input type="text" />
        </FormField>
      );

      const wrapper = screen.getByTestId("form-field-wrapper");
      expect(wrapper).toHaveAttribute("id", "custom-wrapper-id");
    });

    it("throws an error when not provided with exactly one child element", () => {
      // Suppress console.error during expected throw
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => {
        render(
          // @ts-expect-error - testing invalid children
          <FormField label="No Children" />
        );
      }).toThrow();
      spy.mockRestore();
    });
  });
});
