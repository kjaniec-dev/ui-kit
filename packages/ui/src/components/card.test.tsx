import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders a div by default with standard classes", () => {
    render(<Card data-testid="card-root">Default Card</Card>);
    const card = screen.getByTestId("card-root");

    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass(
      "bg-card",
      "text-card-foreground",
      "rounded-kj-xl",
      "overflow-hidden",
      "border"
    );
    expect(card).toHaveClass("border-border", "shadow-kj-sm");
    expect(card).not.toHaveClass("border-transparent", "shadow-kj-lg");
  });

  it("applies elevated styles when elevated is true", () => {
    render(
      <Card elevated data-testid="card-elevated">
        Elevated Card
      </Card>
    );
    const card = screen.getByTestId("card-elevated");

    expect(card).toHaveClass("border-transparent", "shadow-kj-lg");
    expect(card).not.toHaveClass("border-border", "shadow-kj-sm");
  });

  it("applies interactive hover and focus styles when interactive is true", () => {
    render(
      <Card interactive data-testid="card-interactive">
        Interactive Card
      </Card>
    );
    const card = screen.getByTestId("card-interactive");

    expect(card).toHaveClass(
      "cursor-pointer",
      "transition-all",
      "duration-300",
      "hover:-translate-y-1",
      "hover:shadow-kj-md",
      "focus-visible:ring-2"
    );
  });

  it("supports 'as' polymorphism for article, section, button, and anchor elements", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Card as="article" data-testid="card-poly">
        Article Card
      </Card>
    );
    let card = screen.getByTestId("card-poly");
    expect(card.tagName).toBe("ARTICLE");

    rerender(
      <Card as="section" data-testid="card-poly">
        Section Card
      </Card>
    );
    card = screen.getByTestId("card-poly");
    expect(card.tagName).toBe("SECTION");

    rerender(
      <Card as="button" onClick={handleClick} data-testid="card-poly">
        Button Card
      </Card>
    );
    card = screen.getByTestId("card-poly");
    expect(card.tagName).toBe("BUTTON");
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    rerender(
      <Card as="a" href="https://example.com" data-testid="card-poly">
        Link Card
      </Card>
    );
    card = screen.getByTestId("card-poly");
    expect(card.tagName).toBe("A");
    expect(card).toHaveAttribute("href", "https://example.com");
  });

  it("merges custom className onto Card container", () => {
    render(
      <Card className="custom-card-class p-4" data-testid="card-custom">
        Card
      </Card>
    );
    const card = screen.getByTestId("card-custom");

    expect(card).toHaveClass("custom-card-class", "p-4", "bg-card");
  });

  it("forwards ref to the underlying HTMLElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Card ref={ref} data-testid="card-ref">
        Card with ref
      </Card>
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("card-ref"));
  });

  it("has the correct displayName", () => {
    expect(Card.displayName).toBe("Card");
  });
});

describe("CardHeader", () => {
  it("renders with default layout styling and children", () => {
    render(<CardHeader data-testid="card-header">Header Content</CardHeader>);
    const header = screen.getByTestId("card-header");

    expect(header.tagName).toBe("DIV");
    expect(header).toHaveClass("p-[1.35rem]", "flex", "flex-col", "gap-1");
    expect(header).toHaveTextContent("Header Content");
  });

  it("merges custom className", () => {
    render(<CardHeader className="custom-header mb-2" data-testid="card-header" />);
    const header = screen.getByTestId("card-header");

    expect(header).toHaveClass("custom-header", "mb-2", "p-[1.35rem]");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardHeader ref={ref} data-testid="card-header-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("card-header-ref"));
  });

  it("has the correct displayName", () => {
    expect(CardHeader.displayName).toBe("CardHeader");
  });
});

describe("CardTitle", () => {
  it("renders as an h3 heading element with default styling", () => {
    render(<CardTitle>Settings Overview</CardTitle>);
    const heading = screen.getByRole("heading", { level: 3, name: "Settings Overview" });

    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H3");
    expect(heading).toHaveClass("m-0", "text-base", "font-bold", "tracking-[-0.01em]");
  });

  it("merges custom className", () => {
    render(<CardTitle className="text-xl text-primary">Custom Title</CardTitle>);
    const heading = screen.getByRole("heading", { level: 3, name: "Custom Title" });

    expect(heading).toHaveClass("text-xl", "text-primary", "m-0");
  });

  it("forwards ref to HTMLHeadingElement", () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<CardTitle ref={ref}>Ref Title</CardTitle>);

    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current?.tagName).toBe("H3");
  });

  it("has the correct displayName", () => {
    expect(CardTitle.displayName).toBe("CardTitle");
  });
});

describe("CardDescription", () => {
  it("renders as a paragraph element with muted styling", () => {
    render(<CardDescription>Manage your workspace preferences.</CardDescription>);
    const desc = screen.getByText("Manage your workspace preferences.");

    expect(desc.tagName).toBe("P");
    expect(desc).toHaveClass("m-0", "text-[0.85rem]", "text-muted-foreground");
  });

  it("merges custom className", () => {
    render(
      <CardDescription className="custom-desc line-clamp-2">Description line</CardDescription>
    );
    const desc = screen.getByText("Description line");

    expect(desc).toHaveClass("custom-desc", "line-clamp-2", "text-[0.85rem]");
  });

  it("forwards ref to HTMLParagraphElement", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<CardDescription ref={ref}>Ref Description</CardDescription>);

    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    expect(ref.current?.tagName).toBe("P");
  });

  it("has the correct displayName", () => {
    expect(CardDescription.displayName).toBe("CardDescription");
  });
});

describe("CardContent", () => {
  it("renders with padding styling and children", () => {
    render(<CardContent data-testid="card-content">Main Body</CardContent>);
    const content = screen.getByTestId("card-content");

    expect(content.tagName).toBe("DIV");
    expect(content).toHaveClass("px-[1.35rem]", "pb-[1.35rem]");
    expect(content).toHaveTextContent("Main Body");
  });

  it("merges custom className", () => {
    render(<CardContent className="space-y-4" data-testid="card-content" />);
    const content = screen.getByTestId("card-content");

    expect(content).toHaveClass("space-y-4", "px-[1.35rem]", "pb-[1.35rem]");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardContent ref={ref} data-testid="card-content-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("card-content-ref"));
  });

  it("has the correct displayName", () => {
    expect(CardContent.displayName).toBe("CardContent");
  });
});

describe("CardFooter", () => {
  it("renders with border, background, and flex styling", () => {
    render(<CardFooter data-testid="card-footer">Footer Actions</CardFooter>);
    const footer = screen.getByTestId("card-footer");

    expect(footer.tagName).toBe("DIV");
    expect(footer).toHaveClass(
      "flex",
      "gap-2.5",
      "px-[1.35rem]",
      "py-[1.1rem]",
      "border-t",
      "border-border",
      "bg-muted/40"
    );
    expect(footer).toHaveTextContent("Footer Actions");
  });

  it("merges custom className", () => {
    render(<CardFooter className="justify-end" data-testid="card-footer" />);
    const footer = screen.getByTestId("card-footer");

    expect(footer).toHaveClass("justify-end", "flex", "border-t");
  });

  it("forwards ref to HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardFooter ref={ref} data-testid="card-footer-ref" />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(screen.getByTestId("card-footer-ref"));
  });

  it("has the correct displayName", () => {
    expect(CardFooter.displayName).toBe("CardFooter");
  });
});

describe("Card composite integration", () => {
  it("renders complete card layout with header, title, description, content, and footer", () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Account Notification</CardTitle>
          <CardDescription>Configure how you receive alert emails.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Email delivery options are configured here.</p>
        </CardContent>
        <CardFooter>
          <button type="button">Cancel</button>
          <button type="submit">Save Changes</button>
        </CardFooter>
      </Card>
    );

    const card = screen.getByTestId("full-card");
    expect(card).toBeInTheDocument();

    const title = screen.getByRole("heading", { level: 3, name: "Account Notification" });
    expect(title).toBeInTheDocument();

    const desc = screen.getByText("Configure how you receive alert emails.");
    expect(desc).toBeInTheDocument();

    const bodyText = screen.getByText("Email delivery options are configured here.");
    expect(bodyText).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const saveButton = screen.getByRole("button", { name: "Save Changes" });
    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
  });
});
