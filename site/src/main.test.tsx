import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./main";

describe("App Root Integration", () => {
  beforeEach(() => {
    window.location.hash = "";
    document.documentElement.className = "";
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders header, default overview view, and common footer", () => {
    render(<App />);

    // Header brand
    expect(screen.getByRole("button", { name: /KJ Product Kit/i })).toBeInTheDocument();
    expect(screen.getAllByText(/v0\.9\.3/i).length).toBeGreaterThan(0);

    // Overview default view
    expect(
      screen.getByText(
        /React 19 & Tailwind 4 design system for B2B SaaS, dashboards, and developer tooling\./i
      )
    ).toBeInTheDocument();

    // Common footer
    expect(screen.getByText(/All rights reserved\./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /v0\.9\.3/i })).toHaveAttribute(
      "href",
      "https://github.com/kjaniec-dev/ui-kit"
    );
  });

  it("switches to components view when tab is clicked", () => {
    render(<App />);
    const componentsTab = screen.getByRole("button", { name: /^Components$/i });
    fireEvent.click(componentsTab);

    expect(window.location.hash).toBe("#components");
    expect(screen.getByRole("heading", { level: 1, name: "KJ Product Kit" })).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
  });

  it("switches to patterns view when tab is clicked", () => {
    render(<App />);
    const patternsTab = screen.getByRole("button", { name: /^Patterns$/i });
    fireEvent.click(patternsTab);

    expect(window.location.hash).toBe("#patterns");
    expect(screen.getByRole("heading", { name: /B2B Product Patterns/i })).toBeInTheDocument();
  });

  it("switches to tokens view when tab is clicked", () => {
    render(<App />);
    const tokensTab = screen.getByRole("button", { name: /^Tokens$/i });
    fireEvent.click(tokensTab);

    expect(window.location.hash).toBe("#tokens");
    expect(screen.getByRole("heading", { name: /Design Tokens/i })).toBeInTheDocument();
  });

  it("switches to mcp view when tab is clicked", () => {
    render(<App />);
    const mcpTab = screen.getByRole("button", { name: /^MCP/i });
    fireEvent.click(mcpTab);

    expect(window.location.hash).toBe("#mcp");
    expect(screen.getByRole("heading", { name: /Model Context Protocol/i })).toBeInTheDocument();
  });

  it("responds to browser hashchange event", () => {
    render(<App />);
    expect(screen.getByText(/Design Tokens & OKLCH/i)).toBeInTheDocument();

    act(() => {
      window.location.hash = "#tokens";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(screen.getByRole("heading", { name: /Design Tokens/i })).toBeInTheDocument();
  });

  it("toggles dark mode on root element", () => {
    render(<App />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    const themeToggle = screen.getByRole("button", { name: /Toggle theme/i });
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("opens mobile navigation menu and navigates to selected tab", () => {
    render(<App />);

    const mobileMenuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(mobileMenuButton);

    const mobileNav = screen.getByTestId("mobile-nav-menu");
    expect(mobileNav).toBeInTheDocument();

    // Click Patterns inside mobile nav
    const patternsMobileBtn = within(mobileNav).getByRole("button", { name: /^Patterns$/i });
    fireEvent.click(patternsMobileBtn);

    expect(window.location.hash).toBe("#patterns");
    expect(screen.getByRole("heading", { name: /B2B Product Patterns/i })).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });
});
