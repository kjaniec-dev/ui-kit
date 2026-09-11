import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPONENT_CATEGORIES, ComponentsView } from "./components-view";

describe("ComponentsView", () => {
  beforeEach(() => {
    // Clean up DOM between tests
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
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

  it("renders all 7 categories in the sidebar", () => {
    render(<ComponentsView />);
    const categoryNames = [
      "Foundations",
      "Inputs & Forms",
      "Data Display",
      "Feedback",
      "Navigation",
      "Overlays",
      "Layouts",
    ];
    for (const name of categoryNames) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
  });

  it("renders all 15 component items across categories in sidebar", () => {
    render(<ComponentsView />);
    const items = [
      "Buttons",
      "Badges",
      "Primitives",
      "Forms",
      "Selection",
      "Rating",
      "ColorPicker",
      "InPost GeoWidget",
      "Table & DataTable",
      "Cards",
      "Feedback",
      "Navigation",
      "Overlays & Dialogs",
      "InboxPopover",
      "Layouts",
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
      "primitives",
      "forms",
      "selection",
      "rating",
      "color-picker",
      "inpost-geowidget",
      "cards",
      "data",
      "feedback",
      "navigation",
      "overlays",
      "inbox-popover",
      "layouts",
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

  it("exports COMPONENT_CATEGORIES with all 7 categories and 15 items", () => {
    expect(COMPONENT_CATEGORIES).toHaveLength(7);
    const totalItems = COMPONENT_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
    expect(totalItems).toBe(15);
  });
});
