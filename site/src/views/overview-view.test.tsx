import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OverviewView } from "./overview-view";

describe("OverviewView", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders hero headline and feature cards", () => {
    render(<OverviewView onNavigate={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /KJ Product Kit/i })).toBeInTheDocument();
    expect(screen.getByText(/Design Tokens & OKLCH/i)).toBeInTheDocument();
    expect(screen.getByText(/B2B Product Patterns/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-Native MCP Server/i)).toBeInTheDocument();
  });

  it("renders the hero tagline and all tech badges", () => {
    render(<OverviewView onNavigate={vi.fn()} />);
    expect(
      screen.getByText(
        /React 19 & Tailwind 4 design system for B2B SaaS, dashboards, and developer tooling\./i
      )
    ).toBeInTheDocument();

    const expectedBadges = [
      "50+ Components & 140+ Variants",
      "React 19",
      "Tailwind 4",
      "OKLCH Palette",
      "MCP Native",
      "TypeScript",
    ];
    for (const badge of expectedBadges) {
      expect(screen.getByText(badge)).toBeInTheDocument();
    }
  });

  it("navigates to components on CTA click", () => {
    const onNav = vi.fn();
    render(<OverviewView onNavigate={onNav} />);
    fireEvent.click(screen.getByRole("button", { name: /Explore Components/i }));
    expect(onNav).toHaveBeenCalledWith("components");
  });

  it("navigates to patterns on secondary CTA click", () => {
    const onNav = vi.fn();
    render(<OverviewView onNavigate={onNav} />);
    fireEvent.click(screen.getByRole("button", { name: /View Patterns/i }));
    expect(onNav).toHaveBeenCalledWith("patterns");
  });

  it("renders GitHub link pointing to the repository", () => {
    render(<OverviewView onNavigate={vi.fn()} />);
    const ghLink = screen.getByRole("link", { name: /GitHub/i });
    expect(ghLink).toHaveAttribute("href", "https://github.com/kjaniec-dev/ui-kit");
    expect(ghLink).toHaveAttribute("target", "_blank");
  });

  it("renders copyable terminal snippets and copies command to clipboard", async () => {
    render(<OverviewView onNavigate={vi.fn()} />);
    expect(screen.getByText("npm install @kjaniec-dev/ui @kjaniec-dev/design")).toBeInTheDocument();
    expect(screen.getByText("npx @kjaniec-dev/ui-mcp")).toBeInTheDocument();

    const copyButtons = screen.getAllByRole("button", { name: /copy/i });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);

    fireEvent.click(copyButtons[0]);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "npm install @kjaniec-dev/ui @kjaniec-dev/design"
      );
    });

    fireEvent.click(copyButtons[1]);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("npx @kjaniec-dev/ui-mcp");
    });
  });

  it("navigates from value pillar feature cards", () => {
    const onNav = vi.fn();
    render(<OverviewView onNavigate={onNav} />);

    // Tokens card action
    const tokensAction = screen.getByRole("button", { name: /Explore Tokens/i });
    fireEvent.click(tokensAction);
    expect(onNav).toHaveBeenCalledWith("tokens");

    // Patterns card action
    const patternsAction = screen.getByRole("button", { name: /Explore Patterns/i });
    fireEvent.click(patternsAction);
    expect(onNav).toHaveBeenCalledWith("patterns");

    // MCP card action
    const mcpAction = screen.getByRole("button", { name: /Explore MCP/i });
    fireEvent.click(mcpAction);
    expect(onNav).toHaveBeenCalledWith("mcp");
  });

  it("renders live interactive demo card with MetricCard, Segmented, Badge, and interactive feedback", async () => {
    render(<OverviewView onNavigate={vi.fn()} />);

    // Verify MetricCard and Badge
    expect(screen.getByText(/Monthly Recurring Revenue/i)).toBeInTheDocument();
    expect(screen.getByText("$48,250")).toBeInTheDocument();

    // Verify Segmented control
    const segmentedButtons = screen.getAllByRole("tab");
    expect(segmentedButtons.length).toBeGreaterThanOrEqual(2);

    // Click quarterly tab
    const quarterlyTab = screen.getByRole("tab", { name: /Quarterly/i });
    fireEvent.click(quarterlyTab);
    expect(screen.getByText("$144,750")).toBeInTheDocument();

    // Click interactive action button to trigger feedback
    const actionBtn = screen.getByRole("button", { name: /Trigger Action/i });
    fireEvent.click(actionBtn);

    // Toast status should appear
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
