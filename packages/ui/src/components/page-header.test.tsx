import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders title in an h1 heading", () => {
    render(<PageHeader title="Dashboard Overview" />);
    const heading = screen.getByRole("heading", { level: 1, name: "Dashboard Overview" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass(
      "font-sans",
      "text-4xl",
      "font-bold",
      "tracking-tight",
      "text-foreground"
    );
  });

  it("renders inside a header element with standard padding", () => {
    const { container } = render(<PageHeader title="Settings" />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("py-12", "md:py-16");
  });

  it("renders eyebrow text when provided", () => {
    render(<PageHeader title="Projects" eyebrow="Portfolio" />);
    const eyebrow = screen.getByText("Portfolio");
    expect(eyebrow).toBeInTheDocument();
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow).toHaveClass(
      "font-mono",
      "text-xs",
      "font-bold",
      "uppercase",
      "tracking-[0.2em]",
      "text-primary"
    );
  });

  it("does not render eyebrow paragraph when omitted", () => {
    render(<PageHeader title="Projects" />);
    expect(screen.queryByText(/portfolio/i)).not.toBeInTheDocument();
  });

  it("renders description text when provided", () => {
    const descriptionText = "A list of all recent projects and active deployments.";
    render(<PageHeader title="Projects" description={descriptionText} />);
    const description = screen.getByText(descriptionText);
    expect(description).toBeInTheDocument();
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass(
      "text-base",
      "leading-relaxed",
      "text-muted-foreground",
      "sm:text-lg"
    );
  });

  it("does not render description paragraph when omitted", () => {
    const { container } = render(<PageHeader title="Projects" eyebrow="Portfolio" />);
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0].textContent).toBe("Portfolio");
  });

  it("renders eyebrow, title, and description together", () => {
    render(
      <PageHeader
        eyebrow="Documentation"
        title="Getting Started"
        description="Learn how to integrate the UI kit into your project."
      />
    );
    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Getting Started" })).toBeInTheDocument();
    expect(
      screen.getByText("Learn how to integrate the UI kit into your project.")
    ).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <PageHeader
        title="Team Members"
        actions={
          <div data-testid="actions-content">
            <button type="button">Invite User</button>
            <button type="button">Export CSV</button>
          </div>
        }
      />
    );
    expect(screen.getByTestId("actions-content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite User" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });

  it("does not render actions wrapper when actions is omitted", () => {
    const { container } = render(<PageHeader title="Team Members" />);
    expect(container.querySelector(".flex.flex-wrap.gap-3")).not.toBeInTheDocument();
  });

  it("forwards ref to the header element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<PageHeader ref={ref} title="With Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("HEADER");
  });

  it("has displayName set to 'PageHeader'", () => {
    expect(PageHeader.displayName).toBe("PageHeader");
  });
});
