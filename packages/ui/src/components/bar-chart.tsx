"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import {
  type BarDataPoint,
  type BarRect,
  calculateBarLayout,
  getNiceScale,
  linearScale,
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

export type BarChartType = "grouped" | "stacked";
export type BarChartLayout = "vertical" | "horizontal";

export interface BarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of tabular data records to plot. */
  data: Array<Record<string, unknown>>;
  /** Key identifying category or timestamp in each data item (e.g. "category", "month"). */
  index: string;
  /** Series configurations defining data keys, labels, and color assignments. */
  series: ChartSeries[];
  /** Mode of bar presentation: grouped side-by-side or stacked. Defaults to "grouped". */
  type?: BarChartType;
  /** Orientation of bars: vertical columns or horizontal bars. Defaults to "vertical". */
  layout?: BarChartLayout;
  /** Corner radius in pixels for rounded bar edges. Defaults to 4. */
  radius?: number;
  /** Whether to render background reference grid lines. Defaults to true. */
  showGrid?: boolean;
  /** Whether to render horizontal X-axis tick labels. Defaults to true. */
  showXAxis?: boolean;
  /** Whether to render vertical Y-axis numeric or category ticks. Defaults to true. */
  showYAxis?: boolean;
  /** Whether to render series legend. Defaults to true when series.length > 1. */
  showLegend?: boolean;
  /** Whether to display interactive floating tooltip card on bar hover/touch. Defaults to true. */
  showTooltip?: boolean;
  /** Whether to render a semantic hidden table for screen readers. Defaults to true when caption is provided. */
  showA11yTable?: boolean;
  /** Value formatter for numeric axis labels and tooltip metrics. */
  valueFormatter?: (value: number) => string;
  /** Label formatter for category axis ticks and tooltip header. */
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
  /** Controlled list of active series keys. */
  activeSeries?: string[];
  /** Callback fired when user clicks a legend item to toggle series visibility. */
  onSeriesToggle?: (key: string) => void;
  /** Number of numeric ticks to target in nice scale calculation. Defaults to 5. */
  yTicksCount?: number;
  /** Explicit [min, max] domain override for the numeric value axis. */
  yDomain?: [number, number];
  /** Whether numeric axis auto-scales to data minimum rather than anchoring at zero. Defaults to false. */
  autoScale?: boolean;
  /** Maximum bar thickness in pixels. */
  barMaxWidth?: number;
  /** Fractional padding between category groups (0 to 1). Defaults to 0.2. */
  groupPadding?: number;
  /** Pixel gap between bars within a grouped category. Defaults to 2. */
  barPadding?: number;
  /** Additional CSS class applied to each SVG bar rect. */
  barClassName?: string;
}

/**
 * Responsive multi-series BarChart supporting grouped and stacked modes,
 * vertical and horizontal orientations, rounded corners, tooltips, legend toggling,
 * and WCAG AA accessibility table.
 */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      data,
      index,
      series,
      type = "grouped",
      layout = "vertical",
      radius = 4,
      showGrid = true,
      showXAxis = true,
      showYAxis = true,
      showLegend,
      showTooltip = true,
      showA11yTable,
      valueFormatter,
      indexFormatter,
      emptyMessage = "Brak danych do wyświetlenia",
      height = 280,
      width = "100%",
      margin: marginProp,
      ariaLabel,
      caption,
      activeSeries: activeSeriesProp,
      onSeriesToggle,
      yTicksCount = 5,
      yDomain: yDomainProp,
      autoScale = false,
      barMaxWidth,
      groupPadding = 0.2,
      barPadding = 2,
      barClassName,
      className,
      style,
      ...props
    },
    ref
  ) => {
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
    const [activeGroup, setActiveGroup] = React.useState<number | null>(null);
    const [activeSeriesKey, setActiveSeriesKey] = React.useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

    const computedAriaLabel =
      props["aria-label"] ??
      ariaLabel ??
      (type === "stacked" ? "Wykres słupkowy skumulowany" : "Wykres słupkowy");

    // Fallback if data is empty
    if (!data || data.length === 0) {
      return (
        <ChartContainer
          ref={combinedRef}
          width={typeof width === "number" ? width : undefined}
          height={height}
          aria-label={computedAriaLabel}
          className={cn("chart-bar-empty", className)}
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
      left: showYAxis ? (layout === "horizontal" ? 64 : 48) : 16,
      ...marginProp,
    };

    const plotLeft = margin.left;
    const plotRight = viewBoxWidth - margin.right;
    const plotTop = margin.top;
    const plotBottom = viewBoxHeight - margin.bottom;
    const plotWidth = Math.max(0, plotRight - plotLeft);
    const plotHeight = Math.max(0, plotBottom - plotTop);

    // Domain & Scale calculation
    let dataMin = 0;
    let dataMax = 100;

    if (type === "stacked") {
      const stackSums: number[] = [];
      for (const row of data) {
        let sum = 0;
        for (const s of activeSeriesList) {
          const val = row[s.key];
          if (typeof val === "number" && Number.isFinite(val)) {
            sum += Math.max(0, val);
          }
        }
        stackSums.push(sum);
      }
      dataMax = stackSums.length > 0 ? Math.max(...stackSums, 0) : 100;
      if (dataMax === 0) dataMax = 100;
    } else {
      const allValues: number[] = [];
      for (const row of data) {
        for (const s of activeSeriesList) {
          const val = row[s.key];
          if (typeof val === "number" && Number.isFinite(val)) {
            allValues.push(val);
          }
        }
      }
      dataMax = allValues.length > 0 ? Math.max(...allValues, 0) : 100;
      if (allValues.length > 0 && autoScale) {
        dataMin = Math.min(...allValues, 0);
      }
      if (dataMax === 0) dataMax = 100;
    }

    const niceScale = getNiceScale(dataMin, dataMax, yTicksCount);
    const domainMin = yDomainProp ? yDomainProp[0] : niceScale.min;
    const domainMax = yDomainProp ? yDomainProp[1] : niceScale.max;
    const yDomain: [number, number] = [domainMin, domainMax];

    // Data points for layout calculation
    const barDataPoints: BarDataPoint[] = [];
    for (let group = 0; group < data.length; group++) {
      const row = data[group];
      for (let sIdx = 0; sIdx < activeSeriesList.length; sIdx++) {
        const s = activeSeriesList[sIdx];
        const rawVal = row[s.key];
        const num =
          typeof rawVal === "number" && Number.isFinite(rawVal) ? rawVal : Number(rawVal) || 0;
        barDataPoints.push({
          group,
          seriesIndex: sIdx,
          value: num,
          seriesKey: s.key,
          seriesLabel: s.label,
          categoryValue: row[index],
        });
      }
    }

    const barRects = calculateBarLayout({
      dataCount: data.length,
      seriesCount: activeSeriesList.length,
      plotWidth,
      plotHeight,
      yDomain,
      data: barDataPoints,
      mode: type,
      layout,
      barMaxWidth,
      groupPadding,
      barPadding,
    });

    // Axis and Grid tick calculations based on orientation
    const isVertical = layout === "vertical";
    const slotSize =
      data.length > 0 ? (isVertical ? plotWidth / data.length : plotHeight / data.length) : 0;

    // Category ticks
    const categoryTicks = data.map((row, idx) => ({
      value: (row[index] as string | number) ?? "",
      coord: isVertical ? plotLeft + (idx + 0.5) * slotSize : plotTop + (idx + 0.5) * slotSize,
    }));

    // Value ticks
    const valueTicks = (
      yDomainProp
        ? getNiceScale(yDomainProp[0], yDomainProp[1], yTicksCount).ticks
        : niceScale.ticks
    ).map((val) => ({
      value: val,
      coord: isVertical
        ? linearScale(val, yDomain, [plotBottom, plotTop])
        : linearScale(val, yDomain, [plotLeft, plotRight]),
    }));

    // Tooltip position updates
    const updateTooltipPosition = (bar: BarRect) => {
      let targetX: number;
      let targetY: number;

      if (layout === "horizontal") {
        targetX = plotLeft + bar.x + bar.width;
        targetY = plotTop + bar.y + bar.height / 2;
      } else {
        targetX = plotLeft + bar.x + bar.width / 2;
        targetY = plotTop + bar.y;
      }

      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
          const scaleX = containerRect.width / viewBoxWidth;
          const scaleY = containerRect.height / viewBoxHeight;
          setTooltipPos({ x: targetX * scaleX, y: targetY * scaleY });
          return;
        }
      }
      setTooltipPos({ x: targetX, y: targetY });
    };

    const handleBarMouseEnter = (bar: BarRect) => {
      if (!showTooltip) return;
      setActiveGroup(bar.group);
      setActiveSeriesKey(bar.seriesKey as string);
      updateTooltipPosition(bar);
    };

    const handleBarMouseLeave = () => {
      setActiveGroup(null);
      setActiveSeriesKey(null);
      setTooltipPos(null);
    };

    const handleBarTouchStart = (bar: BarRect) => {
      if (!showTooltip) return;
      setActiveGroup(bar.group);
      setActiveSeriesKey(bar.seriesKey as string);
      updateTooltipPosition(bar);
    };

    const handleBarTouchEnd = () => {
      setActiveGroup(null);
      setActiveSeriesKey(null);
      setTooltipPos(null);
    };

    // Tooltip data preparation
    const activeRow = activeGroup !== null && data[activeGroup] ? data[activeGroup] : null;
    const tooltipTitle =
      activeRow !== null
        ? indexFormatter
          ? indexFormatter(activeRow[index])
          : String(activeRow[index] ?? "")
        : "";

    const tooltipItems: ChartTooltipItem[] =
      activeRow !== null
        ? activeSeriesList.map((s, sIdx) => {
            const origIdx = series.findIndex((orig) => orig.key === s.key);
            const seriesColorIndex = origIdx >= 0 ? origIdx : sIdx;
            const raw = activeRow[s.key];
            const num = typeof raw === "number" ? raw : Number(raw) || 0;
            return {
              key: s.key,
              label: s.label,
              value: num,
              color: s.color ?? `chart${(seriesColorIndex % 6) + 1}`,
              formattedValue: valueFormatter ? valueFormatter(num) : undefined,
            };
          })
        : [];

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
          "chart-bar-root flex flex-col",
          type === "stacked" ? "chart-bar-stacked" : "chart-bar-grouped",
          layout === "horizontal" ? "chart-bar-horizontal" : "chart-bar-vertical",
          className
        )}
        style={style}
        {...props}
      >
        {/* Background Grid Lines */}
        {showGrid &&
          (isVertical ? (
            <g transform={`translate(${plotLeft}, 0)`}>
              <ChartGrid
                horizontal
                yTicks={valueTicks.map((t) => t.value as number)}
                scaleY={(val) => linearScale(val, yDomain, [plotBottom, plotTop])}
                width={plotWidth}
              />
            </g>
          ) : (
            <g transform={`translate(0, ${plotTop})`}>
              <ChartGrid
                vertical
                horizontal={false}
                xTicks={valueTicks.map((t) => t.value as number)}
                scaleX={(val) => linearScale(val, yDomain, [plotLeft, plotRight])}
                height={plotHeight}
              />
            </g>
          ))}

        {/* Bar Rectangles */}
        <g transform={`translate(${plotLeft}, ${plotTop})`} className="chart-bars-group">
          {barRects.map((bar) => {
            const origIdx = series.findIndex((orig) => orig.key === bar.seriesKey);
            const seriesColorIndex = origIdx >= 0 ? origIdx : bar.seriesIndex;
            const matchingSeries = series[origIdx] ?? activeSeriesList[bar.seriesIndex];
            const sColor = getChartColor(matchingSeries?.color, seriesColorIndex);

            const barW = Math.max(0, bar.width);
            const barH = Math.max(0, bar.height);
            const safeRadius =
              radius > 0 ? Math.min(radius, Math.max(0, barW / 2), Math.max(0, barH / 2)) : 0;

            const isDimmed =
              activeGroup !== null &&
              (bar.group !== activeGroup ||
                (type === "grouped" &&
                  activeSeriesKey !== null &&
                  bar.seriesKey !== activeSeriesKey));

            return (
              <rect
                key={`bar-${bar.group}-${bar.seriesKey}`}
                className={cn(
                  "chart-bar transition-opacity duration-150 cursor-pointer",
                  barClassName
                )}
                x={bar.x}
                y={bar.y}
                width={barW}
                height={barH}
                rx={safeRadius}
                ry={safeRadius}
                fill={sColor}
                opacity={isDimmed ? 0.45 : 1}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${bar.seriesLabel ?? bar.seriesKey}: ${
                  valueFormatter ? valueFormatter(bar.value) : bar.value
                }, ${bar.categoryValue}`}
                onMouseEnter={() => handleBarMouseEnter(bar)}
                onMouseMove={() => handleBarMouseEnter(bar)}
                onMouseLeave={handleBarMouseLeave}
                onTouchStart={() => handleBarTouchStart(bar)}
                onTouchEnd={handleBarTouchEnd}
                onFocus={() => handleBarMouseEnter(bar)}
                onBlur={handleBarMouseLeave}
              />
            );
          })}
        </g>

        {/* X Axis */}
        {showXAxis && (
          <ChartXAxis
            ticks={
              isVertical
                ? categoryTicks.map((t) => ({ value: t.value, x: t.coord }))
                : valueTicks.map((t) => ({ value: t.value, x: t.coord }))
            }
            y={plotBottom + 16}
            formatter={isVertical ? indexFormatter : (valueFormatter as (v: unknown) => string)}
          />
        )}

        {/* Y Axis */}
        {showYAxis && (
          <ChartYAxis
            ticks={
              isVertical
                ? valueTicks.map((t) => ({ value: t.value, y: t.coord }))
                : categoryTicks.map((t) => ({ value: t.value, y: t.coord }))
            }
            x={plotLeft - 8}
            formatter={isVertical ? (valueFormatter as (v: unknown) => string) : indexFormatter}
          />
        )}

        {/* Tooltip Overlay */}
        {showTooltip && activeGroup !== null && tooltipPos && (
          <ChartTooltip
            open={activeGroup !== null}
            title={tooltipTitle}
            items={tooltipItems}
            x={tooltipPos.x}
            y={tooltipPos.y}
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
BarChart.displayName = "BarChart";
