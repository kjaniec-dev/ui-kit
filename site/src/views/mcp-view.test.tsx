import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { McpView } from "./mcp-view";

describe("McpView", () => {
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

  it("renders MCP title and configuration sections", () => {
    render(<McpView />);
    expect(screen.getByRole("heading", { name: /Model Context Protocol/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Cursor/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Claude Desktop/i })).toBeInTheDocument();
    expect(screen.getByText("Cursor")).toBeInTheDocument();
    expect(screen.getByText("Claude Desktop")).toBeInTheDocument();
  });

  it("renders KJ Product Kit branding and overview explanation", () => {
    render(<McpView />);
    expect(screen.getAllByText(/KJ Product Kit/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/@kjaniec-dev\/ui-mcp/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/design-token-aware/i)).toBeInTheDocument();
  });

  it("renders 1-click copyable configurations for Cursor, Claude Desktop, and Antigravity", () => {
    render(<McpView />);
    expect(screen.getByRole("tab", { name: /Cursor/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Claude Desktop/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Antigravity/i })).toBeInTheDocument();

    // Default configuration (Cursor) details
    expect(screen.getAllByText(/\.cursor\/mcp\.json/i).length).toBeGreaterThan(0);
  });

  it("switches configuration tabs and displays appropriate config file path and content", () => {
    render(<McpView />);

    // Cursor tab is active by default
    expect(screen.getAllByText(/\.cursor\/mcp\.json/i).length).toBeGreaterThan(0);

    // Switch to Claude Desktop
    fireEvent.click(screen.getByRole("tab", { name: /Claude Desktop/i }));
    expect(screen.getAllByText(/claude_desktop_config\.json/i).length).toBeGreaterThan(0);

    // Switch to Antigravity stdio
    fireEvent.click(screen.getByRole("tab", { name: /Antigravity/i }));
    expect(screen.getAllByText(/npx -y @kjaniec-dev\/ui-mcp/i).length).toBeGreaterThan(0);
  });

  it("copies configuration to clipboard on copy button click", async () => {
    render(<McpView />);

    const copyBtn = screen.getByRole("button", { name: "Copy Configuration" });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  it("renders the tool catalog reference with list_components, get_component, get_tokens, and search_components", () => {
    render(<McpView />);
    const toolsSection = screen.getByRole("region", { name: /Tool Catalog Reference/i });

    // The 4 required tools
    expect(within(toolsSection).getByText("list_components")).toBeInTheDocument();
    expect(within(toolsSection).getByText("get_component")).toBeInTheDocument();
    expect(within(toolsSection).getByText("get_tokens")).toBeInTheDocument();
    expect(within(toolsSection).getByText("search_components")).toBeInTheDocument();

    // 140+ components mention
    expect(screen.getAllByText(/140\+/i).length).toBeGreaterThan(0);

    // Tool descriptions and parameters
    expect(
      within(toolsSection).getAllByText(/Fuzzy search for use cases and components/i).length
    ).toBeGreaterThan(0);
    expect(
      within(toolsSection).getByText(/CSS variables and Tailwind utility maps/i)
    ).toBeInTheDocument();
    expect(
      within(toolsSection).getByText(/Detailed props, JSDoc definitions, and story snippets/i)
    ).toBeInTheDocument();
  });

  it("renders simulated agent dialogue showing prompt, tool call, and generated compliant JSX", () => {
    render(<McpView />);
    const simSection = screen.getByRole("region", { name: /Simulated Agent Dialogue/i });

    // Prompt from user
    expect(within(simSection).getByText(/User Prompt/i)).toBeInTheDocument();

    // MCP Tool Call
    expect(within(simSection).getByText(/Agent Reasoning & MCP Tool Call/i)).toBeInTheDocument();
    expect(within(simSection).getByText("get_component")).toBeInTheDocument();

    // Generated JSX snippet
    expect(within(simSection).getByText(/Generated Compliant JSX/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MetricCard/i).length).toBeGreaterThan(0);
  });
});
