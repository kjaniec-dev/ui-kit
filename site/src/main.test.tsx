import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./main";

describe("App Root Integration", () => {
  beforeEach(() => {
    localStorage.clear();
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

    // Common footer with MIT license and portfolio link
    expect(screen.getByText(/Open source under the/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /MIT License/i })).toHaveAttribute(
      "href",
      "https://github.com/kjaniec-dev/ui-kit/blob/main/LICENSE"
    );
    expect(screen.getByRole("link", { name: /Krzysztof Janiec/i })).toHaveAttribute(
      "href",
      "https://kjaniec.dev"
    );
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

  it("toggles dark mode on root element and persists preference in localStorage", () => {
    render(<App />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("kj-ui-theme")).toBeNull();

    const themeToggle = screen.getByRole("button", { name: /Toggle theme/i });
    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("kj-ui-theme")).toBe("dark");

    fireEvent.click(themeToggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("kj-ui-theme")).toBe("light");
  });

  it("restores dark mode preference from localStorage on mount", () => {
    localStorage.setItem("kj-ui-theme", "dark");
    render(<App />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("falls back to system prefers-color-scheme when localStorage is empty", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-color-scheme: dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      render(<App />);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("opens mobile navigation menu and navigates to selected tab", () => {
    render(<App />);

    const mobileMenuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(mobileMenuButton);

    const mobileNav = screen.getByTestId("mobile-nav-menu");
    expect(mobileNav).toBeInTheDocument();

    // Check external links in mobile nav
    expect(within(mobileNav).getByRole("link", { name: /GitHub Repository/i })).toHaveAttribute(
      "href",
      "https://github.com/kjaniec-dev/ui-kit"
    );
    expect(within(mobileNav).getByRole("link", { name: /Storybook \(Chromatic\)/i })).toHaveAttribute(
      "href",
      "https://6a1aa334e443b4184c139a6c-ybeikhkasj.chromatic.com/"
    );

    // Click Patterns inside mobile nav
    const patternsMobileBtn = within(mobileNav).getByRole("button", { name: /^Patterns$/i });
    fireEvent.click(patternsMobileBtn);

    expect(window.location.hash).toBe("#patterns");
    expect(screen.getByRole("heading", { name: /B2B Product Patterns/i })).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-nav-menu")).not.toBeInTheDocument();
  });

  it("opens global CommandPalette via search button and navigates to selected item", () => {
    render(<App />);

    const searchButton = screen.getByRole("button", { name: /Search documentation/i });
    fireEvent.click(searchButton);

    const dialog = screen.getByRole("dialog", { name: /Command palette/i });
    expect(dialog).toBeInTheDocument();

    // Select "Buttons & FAB" option
    const buttonOption = screen.getByText("Buttons & FAB");
    fireEvent.click(buttonOption);

    expect(window.location.hash).toBe("#components/buttons");
    expect(screen.queryByRole("dialog", { name: /Command palette/i })).not.toBeInTheDocument();
  });

  it("opens and closes global CommandPalette via Cmd+K and Escape keyboard shortcuts", () => {
    render(<App />);

    expect(screen.queryByRole("dialog", { name: /Command palette/i })).not.toBeInTheDocument();

    // Trigger Cmd+K
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog", { name: /Command palette/i })).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: /Command palette/i })).not.toBeInTheDocument();
  });

  it("opens ShortcutsDialog via '?' shortcut and closes via 'Got it'", () => {
    render(<App />);

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Got it/i }));
    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("toggles dark mode via 't' keyboard shortcut", () => {
    render(<App />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    fireEvent.keyDown(window, { key: "t" });
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.keyDown(window, { key: "t" });
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("switches tabs via numeric keys 1 through 5", () => {
    render(<App />);

    // Press '2' -> components
    fireEvent.keyDown(window, { key: "2" });
    expect(window.location.hash).toBe("#components");

    // Press '3' -> patterns
    fireEvent.keyDown(window, { key: "3" });
    expect(window.location.hash).toBe("#patterns");

    // Press '4' -> tokens
    fireEvent.keyDown(window, { key: "4" });
    expect(window.location.hash).toBe("#tokens");

    // Press '5' -> mcp
    fireEvent.keyDown(window, { key: "5" });
    expect(window.location.hash).toBe("#mcp");

    // Press '1' -> overview
    fireEvent.keyDown(window, { key: "1" });
    expect(window.location.hash).toBe("#overview");
  });
});
