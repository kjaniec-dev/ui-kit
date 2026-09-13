"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import {
  type CurveType,
  calculateBarLayout,
  generateAreaPath,
  generateLinePath,
  linearScale,
  type Point,
} from "./chart-math";
import { type ChartColor, getChartColor } from "./chart-primitives";

export type SparklineVariant = "line" | "area" | "bar";
export type SparklineCurve = "linear" | "smooth";

export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  /** Numerical values or objects containing data points to plot. */
  data?: Array<number | Record<string, unknown>>;
  /** Key to extract numeric values when `data` contains objects. */
  dataKey?: string;
  /** Visual presentation mode: continuous line, gradient area, or discrete bars. Defaults to "line". */
  variant?: SparklineVariant;
  /** Interpolation method between data points. Defaults to "smooth". */
  curve?: SparklineCurve;
  /** Theme token identifier or raw CSS color string for line, fill, and bars. Defaults to "chart1". */
  color?: ChartColor;
  /** Line stroke width in pixels for line and area variants. Defaults to 2. */
  strokeWidth?: number;
  /** Whether to highlight the final data point with an accent dot. Defaults to false. */
  showEndDot?: boolean;
  /** Whether to apply a fading vertical gradient to area fills. Defaults to true. */
  showGradient?: boolean;
  /** Overall component height in pixels. Defaults to 36. */
  height?: number;
  /** Component width in pixels or CSS units. Defaults to "100%". */
  width?: number | string;
  /** Corner radius in pixels for bar rectangles. Defaults to 2. */
  barRadius?: number;
  /** Spacing between discrete bars in pixels. Defaults to 2. */
  barPadding?: number;
  /** Accessible label alias for assistive technologies. */
  ariaLabel?: string;
}

/**
 * Compact, lightweight data visualization sparkline for KPI cards, metric widgets, and data tables.
 */
export const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      dataKey,
      variant = "line",
      curve = "smooth",
      color = "chart1",
      strokeWidth = 2,
      showEndDot = false,
      showGradient = true,
      height = 36,
      width = "100%",
      barRadius = 2,
      barPadding = 2,
      ariaLabel,
      className,
      style,
      preserveAspectRatio = "none",
      ...props
    },
    ref
  ) => {
    const rawId = React.useId();
    const gradientId = `sparkline-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const values: number[] = React.useMemo(() => {
      if (!data || !Array.isArray(data) || data.length === 0) return [];
      return data
        .map((item) => {
          if (typeof item === "number") return item;
          if (typeof item === "object" && item !== null) {
            if (dataKey && item[dataKey] !== undefined) {
              const num = Number(item[dataKey]);
              return Number.isFinite(num) ? num : 0;
            }
            if ("value" in item && item.value !== undefined) {
              const num = Number(item.value);
              return Number.isFinite(num) ? num : 0;
            }
            for (const key of Object.keys(item)) {
              const val = item[key];
              if (typeof val === "number") return val;
              const num = Number(val);
              if (Number.isFinite(num)) return num;
            }
          }
          const parsed = Number(item);
          return Number.isFinite(parsed) ? parsed : 0;
        })
        .filter((v) => Number.isFinite(v));
    }, [data, dataKey]);

    const resolvedColor = getChartColor(color, 0);
    const computedAriaLabel = props["aria-label"] ?? ariaLabel ?? "Sparkline";
    const viewBoxWidth = typeof width === "number" && width > 0 ? width : 120;
    const isHidden = props["aria-hidden"] === true || props["aria-hidden"] === "true";

    if (values.length === 0) {
      return (
        <svg
          ref={ref}
          role={isHidden ? undefined : "img"}
          aria-label={isHidden ? undefined : computedAriaLabel}
          viewBox={`0 0 ${viewBoxWidth} ${height}`}
          width={width}
          height={height}
          className={cn("chart-sparkline chart-sparkline-empty overflow-visible", className)}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
            ...style,
          }}
          preserveAspectRatio={preserveAspectRatio}
          {...props}
        >
          <line
            x1={0}
            y1={height / 2}
            x2={viewBoxWidth}
            y2={height / 2}
            stroke="currentColor"
            strokeDasharray="2 2"
            strokeWidth={1}
            className="text-muted-foreground/30 stroke-current"
          />
        </svg>
      );
    }

    if (variant === "bar") {
      const minVal = Math.min(0, ...values);
      const maxVal = Math.max(0, ...values) || 1;
      const barData = values.map((val, idx) => ({
        group: idx,
        seriesIndex: 0,
        value: val,
      }));

      const barRects = calculateBarLayout({
        dataCount: values.length,
        seriesCount: 1,
        plotWidth: viewBoxWidth,
        plotHeight: height,
        yDomain: [minVal, maxVal],
        data: barData,
        mode: "grouped",
        layout: "vertical",
        groupPadding: 0.2,
        barPadding,
      });

      const lastBar = barRects.length > 0 ? barRects[barRects.length - 1] : undefined;

      return (
        <svg
          ref={ref}
          role={isHidden ? undefined : "img"}
          aria-label={isHidden ? undefined : computedAriaLabel}
          viewBox={`0 0 ${viewBoxWidth} ${height}`}
          width={width}
          height={height}
          className={cn("chart-sparkline chart-sparkline-bars overflow-visible", className)}
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            width: typeof width === "number" ? `${width}px` : width,
            ...style,
          }}
          preserveAspectRatio={preserveAspectRatio}
          {...props}
        >
          {barRects.map((bar, idx) => (
            <rect
              key={`sparkline-bar-${idx}-${bar.x}`}
              x={bar.x}
              y={bar.y}
              width={bar.width}
              height={Math.max(bar.height, bar.value === 0 ? 0 : 1)}
              rx={barRadius}
              fill={resolvedColor}
              className="chart-sparkline-bar"
            />
          ))}
          {showEndDot && lastBar && (
            <circle
              cx={lastBar.x + lastBar.width / 2}
              cy={lastBar.y}
              r={3}
              fill={resolvedColor}
              className="chart-sparkline-dot"
            />
          )}
        </svg>
      );
    }

    // Line and Area variants
    const paddingTop = 4;
    const paddingBottom = 4;
    const paddingLeft = showEndDot ? 4 : 2;
    const paddingRight = showEndDot ? 4 : 2;

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    const points: Point[] = values.map((val, idx) => {
      const x =
        values.length === 1
          ? viewBoxWidth / 2
          : linearScale(idx, [0, values.length - 1], [paddingLeft, viewBoxWidth - paddingRight]);
      const y =
        minVal === maxVal
          ? height / 2
          : linearScale(val, [minVal, maxVal], [height - paddingBottom, paddingTop]);
      return { x, y };
    });

    const linePath = generateLinePath(points, curve as CurveType);
    const areaPath = variant === "area" ? generateAreaPath(points, height, curve as CurveType) : "";
    const lastPoint = points[points.length - 1];

    return (
      <svg
        ref={ref}
        role={isHidden ? undefined : "img"}
        aria-label={isHidden ? undefined : computedAriaLabel}
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        width={width}
        height={height}
        className={cn(
          "chart-sparkline overflow-visible",
          variant === "area" ? "chart-sparkline-area-container" : "chart-sparkline-line-container",
          className
        )}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          width: typeof width === "number" ? `${width}px` : width,
          ...style,
        }}
        preserveAspectRatio={preserveAspectRatio}
        {...props}
      >
        {variant === "area" && showGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedColor} stopOpacity="0.28" />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
        )}

        {variant === "area" && areaPath && (
          <path
            d={areaPath}
            fill={showGradient ? `url(#${gradientId})` : resolvedColor}
            fillOpacity={showGradient ? undefined : 0.15}
            stroke="none"
            className="chart-sparkline-area"
          />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="chart-sparkline-line"
          />
        )}

        {showEndDot && lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={3}
            fill={resolvedColor}
            stroke="var(--kj-background, #ffffff)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            className="chart-sparkline-dot"
          />
        )}
      </svg>
    );
  }
);
Sparkline.displayName = "Sparkline";
