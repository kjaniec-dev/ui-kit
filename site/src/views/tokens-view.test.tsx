import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TokensView } from "./tokens-view";

describe("TokensView", () => {
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

  it("renders color scales and design tokens", () => {
    render(<TokensView />);
    expect(screen.getByRole("heading", { name: /KJ Product Kit/i })).toBeInTheDocument();
    expect(screen.getByText(/Primary Amber/i)).toBeInTheDocument();
    expect(screen.getByText(/Secondary Teal/i)).toBeInTheDocument();
    expect(screen.getByText(/Border Radius/i)).toBeInTheDocument();
    expect(screen.getByText(/Elevation & Shadows/i)).toBeInTheDocument();
  });

  it("renders all color steps from 50 to 950 for Primary Amber", () => {
    render(<TokensView />);
    const amberSteps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
    for (const step of amberSteps) {
      expect(screen.getByTestId(`swatch-primary-${step}`)).toBeInTheDocument();
    }
  });

  it("renders all color steps from 50 to 950 for Secondary Teal", () => {
    render(<TokensView />);
    const tealSteps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
    for (const step of tealSteps) {
      expect(screen.getByTestId(`swatch-secondary-${step}`)).toBeInTheDocument();
    }
  });

  it("renders all color steps from 50 to 950 for Zinc / Neutrals", () => {
    render(<TokensView />);
    expect(screen.getByText(/Zinc \/ Neutrals/i)).toBeInTheDocument();
    const zincSteps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
    for (const step of zincSteps) {
      expect(screen.getByTestId(`swatch-zinc-${step}`)).toBeInTheDocument();
    }
  });

  it("renders semantic tokens with roles Surface, Border, Success, Destructive, Info, Muted, Warning", () => {
    render(<TokensView />);
    expect(screen.getByText(/Semantic Tokens/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Surface$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Border$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Success$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Destructive$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Info$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Muted$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Warning$/i })).toBeInTheDocument();
  });

  it("renders OKLCH values, hex codes, and CSS variable / Tailwind utility classes", () => {
    render(<TokensView />);
    // Check for presence of oklch string
    expect(screen.getAllByText(/oklch\(/i).length).toBeGreaterThan(0);
    // Check for css variable names
    expect(screen.getByText(/--kj-primary-500/i)).toBeInTheDocument();
    expect(screen.getByText(/--kj-secondary-500/i)).toBeInTheDocument();
    expect(screen.getByText(/--kj-surface/i)).toBeInTheDocument();
  });

  it("renders border radius visual scale cards for rounded-kj-sm, md, lg, full", () => {
    render(<TokensView />);
    expect(screen.getByText(/rounded-kj-sm/i)).toBeInTheDocument();
    expect(screen.getByText(/rounded-kj-md/i)).toBeInTheDocument();
    expect(screen.getByText(/rounded-kj-lg/i)).toBeInTheDocument();
    expect(screen.getByText(/rounded-kj-full/i)).toBeInTheDocument();
  });

  it("renders elevation & shadows visual scale cards for shadow-kj-sm, md, lg, glow", () => {
    render(<TokensView />);
    expect(screen.getByText(/shadow-kj-sm/i)).toBeInTheDocument();
    expect(screen.getByText(/shadow-kj-md/i)).toBeInTheDocument();
    expect(screen.getByText(/shadow-kj-lg/i)).toBeInTheDocument();
    expect(screen.getByText(/shadow-kj-glow/i)).toBeInTheDocument();
  });

  it("renders typography ramp with UI font and Monospace font previews and font weights", () => {
    render(<TokensView />);
    expect(screen.getByText(/Typography Ramp/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /UI Font \(Inter\)/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Code Font \(JetBrains Mono\)/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Regular \(400\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Medium \(500\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Semibold \(600\)/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bold \(700\)/i).length).toBeGreaterThanOrEqual(1);
  });

  it("copies token value on swatch click and provides feedback", async () => {
    render(<TokensView />);
    const swatch = screen.getByTestId("swatch-primary-500");
    fireEvent.click(swatch);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("--kj-primary-500");
    await waitFor(() => {
      expect(screen.getAllByText(/Copied!/i).length).toBeGreaterThan(0);
    });
  });

  it("handles clipboard failure gracefully without crashing", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")) },
      configurable: true,
      writable: true,
    });

    render(<TokensView />);
    const swatch = screen.getByTestId("swatch-primary-500");
    // Clicking should not throw
    expect(() => fireEvent.click(swatch)).not.toThrow();
  });

  it("copies token value via the single interactive button target on semantic token card", async () => {
    render(<TokensView />);
    const copyButtons = screen.getAllByRole("button", { name: /^Copy$/i });
    expect(copyButtons.length).toBeGreaterThan(0);

    // Click first semantic token copy button (Surface)
    fireEvent.click(copyButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("--kj-surface");
    await waitFor(() => {
      expect(screen.getAllByText(/Copied!/i).length).toBeGreaterThan(0);
    });
  });

  it("copies radius token class via the copy button target", async () => {
    render(<TokensView />);
    const copyClassButtons = screen.getAllByRole("button", { name: /Copy Class/i });
    expect(copyClassButtons.length).toBeGreaterThan(0);

    // Click first radius token copy button
    fireEvent.click(copyClassButtons[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("rounded-kj-sm");
    await waitFor(() => {
      expect(screen.getAllByText(/Copied!/i).length).toBeGreaterThan(0);
    });
  });
});
