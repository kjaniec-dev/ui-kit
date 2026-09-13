import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPONENT_CATEGORIES, ComponentsView } from "./components-view";

describe("ComponentsView", () => {
  beforeEach(() => {
    // Clean up DOM between tests
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders categorized sidebar and components", () => {
    render(<ComponentsView />);
    expect(screen.getByRole("heading", { level: 1, name: "KJ Product Kit" })).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Inputs & Forms")).toBeInTheDocument();
    expect(screen.getByText("Data Display")).toBeInTheDocument();
    expect(screen.getByText("Overlays")).toBeInTheDocument();
  });

  it("sets link hrefs with #components/<id> prefix", () => {
    render(<ComponentsView />);
    expect(screen.getByRole("link", { name: /Buttons/i })).toHaveAttribute(
      "href",
      "#components/buttons"
    );
    expect(screen.getByRole("link", { name: /Cards/i })).toHaveAttribute(
      "href",
      "#components/cards"
    );
    expect(screen.getByRole("link", { name: /Rating/i })).toHaveAttribute(
      "href",
      "#components/rating"
    );
  });

  it("renders all 8 categories in the sidebar", () => {
    render(<ComponentsView />);
    const categoryNames = [
      "Foundations",
      "Inputs & Forms",
      "Data Display",
      "Feedback",
      "Navigation",
      "Overlays",
      "Layouts",
      "Data Visualization",
    ];
    for (const name of categoryNames) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("renders all 21 component items across categories in sidebar", () => {
    render(<ComponentsView />);
    const items = [
      "Buttons",
      "Badges",
      "Avatars & Stats",
      "Primitives",
      "Feedback",
      "Forms",
      "Selection",
      "Rating",
      "ColorPicker",
      "InPost GeoWidget",
      "Table & DataTable",
      "Cards",
      "Accordion",
      "Timeline & CodeBlock",
      "Image Gallery",
      "Navigation",
      "Overlays & Dialogs",
      "Popover & Tooltip",
      "InboxPopover",
      "Layouts",
      "Charts",
    ];
    for (const item of items) {
      // Multiple items may exist if in sidebar and in section headers, so getAllByText is safe
      const matches = screen.getAllByText(item);
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it("renders the embedded section components with target IDs", () => {
    const { container } = render(<ComponentsView />);
    const expectedIds = [
      "buttons",
      "badges",
      "avatars-stats",
      "primitives",
      "feedback",
      "forms",
      "selection",
      "rating",
      "color-picker",
      "inpost-geowidget",
      "data",
      "cards",
      "accordion",
      "timeline-code",
      "gallery",
      "navigation",
      "overlays",
      "popover",
      "inbox-popover",
      "layouts",
      "charts",
    ];
    for (const id of expectedIds) {
      const el = container.querySelector(`#${id}`);
      expect(el).not.toBeNull();
    }
  });

  it("filters components by search query matching component label", () => {
    render(<ComponentsView />);
    const searchInput = screen.getByLabelText("Filter components");
    fireEvent.change(searchInput, { target: { value: "rating" } });

    // Inputs & Forms should be visible because Rating is in it
    expect(screen.getByText("Inputs & Forms")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rating/i })).toBeInTheDocument();

    // Foundations should not be visible
    expect(screen.queryByText("Foundations")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Buttons/i })).not.toBeInTheDocument();
  });

  it("filters components by search query matching category name", () => {
    render(<ComponentsView />);
    const searchInput = screen.getByLabelText("Filter components");
    fireEvent.change(searchInput, { target: { value: "Foundations" } });

    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Buttons/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Badges/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Primitives/i })).toBeInTheDocument();

    // Data Display should be filtered out
    expect(screen.queryByText("Data Display")).not.toBeInTheDocument();
  });

  it("filters components by keyword matching", () => {
    render(<ComponentsView />);
    const searchInput = screen.getByLabelText("Filter components");
    // "modal" is a keyword in Overlays
    fireEvent.change(searchInput, { target: { value: "modal" } });

    expect(screen.getByText("Overlays")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Overlays/i })).toBeInTheDocument();
    expect(screen.queryByText("Foundations")).not.toBeInTheDocument();
  });

  it("displays empty state message when search query has no matches", () => {
    render(<ComponentsView />);
    const searchInput = screen.getByLabelText("Filter components");
    fireEvent.change(searchInput, { target: { value: "nonexistent123" } });

    expect(screen.getByText(/no components found/i)).toBeInTheDocument();
    expect(screen.queryByText("Foundations")).not.toBeInTheDocument();
  });

  it("sets active section and scrolls into view when initialSection is provided", () => {
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    render(<ComponentsView initialSection="cards" />);
    // Active link for cards should have active classes or active dot
    const cardsLink = screen.getByRole("link", { name: /Cards/i });
    expect(cardsLink).toHaveClass("bg-primary/10");
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("updates active section and scrolls when initialSection prop changes", () => {
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;

    const { rerender } = render(<ComponentsView initialSection="buttons" />);
    const buttonsLink = screen.getByRole("link", { name: /Buttons/i });
    expect(buttonsLink).toHaveClass("bg-primary/10");

    rerender(<ComponentsView initialSection="selection" />);
    const selectionLink = screen.getByRole("link", { name: /Selection/i });
    expect(selectionLink).toHaveClass("bg-primary/10");
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("calls onSelectSection and scrolls when sidebar link is clicked", () => {
    const scrollSpy = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollSpy;
    const onSelectSection = vi.fn();

    render(<ComponentsView onSelectSection={onSelectSection} />);
    const cardsLink = screen.getByRole("link", { name: /Cards/i });
    fireEvent.click(cardsLink);

    expect(onSelectSection).toHaveBeenCalledWith("cards");
    expect(cardsLink).toHaveClass("bg-primary/10");
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("opens and closes the mobile drawer", () => {
    render(<ComponentsView />);
    const openBtn = screen.getByRole("button", { name: /open component navigation/i });
    fireEvent.click(openBtn);

    const closeBtn = screen.getByRole("button", { name: /close component navigation/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(
      screen.queryByRole("button", { name: /close component navigation/i })
    ).not.toBeInTheDocument();
  });

  it("exports COMPONENT_CATEGORIES with all 8 categories and 21 items in sequential order", () => {
    expect(COMPONENT_CATEGORIES).toHaveLength(8);
    expect(COMPONENT_CATEGORIES.map((c) => c.name)).toEqual([
      "Foundations",
      "Feedback",
      "Inputs & Forms",
      "Data Display",
      "Navigation",
      "Overlays",
      "Layouts",
      "Data Visualization",
    ]);
    const totalItems = COMPONENT_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    expect(totalItems).toBe(21);
  });

  it("renders Charts navigation link and section", () => {
    const { container } = render(<ComponentsView />);
    expect(screen.getByRole("link", { name: /Charts/i })).toHaveAttribute(
      "href",
      "#components/charts"
    );
    expect(container.querySelector("#charts")).not.toBeNull();
  });

  it("renders DOM sections in the exact sequential order of the sidebar categories", () => {
    const { container } = render(<ComponentsView />);
    const expectedIds = COMPONENT_CATEGORIES.flatMap((c) => c.items.map((i) => i.id));
    const domElements = expectedIds
      .map((id) => container.querySelector(`section#${id}`))
      .filter(Boolean);

    expect(domElements).toHaveLength(expectedIds.length);

    // Verify each section appears after the previous one in document position
    for (let i = 0; i < domElements.length - 1; i++) {
      const current = domElements[i]!;
      const next = domElements[i + 1]!;
      const position = current.compareDocumentPosition(next);
      // Node.DOCUMENT_POSITION_FOLLOWING is 4
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
