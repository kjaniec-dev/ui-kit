import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type ComponentDoc, PropsTable } from "./props-table";

const mockDoc: ComponentDoc = {
  name: "Button",
  importPath: 'import { Button } from "@kjaniec-dev/ui";',
  description: "Interactive button with variants.",
  props: [
    {
      name: "variant",
      type: '"primary" | "secondary" | "danger"',
      optional: true,
      defaultValue: '"primary"',
      description: "Visual style variant.",
    },
    {
      name: "loading",
      type: "boolean",
      optional: true,
      defaultValue: null,
      description: "Shows spinner and disables clicking.",
    },
    {
      name: "children",
      type: "React.ReactNode",
      optional: false,
      defaultValue: null,
      description: "Button label or content.",
    },
    {
      name: "size",
      type: '"sm" | "md" | "lg"',
      optional: true,
      defaultValue: '"md"',
      description: "Size preset.",
    },
    {
      name: "disabled",
      type: "boolean",
      optional: true,
      defaultValue: "false",
      description: "Disables interaction.",
    },
    {
      name: "leadingIcon",
      type: "React.ReactNode",
      optional: true,
      defaultValue: null,
      description: "Icon before label.",
    },
  ],
  cva: {
    variants: {
      variant: ["primary", "secondary", "danger"],
      size: ["sm", "md", "lg"],
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
};

describe("PropsTable", () => {
  it("renders component title, description, and import statement", () => {
    render(<PropsTable doc={mockDoc} />);
    expect(screen.getByRole("heading", { level: 4, name: /Button/i })).toBeInTheDocument();
    expect(screen.getByText("Interactive button with variants.")).toBeInTheDocument();
    expect(screen.getByText('import { Button } from "@kjaniec-dev/ui";')).toBeInTheDocument();
  });

  it("renders CVA style variants and default tags", () => {
    render(<PropsTable doc={mockDoc} />);
    expect(screen.getByText("CVA Style Variants")).toBeInTheDocument();
    expect(screen.getByText("primary (default)")).toBeInTheDocument();
    expect(screen.getByText("secondary")).toBeInTheDocument();
  });

  it("renders props table with rows and required indicators", () => {
    render(<PropsTable doc={mockDoc} />);
    expect(screen.getByText("variant")).toBeInTheDocument();
    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.getByText("children")).toBeInTheDocument();
    expect(screen.getByTitle("Required prop")).toBeInTheDocument();
  });

  it("filters props via search input", () => {
    render(<PropsTable doc={mockDoc} />);
    const input = screen.getByLabelText("Filter Button props");
    fireEvent.change(input, { target: { value: "loading" } });

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.queryByText("children")).not.toBeInTheDocument();
  });

  it("copies import statement to clipboard", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<PropsTable doc={mockDoc} />);
    const copyBtn = screen.getByRole("button", { name: /copy import statement/i });
    fireEvent.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith('import { Button } from "@kjaniec-dev/ui";');
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
