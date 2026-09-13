import { describe, expect, it } from "vitest";
import {
  calculateBarLayout,
  calculateDonutSegments,
  generateAreaPath,
  generateLinePath,
  getNiceScale,
  linearScale,
} from "./chart-math";

describe("chart-math", () => {
  describe("getNiceScale", () => {
    it("generates clean round ticks for standard ranges", () => {
      const scale = getNiceScale(0, 95, 5);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(100);
      expect(scale.ticks).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it("handles identical min and max gracefully", () => {
      const scale = getNiceScale(50, 50, 4);
      expect(scale.min).toBeLessThanOrEqual(50);
      expect(scale.max).toBeGreaterThanOrEqual(50);
      expect(scale.ticks.length).toBeGreaterThan(1);
    });

    it("handles all-zero input", () => {
      const scale = getNiceScale(0, 0, 4);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(1);
      expect(scale.ticks).toContain(0);
    });

    it("handles negative ranges cleanly", () => {
      const scale = getNiceScale(-100, -20, 4);
      expect(scale.min).toBeLessThanOrEqual(-100);
      expect(scale.max).toBeGreaterThanOrEqual(-20);
      expect(scale.ticks.length).toBeGreaterThan(1);
      for (let i = 1; i < scale.ticks.length; i++) {
        expect(scale.ticks[i]).toBeGreaterThan(scale.ticks[i - 1]);
      }
    });

    it("handles mixed negative and positive range", () => {
      const scale = getNiceScale(-50, 50, 5);
      expect(scale.min).toBeLessThanOrEqual(-50);
      expect(scale.max).toBeGreaterThanOrEqual(50);
      expect(scale.ticks).toContain(0);
    });

    it("handles reversed min/max gracefully", () => {
      const scale = getNiceScale(100, 0, 5);
      expect(scale.min).toBe(0);
      expect(scale.max).toBe(100);
      expect(scale.ticks).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it("handles non-finite values safely", () => {
      const scale = getNiceScale(Number.NaN, Number.POSITIVE_INFINITY, 5);
      expect(Number.isFinite(scale.min)).toBe(true);
      expect(Number.isFinite(scale.max)).toBe(true);
      expect(scale.ticks.length).toBeGreaterThan(0);
    });
  });

  describe("linearScale", () => {
    it("maps domain values to range accurately", () => {
      expect(linearScale(50, [0, 100], [0, 200])).toBe(100);
      expect(linearScale(0, [0, 100], [200, 0])).toBe(200);
      expect(linearScale(100, [0, 100], [200, 0])).toBe(0);
    });

    it("handles identical domain min and max gracefully without division by zero", () => {
      expect(linearScale(50, [50, 50], [0, 200])).toBe(0);
    });

    it("handles non-finite values gracefully", () => {
      expect(linearScale(Number.NaN, [0, 100], [0, 200])).toBe(0);
    });

    it("extrapolates values outside domain bounds", () => {
      expect(linearScale(150, [0, 100], [0, 200])).toBe(300);
      expect(linearScale(-50, [0, 100], [0, 200])).toBe(-100);
    });
  });

  describe("generateLinePath & generateAreaPath", () => {
    const points = [
      { x: 0, y: 100 },
      { x: 50, y: 50 },
      { x: 100, y: 80 },
    ];

    it("generates linear SVG path", () => {
      const path = generateLinePath(points, "linear");
      expect(path).toBe("M 0 100 L 50 50 L 100 80");
    });

    it("generates smooth SVG path without NaN", () => {
      const path = generateLinePath(points, "smooth");
      expect(path).toContain("M 0 100");
      expect(path).toContain("C");
      expect(path).not.toContain("NaN");
    });

    it("generates step SVG path", () => {
      const path = generateLinePath(points, "step");
      expect(path).toContain("M 0 100");
      expect(path).toContain("H 50 V 50");
      expect(path).not.toContain("NaN");
    });

    it("defaults to linear path when curve is omitted", () => {
      const path = generateLinePath(points);
      expect(path).toBe("M 0 100 L 50 50 L 100 80");
    });

    it("generates area path closed to baseline", () => {
      const path = generateAreaPath(points, 200, "linear");
      expect(path).toBe("M 0 100 L 50 50 L 100 80 L 100 200 L 0 200 Z");
    });

    it("generates smooth area path closed to baseline", () => {
      const path = generateAreaPath(points, 200, "smooth");
      expect(path).toContain("M 0 100");
      expect(path).toContain("C");
      expect(path).toContain("L 100 200 L 0 200 Z");
    });

    it("returns empty string for empty points array", () => {
      expect(generateLinePath([])).toBe("");
      expect(generateAreaPath([], 100)).toBe("");
    });

    it("handles single-point paths correctly", () => {
      expect(generateLinePath([{ x: 10, y: 20 }])).toBe("M 10 20");
      expect(generateAreaPath([{ x: 10, y: 20 }], 100)).toBe("M 10 20 L 10 100 Z");
    });
  });

  describe("calculateBarLayout", () => {
    it("calculates grouped bar rectangles correctly", () => {
      const bars = calculateBarLayout({
        dataCount: 2,
        seriesCount: 2,
        plotWidth: 200,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [
          { group: 0, seriesIndex: 0, value: 50 },
          { group: 0, seriesIndex: 1, value: 80 },
          { group: 1, seriesIndex: 0, value: 30 },
          { group: 1, seriesIndex: 1, value: 60 },
        ],
        mode: "grouped",
      });
      expect(bars).toHaveLength(4);
      expect(bars[0].width).toBeGreaterThan(0);
      expect(bars[0].height).toBe(50);
      expect(bars[1].height).toBe(80);
    });

    it("calculates stacked bar rectangles correctly", () => {
      const bars = calculateBarLayout({
        dataCount: 1,
        seriesCount: 2,
        plotWidth: 100,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [
          { group: 0, seriesIndex: 0, value: 40 },
          { group: 0, seriesIndex: 1, value: 30 },
        ],
        mode: "stacked",
      });
      expect(bars).toHaveLength(2);
      expect(bars[0].height).toBe(40);
      expect(bars[0].y).toBe(60);
      expect(bars[1].height).toBe(30);
      expect(bars[1].y).toBe(30);
    });

    it("calculates horizontal bar layout correctly", () => {
      const bars = calculateBarLayout({
        dataCount: 2,
        seriesCount: 1,
        plotWidth: 200,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [
          { group: 0, seriesIndex: 0, value: 50 },
          { group: 1, seriesIndex: 0, value: 100 },
        ],
        layout: "horizontal",
      });
      expect(bars).toHaveLength(2);
      expect(bars[0].width).toBe(100);
      expect(bars[1].width).toBe(200);
      expect(bars[0].height).toBeGreaterThan(0);
    });

    it("handles empty data array", () => {
      const bars = calculateBarLayout({
        dataCount: 0,
        seriesCount: 0,
        plotWidth: 200,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [],
      });
      expect(bars).toEqual([]);
    });

    it("respects barMaxWidth when specified", () => {
      const bars = calculateBarLayout({
        dataCount: 1,
        seriesCount: 1,
        plotWidth: 200,
        plotHeight: 100,
        yDomain: [0, 100],
        data: [{ group: 0, seriesIndex: 0, value: 50 }],
        barMaxWidth: 32,
      });
      expect(bars[0].width).toBe(32);
    });
  });

  describe("calculateDonutSegments", () => {
    it("calculates donut arc slices totaling 360 degrees", () => {
      const segments = calculateDonutSegments(
        [
          { label: "A", value: 30 },
          { label: "B", value: 70 },
        ],
        { cx: 100, cy: 100, innerRadius: 40, outerRadius: 80 }
      );
      expect(segments).toHaveLength(2);
      expect(segments[0].percentage).toBe(30);
      expect(segments[1].percentage).toBe(70);
      expect(segments[0].path).toContain("M");
      expect(segments[0].path).toContain("A");
      expect(segments[0].path).toContain("Z");
    });

    it("handles a single 100% slice with a complete closed ring", () => {
      const segments = calculateDonutSegments([{ label: "Solo", value: 100 }], {
        cx: 100,
        cy: 100,
        innerRadius: 50,
        outerRadius: 90,
      });
      expect(segments).toHaveLength(1);
      expect(segments[0].percentage).toBe(100);
      expect(segments[0].path).toContain("M");
      expect(segments[0].path).toContain("A");
      expect(segments[0].path).toContain("Z");
    });

    it("handles empty slice input safely", () => {
      const segments = calculateDonutSegments([], {
        cx: 100,
        cy: 100,
        innerRadius: 40,
        outerRadius: 80,
      });
      expect(segments).toEqual([]);
    });

    it("handles all-zero slice values safely", () => {
      const segments = calculateDonutSegments(
        [
          { label: "Zero1", value: 0 },
          { label: "Zero2", value: 0 },
        ],
        { cx: 100, cy: 100, innerRadius: 40, outerRadius: 80 }
      );
      expect(segments).toHaveLength(2);
      expect(segments[0].percentage).toBe(0);
      expect(segments[1].percentage).toBe(0);
      expect(segments[0].path).toBe("");
    });

    it("supports pie mode with innerRadius = 0", () => {
      const segments = calculateDonutSegments(
        [
          { label: "Slice1", value: 50 },
          { label: "Slice2", value: 50 },
        ],
        { cx: 100, cy: 100, innerRadius: 0, outerRadius: 80 }
      );
      expect(segments).toHaveLength(2);
      expect(segments[0].percentage).toBe(50);
      expect(segments[0].path).toContain("M");
      expect(segments[0].path).toContain("A");
      expect(segments[0].path).toContain("Z");
    });
  });
});
