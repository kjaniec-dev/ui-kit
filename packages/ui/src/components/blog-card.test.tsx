// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { BlogCard } from "./blog-card";

describe("BlogCard", () => {
  it("renders title, category, author, and reading time", () => {
    render(
      <BlogCard
        title="Building Modern Monorepos"
        description="A practical guide to component libraries."
        category="Architecture"
        readTime="5 min read"
        author={{ name: "Krystian Janiec", role: "Staff Engineer" }}
      />
    );

    expect(screen.getByText("Building Modern Monorepos")).toBeInTheDocument();
    expect(screen.getByText("A practical guide to component libraries.")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    expect(screen.getByText("Krystian Janiec")).toBeInTheDocument();
  });

  it("renders image cover with alt text", () => {
    render(
      <BlogCard
        title="Design Systems"
        coverUrl="https://example.com/cover.png"
        coverAlt="Design system cover"
      />
    );

    const img = screen.getByAltText("Design system cover");
    expect(img).toHaveAttribute("src", "https://example.com/cover.png");
  });

  it("renders an anchor element when href is provided with target support", () => {
    render(
      <BlogCard
        title="Link Card"
        href="https://example.com/blog/1"
        target="_blank"
        rel="noopener noreferrer"
      />
    );

    const link = screen.getByRole("link", { name: /link card/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/blog/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies sm:flex-row class when orientation is horizontal", () => {
    const { container } = render(
      <BlogCard
        title="Horizontal Card"
        orientation="horizontal"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("sm:flex-row");
  });
});
