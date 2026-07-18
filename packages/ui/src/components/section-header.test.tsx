import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("renders title, kicker, description, and actions correctly via props", () => {
    render(
      <SectionHeader
        kicker="Overview"
        title="Main Features"
        description="A list of awesome features"
        actions={<button>Click Me</button>}
      />
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Main Features" })).toBeInTheDocument();
    expect(screen.getByText("A list of awesome features")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
  });

  it("supports custom heading levels", () => {
    render(<SectionHeader title="Subsection" headingLevel="h3" />);
    expect(screen.getByRole("heading", { level: 3, name: "Subsection" })).toBeInTheDocument();
  });

  it("applies center alignment classes when align='center'", () => {
    const { container } = render(<SectionHeader title="Centered Title" align="center" />);
    const rootEl = container.firstElementChild;
    expect(rootEl).toHaveClass("text-center");
  });

  it("applies divider border class when divider is true", () => {
    const { container } = render(<SectionHeader title="Divided Header" divider />);
    const rootEl = container.firstElementChild;
    expect(rootEl).toHaveClass("border-b");
  });

  it("supports compound sub-component composition", () => {
    render(
      <SectionHeader align="center">
        <SectionHeader.Kicker>Custom Kicker</SectionHeader.Kicker>
        <SectionHeader.Title as="h4">Custom Title</SectionHeader.Title>
        <SectionHeader.Description>Custom Description</SectionHeader.Description>
        <SectionHeader.Actions>
          <button>Custom Action</button>
        </SectionHeader.Actions>
      </SectionHeader>
    );

    expect(screen.getByText("Custom Kicker")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "Custom Title" })).toBeInTheDocument();
    expect(screen.getByText("Custom Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom Action" })).toBeInTheDocument();
  });
});
