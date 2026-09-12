import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders KJ Product Kit brand title and version", () => {
    render(
      <SiteHeader activeTab="overview" onSelectTab={vi.fn()} dark={false} onToggleDark={vi.fn()} />
    );
    expect(screen.getByText("KJ Product Kit")).toBeInTheDocument();
    expect(screen.getByText(/v0\.9\.3/)).toBeInTheDocument();
  });

  it("calls onSelectTab when tab is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SiteHeader activeTab="overview" onSelectTab={onSelect} dark={false} onToggleDark={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /Components/i }));
    expect(onSelect).toHaveBeenCalledWith("components");
  });

  it("renders all 5 navigation tabs and displays MCP AI badge", () => {
    render(
      <SiteHeader
        activeTab="components"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /^Overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Components/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Patterns/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Tokens/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /MCP/i })).toBeInTheDocument();
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("sets aria-current='page' on active tab button and omits it on inactive tabs", () => {
    render(
      <SiteHeader
        activeTab="components"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
      />
    );
    const activeBtn = screen.getByRole("button", { name: /^Components/i });
    expect(activeBtn).toHaveAttribute("aria-current", "page");

    const inactiveBtn = screen.getByRole("button", { name: /^Overview/i });
    expect(inactiveBtn).not.toHaveAttribute("aria-current");
  });

  it("calls onSelectTab with 'overview' when brand title is clicked", () => {
    const onSelect = vi.fn();
    render(
      <SiteHeader activeTab="patterns" onSelectTab={onSelect} dark={false} onToggleDark={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: /KJ Product Kit/i }));
    expect(onSelect).toHaveBeenCalledWith("overview");
  });

  it("calls onToggleDark when theme toggle button is clicked", () => {
    const onToggleDark = vi.fn();
    render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={onToggleDark}
      />
    );
    const themeButton = screen.getByRole("button", { name: /Toggle theme/i });
    expect(themeButton).toBeInTheDocument();
    fireEvent.click(themeButton);
    expect(onToggleDark).toHaveBeenCalledTimes(1);
  });

  it("renders external GitHub link", () => {
    render(
      <SiteHeader activeTab="overview" onSelectTab={vi.fn()} dark={false} onToggleDark={vi.fn()} />
    );
    const githubLink = screen.getByRole("link", { name: /GitHub/i });
    expect(githubLink).toHaveAttribute("href", "https://github.com/kjaniec-dev/ui-kit");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noreferrer");
  });

  it("handles mobile menu button visibility and click when showMobileMenuButton is true", () => {
    const onToggleMobileMenu = vi.fn();
    const { rerender } = render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
        showMobileMenuButton={true}
        mobileMenuOpen={false}
        onToggleMobileMenu={onToggleMobileMenu}
      />
    );

    const openButton = screen.getByRole("button", { name: "Open menu" });
    expect(openButton).toBeInTheDocument();
    fireEvent.click(openButton);
    expect(onToggleMobileMenu).toHaveBeenCalledTimes(1);

    rerender(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
        showMobileMenuButton={true}
        mobileMenuOpen={true}
        onToggleMobileMenu={onToggleMobileMenu}
      />
    );
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("does not render mobile menu button when showMobileMenuButton is false or omitted", () => {
    render(
      <SiteHeader activeTab="overview" onSelectTab={vi.fn()} dark={false} onToggleDark={vi.fn()} />
    );
    expect(screen.queryByRole("button", { name: /menu/i })).not.toBeInTheDocument();
  });

  it("renders search button when onOpenSearch is provided and triggers callback on click", () => {
    const onOpenSearch = vi.fn();
    render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
        onOpenSearch={onOpenSearch}
      />
    );

    const searchBtn = screen.getByRole("button", { name: /Search documentation/i });
    expect(searchBtn).toBeInTheDocument();
    fireEvent.click(searchBtn);
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it("renders Storybook link pointing to Chromatic", () => {
    render(
      <SiteHeader activeTab="overview" onSelectTab={vi.fn()} dark={false} onToggleDark={vi.fn()} />
    );
    const storybookLink = screen.getByRole("link", { name: /Storybook on Chromatic/i });
    expect(storybookLink).toBeInTheDocument();
    expect(storybookLink).toHaveAttribute(
      "href",
      "https://6a1aa334e443b4184c139a6c-ybeikhkasj.chromatic.com/"
    );
    expect(storybookLink).toHaveAttribute("target", "_blank");
  });

  it("renders shortcuts button when onOpenShortcuts is provided and triggers callback", () => {
    const onOpenShortcuts = vi.fn();
    render(
      <SiteHeader
        activeTab="overview"
        onSelectTab={vi.fn()}
        dark={false}
        onToggleDark={vi.fn()}
        onOpenShortcuts={onOpenShortcuts}
      />
    );

    const shortcutsBtn = screen.getByRole("button", { name: /View keyboard shortcuts/i });
    expect(shortcutsBtn).toBeInTheDocument();
    fireEvent.click(shortcutsBtn);
    expect(onOpenShortcuts).toHaveBeenCalledTimes(1);
  });
});
