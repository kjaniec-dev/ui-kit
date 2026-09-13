// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./sparkline";

describe("Sparkline", () => {
  const data = [10, 25, 18, 40, 32, 55];

  it("renders an SVG line sparkline", () => {
    const { container } = render(<Sparkline data={data} aria-label="Revenue Trend" />);
    expect(screen.getByRole("img", { name: "Revenue Trend" })).toBeInTheDocument();
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("renders area variant with closed polygon fill", () => {
    const { container } = render(<Sparkline data={data} variant="area" />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2); // line + area fill
  });

  it("renders bar variant with rect elements", () => {
    const { container } = render(<Sparkline data={data} variant="bar" />);
    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(data.length);
  });

  it("renders highlight dot on last point when showEndDot is true", () => {
    const { container } = render(<Sparkline data={data} showEndDot />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
  });

  it("renders fallback when data is empty", () => {
    render(<Sparkline data={[]} aria-label="Empty Trend" />);
    expect(screen.getByRole("img", { name: "Empty Trend" })).toBeInTheDocument();
  });

  it("does not render dot when showEndDot is false or omitted", () => {
    const { container } = render(<Sparkline data={data} />);
    const circle = container.querySelector("circle");
    expect(circle).not.toBeInTheDocument();
  });

  it("renders with object data and dataKey", () => {
    const objectData = [
      { day: "Mon", revenue: 100 },
      { day: "Tue", revenue: 150 },
      { day: "Wed", revenue: 200 },
    ];
    const { container } = render(<Sparkline data={objectData} dataKey="revenue" />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });

  it("supports linear curve mode", () => {
    const { container } = render(<Sparkline data={data} curve="linear" />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    // Linear path uses L commands
    expect(path?.getAttribute("d")).toContain("L");
  });

  it("supports smooth curve mode by default", () => {
    const { container } = render(<Sparkline data={data} curve="smooth" />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    // Smooth path uses C cubic bezier commands
    expect(path?.getAttribute("d")).toContain("C");
  });

  it("renders linear gradient for area variant when showGradient is true", () => {
    const { container } = render(<Sparkline data={data} variant="area" showGradient />);
    const gradient = container.querySelector("linearGradient");
    expect(gradient).toBeInTheDocument();
  });

  it("renders area variant without gradient when showGradient is false", () => {
    const { container } = render(
      <Sparkline data={data} variant="area" showGradient={false} color="chart2" />
    );
    const gradient = container.querySelector("linearGradient");
    expect(gradient).not.toBeInTheDocument();
    const areaPath = container.querySelector("path.chart-sparkline-area");
    expect(areaPath).toBeInTheDocument();
  });

  it("applies custom strokeWidth and color token", () => {
    const { container } = render(<Sparkline data={data} strokeWidth={4} color="chart3" />);
    const linePath = container.querySelector("path.chart-sparkline-line");
    expect(linePath).toHaveAttribute("stroke-width", "4");
    expect(linePath).toHaveAttribute("stroke", "var(--kj-chart3, #0284c7)");
  });

  it("handles identical values (min === max) without division by zero errors", () => {
    const flatData = [50, 50, 50, 50];
    const { container } = render(<Sparkline data={flatData} />);
    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute("d")).not.toContain("NaN");
  });

  it("handles single data point gracefully", () => {
    const singlePoint = [42];
    const { container } = render(<Sparkline data={singlePoint} showEndDot />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
  });

  it("supports custom dimensions and class names", () => {
    const { container } = render(
      <Sparkline data={data} width={200} height={48} className="custom-sparkline" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-sparkline");
    expect(svg).toHaveAttribute("width", "200");
    expect(svg).toHaveAttribute("height", "48");
  });
});
