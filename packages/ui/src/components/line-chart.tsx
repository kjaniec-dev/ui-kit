"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import {
  type CurveType,
  generateAreaPath,
  generateLinePath,
  getNiceScale,
  linearScale,
  type Point,
} from "./chart-math";
import {
  ChartA11yTable,
  ChartContainer,
  ChartGrid,
  ChartLegend,
  type ChartMargin,
  type ChartSeries,
  ChartTooltip,
  type ChartTooltipItem,
  ChartXAxis,
  ChartYAxis,
  getChartColor,
} from "./chart-primitives";

export type LineChartVariant = "line" | "area";

export interface LineChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of tabular data records to plot. */
  data: Array<Record<string, unknown>>;
  /** Key identifying category or timestamp in each data item (e.g. "date", "month"). */
  index: string;
  /** Series configurations defining data keys, labels, and color assignments. */
  series: ChartSeries[];
  /** Visual presentation mode: continuous line or filled area. Defaults to "line". */
  variant?: LineChartVariant;
  /** Interpolation method between data points: linear polyline, smooth cubic curve, or step lines. Defaults to "linear". */
  curve?: CurveType;
  /** Whether to render background horizontal reference grid lines. Defaults to true. */
  showGrid?: boolean;
  /** Whether to render horizontal X-axis tick labels. Defaults to true. */
  showXAxis?: boolean;
  /** Whether to render vertical Y-axis numeric ticks. Defaults to true. */
  showYAxis?: boolean;
  /** Whether to render series legend. Defaults to true when series.length > 1. */
  showLegend?: boolean;
  /** Whether to display interactive floating tooltip card on hover/touch. Defaults to true. */
  showTooltip?: boolean;
  /** Whether to render accent dots on data points. Defaults to false. */
  showDots?: boolean;
  /** Whether to apply a subtle vertical gradient to area fills. Defaults to true. */
  showGradient?: boolean;
  /** Whether to render a semantic hidden table for screen readers. Defaults to true when caption is provided. */
  showA11yTable?: boolean;
  /** Value formatter for Y-axis labels and tooltip metrics. */
  valueFormatter?: (value: number) => string;
  /** Label formatter for X-axis ticks and tooltip header. */
  indexFormatter?: (value: unknown) => string;
  /** Text to render when `data` is empty. Defaults to "Brak danych do wyświetlenia". */
  emptyMessage?: string;
  /** Height of the chart in pixels or CSS units. Defaults to 280. */
  height?: number | string;
  /** Width of the chart in pixels or CSS units. Defaults to "100%". */
  width?: number | string;
  /** Inner chart margins in pixels. */
  margin?: ChartMargin;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Screen reader semantic table caption. */
  caption?: string;
  /** Stroke width in pixels for line paths. Defaults to 2. */
  strokeWidth?: number;
  /** Controlled list of active series keys. */
  activeSeries?: string[];
  /** Callback fired when user clicks a legend item to toggle series visibility. */
  onSeriesToggle?: (key: string) => void;
  /** Number of Y-axis ticks to target in nice scale calculation. Defaults to 5. */
  yTicksCount?: number;
  /** Explicit [min, max] domain override for Y-axis. */
  yDomain?: [number, number];
  /** Whether Y-axis auto-scales to data minimum rather than anchoring at zero. Defaults to false. */
  autoScale?: boolean;
}

/**
 * Responsive multi-series LineChart with SVG rendering, background grid, nice-scale axes,
 * interactive HTML tooltip overlay with crosshair, toggleable legend, and WCAG AA accessible table.
 */
export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      data,
      index,
      series,
      variant = "line",
      curve = "linear",
      showGrid = true,
      showXAxis = true,
      showYAxis = true,
      showLegend,
      showTooltip = true,
      showDots = false,
      showGradient = true,
      showA11yTable,
      valueFormatter,
      indexFormatter,
      emptyMessage = "Brak danych do wyświetlenia",
      height = 280,
      width = "100%",
      margin: marginProp,
      ariaLabel,
      caption,
      strokeWidth = 2,
      activeSeries: activeSeriesProp,
      onSeriesToggle,
      yTicksCount = 5,
      yDomain: yDomainProp,
      autoScale = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const rawId = React.useId();
    const idPrefix = `kj-chart-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const combinedRef = (node: HTMLDivElement | null) => {
      containerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    // Series visibility toggle state
    const [internalDisabledSeries, setInternalDisabledSeries] = React.useState<string[]>([]);
    const disabledSeries = activeSeriesProp
      ? series.filter((s) => !activeSeriesProp.includes(s.key)).map((s) => s.key)
      : internalDisabledSeries;

    const handleSeriesToggle = (key: string) => {
      onSeriesToggle?.(key);
      setInternalDisabledSeries((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    };

    const activeSeriesList = React.useMemo(
      () => series.filter((s) => !disabledSeries.includes(s.key)),
      [series, disabledSeries]
    );

    // Interactive tooltip state
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

    const computedAriaLabel =
      props["aria-label"] ??
      ariaLabel ??
      (variant === "area" ? "Wykres warstwowy" : "Wykres liniowy");

    // Fallback if data is empty
    if (!data || data.length === 0) {
      return (
        <ChartContainer
          ref={combinedRef}
          width={typeof width === "number" ? width : undefined}
          height={height}
          aria-label={computedAriaLabel}
          className={cn("chart-line-empty", className)}
          style={style}
          {...props}
        >
          <div className="chart-empty-message flex h-full min-h-[160px] w-full items-center justify-center text-sm text-muted-foreground select-none">
            {emptyMessage}
          </div>
        </ChartContainer>
      );
    }

    // Geometry layout constants
    const viewBoxWidth = typeof width === "number" && width > 0 ? width : 600;
    const viewBoxHeight = typeof height === "number" && height > 0 ? height : 280;

    const margin: Required<ChartMargin> = {
      top: 16,
      right: 20,
      bottom: showXAxis ? 32 : 16,
      left: showYAxis ? 48 : 16,
      ...marginProp,
    };

    const plotLeft = margin.left;
    const plotRight = viewBoxWidth - margin.right;
    const plotTop = margin.top;
    const plotBottom = viewBoxHeight - margin.bottom;
    const plotWidth = Math.max(0, plotRight - plotLeft);
    const plotHeight = Math.max(0, plotBottom - plotTop);

    // Domain & Scale calculation
    const allValues: number[] = [];
    for (const row of data) {
      for (const s of activeSeriesList) {
        const val = row[s.key];
        if (typeof val === "number" && Number.isFinite(val)) {
          allValues.push(val);
        }
      }
    }

    let dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
    const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
    if (!autoScale && dataMin > 0) {
      dataMin = 0;
    }

    const niceScale = getNiceScale(dataMin, dataMax, yTicksCount);
    const domainMin = yDomainProp ? yDomainProp[0] : niceScale.min;
    const domainMax = yDomainProp ? yDomainProp[1] : niceScale.max;

    const getY = (val: number): number => {
      return linearScale(val, [domainMin, domainMax], [plotBottom, plotTop]);
    };

    const getX = (idx: number): number => {
      if (data.length <= 1) {
        return plotLeft + plotWidth / 2;
      }
      return linearScale(idx, [0, data.length - 1], [plotLeft, plotRight]);
    };

    // Y Axis ticks
    const yTicks = (
      yDomainProp
        ? getNiceScale(yDomainProp[0], yDomainProp[1], yTicksCount).ticks
        : niceScale.ticks
    ).map((val) => ({
      value: val,
      y: getY(val),
    }));

    // X Axis ticks
    const maxXTicks = Math.max(2, Math.floor(plotWidth / 60));
    const xStep = data.length > maxXTicks ? Math.ceil(data.length / maxXTicks) : 1;
    const xTicks = data
      .map((row, idx) => ({
        value: indexFormatter ? indexFormatter(row[index]) : String(row[index] ?? ""),
        x: getX(idx),
        idx,
      }))
      .filter((_, i) => i % xStep === 0 || i === data.length - 1);

    // Mouse / Touch handlers for interactive overlay
    const handlePointerMove = (clientX: number, clientY: number, target: Element) => {
      const rect = target.getBoundingClientRect();
      let relativeX: number;
      if (rect.width > 0) {
        relativeX = ((clientX - rect.left) / rect.width) * plotWidth + plotLeft;
      } else {
        relativeX = clientX;
      }

      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < data.length; i++) {
        const ptX = getX(i);
        const diff = Math.abs(ptX - relativeX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      setActiveIndex(closestIdx);

      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        if (containerRect.width > 0) {
          const scaleX = containerRect.width / viewBoxWidth;
          const pixelX = getX(closestIdx) * scaleX;
          const pixelY = clientY - containerRect.top;
          setTooltipPos({ x: pixelX, y: Math.max(20, pixelY) });
          return;
        }
      }
      setTooltipPos({ x: getX(closestIdx), y: clientY });
    };

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
      handlePointerMove(e.clientX, e.clientY, e.currentTarget);
    };

    const handleTouch = (e: React.TouchEvent<SVGRectElement>) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY, e.currentTarget);
      }
    };

    const handleMouseLeave = () => {
      setActiveIndex(null);
      setTooltipPos(null);
    };

    // Tooltip data preparation
    const activeRow = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;
    const tooltipTitle =
      activeRow !== null
        ? indexFormatter
          ? indexFormatter(activeRow[index])
          : String(activeRow[index] ?? "")
        : "";

    const tooltipItems: ChartTooltipItem[] =
      activeRow !== null
        ? activeSeriesList.map((s, idx) => {
            const raw = activeRow[s.key];
            const num = typeof raw === "number" ? raw : Number(raw) || 0;
            return {
              key: s.key,
              label: s.label,
              value: num,
              color: s.color ?? `chart${(idx % 6) + 1}`,
              formattedValue: valueFormatter ? valueFormatter(num) : undefined,
            };
          })
        : [];

    const baselineY = getY(Math.max(0, domainMin));
    const shouldShowLegend = showLegend ?? series.length > 1;
    const shouldShowA11yTable = showA11yTable ?? Boolean(caption);

    return (
      <ChartContainer
        ref={combinedRef}
        width={typeof width === "number" ? width : undefined}
        height={height}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        aria-label={computedAriaLabel}
        className={cn(
          "chart-line-root flex flex-col",
          variant === "area" ? "chart-area-root" : "chart-line-root",
          className
        )}
        style={style}
        {...props}
      >
        {/* SVG Area definitions: Gradients */}
        <defs>
          {variant === "area" &&
            showGradient &&
            series.map((s, idx) => {
              const gradColor = getChartColor(s.color, idx);
              return (
                <linearGradient
                  key={`grad-${s.key}`}
                  id={`${idPrefix}-grad-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={gradColor} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={gradColor} stopOpacity="0.0" />
                </linearGradient>
              );
            })}
        </defs>

        {/* Background Grid Lines */}
        {showGrid && (
          <g transform={`translate(${plotLeft}, 0)`}>
            <ChartGrid
              horizontal
              yTicks={yTicks.map((t) => t.value as number)}
              scaleY={getY}
              width={plotWidth}
            />
          </g>
        )}

        {/* Series Paths: Area Fills and Lines */}
        {activeSeriesList.map((s, sIdx) => {
          const sColor = getChartColor(s.color, sIdx);
          const points: Point[] = [];

          for (let i = 0; i < data.length; i++) {
            const rawVal = data[i][s.key];
            if (rawVal !== undefined && rawVal !== null && Number.isFinite(Number(rawVal))) {
              points.push({ x: getX(i), y: getY(Number(rawVal)) });
            }
          }

          if (points.length === 0) return null;

          const linePath = generateLinePath(points, curve);
          const areaPath = variant === "area" ? generateAreaPath(points, baselineY, curve) : "";

          return (
            <g key={`series-${s.key}`} className={`chart-series chart-series-${s.key}`}>
              {/* Area gradient polygon */}
              {variant === "area" && areaPath && (
                <path
                  d={areaPath}
                  fill={showGradient ? `url(#${idPrefix}-grad-${s.key})` : sColor}
                  fillOpacity={showGradient ? undefined : 0.15}
                  stroke="none"
                  className="chart-area pointer-events-none transition-opacity duration-200"
                />
              )}

              {/* Stroke line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={sColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className="chart-line pointer-events-none transition-opacity duration-200"
                />
              )}

              {/* Accent dots */}
              {showDots &&
                points.map((pt, ptIdx) => (
                  <circle
                    key={`dot-${s.key}-${ptIdx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={3}
                    fill={sColor}
                    stroke="var(--kj-background, #ffffff)"
                    strokeWidth={1.5}
                    className="chart-dot pointer-events-none"
                  />
                ))}

              {/* Hover active point highlight */}
              {activeIndex !== null && points[activeIndex] && (
                <circle
                  cx={points[activeIndex].x}
                  cy={points[activeIndex].y}
                  r={4.5}
                  fill={sColor}
                  stroke="var(--kj-background, #ffffff)"
                  strokeWidth={2}
                  className="chart-active-dot pointer-events-none"
                />
              )}
            </g>
          );
        })}

        {/* X Axis */}
        {showXAxis && <ChartXAxis ticks={xTicks} y={plotBottom + 16} formatter={indexFormatter} />}

        {/* Y Axis */}
        {showYAxis && (
          <ChartYAxis
            ticks={yTicks}
            x={plotLeft - 8}
            formatter={valueFormatter as (v: unknown) => string}
          />
        )}

        {/* Interactive Mouse & Touch Overlay */}
        {showTooltip && (
          /* biome-ignore lint/a11y/noStaticElementInteractions: transparent SVG overlay tracks pointer for chart tooltip */
          <rect
            className="chart-interactive-overlay cursor-crosshair"
            x={plotLeft}
            y={plotTop}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            pointerEvents="all"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={handleMouseLeave}
          />
        )}

        {/* Tooltip Overlay */}
        {showTooltip && activeIndex !== null && tooltipPos && (
          <ChartTooltip
            open={activeIndex !== null}
            title={tooltipTitle}
            items={tooltipItems}
            x={tooltipPos.x}
            y={tooltipPos.y}
            showCrosshair
            crosshairX={tooltipPos.x}
            crosshairHeight={plotBottom}
            valueFormatter={valueFormatter}
          />
        )}

        {/* Legend */}
        {shouldShowLegend && (
          <ChartLegend
            series={series}
            disabledSeries={disabledSeries}
            onToggle={handleSeriesToggle}
          />
        )}

        {/* Semantic Accessible Table for Screen Readers */}
        {shouldShowA11yTable && (
          <ChartA11yTable
            caption={caption ?? computedAriaLabel}
            series={series}
            data={data}
            indexKey={index}
            valueFormatter={valueFormatter as (v: unknown) => string}
          />
        )}
      </ChartContainer>
    );
  }
);
LineChart.displayName = "LineChart";

/**
 * Specialized variant of LineChart with subtle SVG vertical gradient fills beneath lines.
 */
export const AreaChart = React.forwardRef<HTMLDivElement, LineChartProps>((props, ref) => (
  <LineChart ref={ref} variant="area" {...props} />
));
AreaChart.displayName = "AreaChart";
