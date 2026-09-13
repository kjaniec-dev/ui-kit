import * as React from "react";
import { cn } from "../lib/cn";
import { linearScale } from "./chart-math";

/**
 * Palette color token identifiers mapping to design system chart CSS variables.
 */
export type ChartColor =
  | "chart1"
  | "chart2"
  | "chart3"
  | "chart4"
  | "chart5"
  | "chart6"
  | (string & {});

/**
 * Series definition describing data binding, legend labeling, and color assignment.
 */
export interface ChartSeries {
  key: string;
  label: string;
  color?: ChartColor;
}

/**
 * Inner chart margin configuration in pixels.
 */
export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Map of chart token keys to CSS custom properties with fallback hex values.
 */
export const CHART_COLOR_VARS: Record<string, string> = {
  chart1: "var(--kj-chart1, #a84f08)",
  chart2: "var(--kj-chart2, #0f746d)",
  chart3: "var(--kj-chart3, #0284c7)",
  chart4: "var(--kj-chart4, #7c3aed)",
  chart5: "var(--kj-chart5, #e11d48)",
  chart6: "var(--kj-chart6, #65a30d)",
};

/**
 * Default color sequence cycling through chart1 to chart6.
 */
export const DEFAULT_CHART_COLORS: ChartColor[] = [
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
  "chart6",
];

/**
 * Resolves a token or custom color string to a valid CSS color string with fallback.
 */
export function getChartColor(color?: string, fallbackIndex = 0): string {
  if (!color) {
    const defaultKey = DEFAULT_CHART_COLORS[fallbackIndex % DEFAULT_CHART_COLORS.length];
    return CHART_COLOR_VARS[defaultKey] || defaultKey;
  }
  return CHART_COLOR_VARS[color] ?? color;
}

/* =========================================================================
   ChartContainer
   ========================================================================= */

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number;
  height?: number | string;
  viewBox?: string;
  "aria-label"?: string;
  ariaLabel?: string;
  overlay?: React.ReactNode;
  svgClassName?: string;
  svgRef?: React.Ref<SVGSVGElement>;
  plotWrapperClassName?: string;
  plotWrapperStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

const SVG_TAGS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "g",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "clipPath",
  "mask",
  "image",
  "use",
  "symbol",
  "animate",
  "animateTransform",
  "foreignObject",
]);

function isSvgChild(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  if (typeof child.type === "string") {
    return SVG_TAGS.has(child.type);
  }
  const comp = child.type as { isSvg?: boolean; displayName?: string; name?: string };
  if (comp.isSvg) return true;
  const name = comp.displayName || comp.name || "";
  if (name.includes("Grid") || name.includes("Axis")) {
    return true;
  }
  return false;
}

function isOverlayChild(child: React.ReactNode): boolean {
  if (!React.isValidElement(child)) return false;
  const comp = child.type as { displayName?: string; name?: string };
  const name = comp?.displayName || comp?.name || "";
  if (name.includes("Tooltip")) return true;
  const className = (child.props as { className?: string })?.className;
  if (typeof className === "string") {
    if (
      className.includes("chart-tooltip") ||
      className.includes("chart-donut-center") ||
      className.includes("chart-empty-message") ||
      className.includes("absolute")
    ) {
      return true;
    }
  }
  return false;
}

function partitionChildren(children: React.ReactNode): {
  svgChildren: React.ReactNode[];
  overlayChildren: React.ReactNode[];
  flowChildren: React.ReactNode[];
} {
  const svgChildren: React.ReactNode[] = [];
  const overlayChildren: React.ReactNode[] = [];
  const flowChildren: React.ReactNode[] = [];

  const categorize = (child: React.ReactNode) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return;
    }
    if (React.isValidElement(child) && child.type === React.Fragment) {
      const inner = partitionChildren((child.props as { children?: React.ReactNode }).children);
      svgChildren.push(...inner.svgChildren);
      overlayChildren.push(...inner.overlayChildren);
      flowChildren.push(...inner.flowChildren);
      return;
    }
    if (isSvgChild(child)) {
      svgChildren.push(child);
      return;
    }
    if (isOverlayChild(child)) {
      overlayChildren.push(child);
      return;
    }
    flowChildren.push(child);
  };

  React.Children.forEach(children, categorize);
  return { svgChildren, overlayChildren, flowChildren };
}

/**
 * Hook to measure responsive container width via ResizeObserver with fallback.
 */
export function useChartWidth(
  containerRef: React.RefObject<HTMLElement | null>,
  defaultWidth = 600
): number {
  const [width, setWidth] = React.useState<number>(defaultWidth);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setWidth(Math.round(rect.width));
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) {
          setWidth(Math.round(w));
        }
      }
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return width;
}

/**
 * Responsive chart container managing SVG viewBox coordinate space and absolute HTML overlay slot.
 */
export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  (
    {
      width,
      height,
      viewBox,
      "aria-label": ariaLabelProp,
      ariaLabel,
      overlay,
      svgClassName,
      svgRef,
      plotWrapperClassName,
      plotWrapperStyle,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const label = ariaLabelProp || ariaLabel;
    const { svgChildren, overlayChildren, flowChildren } = partitionChildren(children);

    const heightNum = typeof height === "number" ? height : undefined;
    const computedViewBox =
      viewBox ||
      (width !== undefined && heightNum !== undefined ? `0 0 ${width} ${heightNum}` : undefined);

    const plotHeightStyle = typeof height === "number" ? `${height}px` : (height ?? undefined);

    return (
      <div
        ref={ref}
        className={cn("chart-container relative w-full flex flex-col", className)}
        style={style}
        {...props}
      >
        <div
          className={cn("chart-plot-wrapper relative w-full", plotWrapperClassName)}
          style={{
            height: plotHeightStyle,
            width: typeof width === "number" ? `${width}px` : undefined,
            ...plotWrapperStyle,
          }}
        >
          {svgChildren.length > 0 && (
            <svg
              ref={svgRef}
              role="img"
              aria-label={label}
              viewBox={computedViewBox}
              width={width}
              height={heightNum}
              className={cn(
                "chart-svg block w-full overflow-visible",
                height !== undefined ? "h-full" : "h-auto",
                svgClassName
              )}
            >
              {svgChildren}
            </svg>
          )}
          {overlayChildren}
          {overlay}
        </div>
        {flowChildren}
      </div>
    );
  }
);
ChartContainer.displayName = "ChartContainer";

/* =========================================================================
   ChartGrid
   ========================================================================= */

export interface ChartGridProps extends React.SVGAttributes<SVGGElement> {
  width?: number;
  height?: number;
  yTicks?: number[];
  xTicks?: number[];
  scaleY?: (value: number) => number;
  scaleX?: (value: number) => number;
  yDomain?: [number, number];
  yRange?: [number, number];
  xDomain?: [number, number];
  xRange?: [number, number];
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  horizontal?: boolean;
  vertical?: boolean;
  className?: string;
}

/**
 * Background horizontal and vertical reference lines with custom tick intervals and dashing.
 */
export const ChartGrid: React.FC<ChartGridProps> = ({
  width = 0,
  height = 0,
  yTicks,
  xTicks,
  scaleY,
  scaleX,
  yDomain,
  yRange,
  xDomain,
  xRange,
  stroke = "var(--kj-border-subtle, #e5e7eb)",
  strokeDasharray = "3 3",
  strokeWidth = 1,
  strokeOpacity = 1,
  horizontal = true,
  vertical,
  className,
  ...props
}) => {
  const shouldDrawHorizontal = horizontal && Boolean(yTicks && yTicks.length > 0);
  const shouldDrawVertical =
    (vertical ?? Boolean(xTicks && xTicks.length > 0)) && Boolean(xTicks && xTicks.length > 0);

  const getY: (val: number) => number =
    scaleY ??
    (yDomain && yRange ? (val: number) => linearScale(val, yDomain, yRange) : (val: number) => val);

  const getX: (val: number) => number =
    scaleX ??
    (xDomain && xRange ? (val: number) => linearScale(val, xDomain, xRange) : (val: number) => val);

  return (
    <g className={cn("chart-grid pointer-events-none", className)} {...props}>
      {shouldDrawHorizontal &&
        yTicks?.map((tick, idx) => {
          const yPos = getY(tick);
          return (
            <line
              key={`grid-y-${idx}-${tick}`}
              x1={0}
              y1={yPos}
              x2={width}
              y2={yPos}
              stroke={stroke}
              strokeDasharray={strokeDasharray}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              className="chart-grid-line chart-grid-line-y"
            />
          );
        })}
      {shouldDrawVertical &&
        xTicks?.map((tick, idx) => {
          const xPos = getX(tick);
          return (
            <line
              key={`grid-x-${idx}-${tick}`}
              x1={xPos}
              y1={0}
              x2={xPos}
              y2={height}
              stroke={stroke}
              strokeDasharray={strokeDasharray}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              className="chart-grid-line chart-grid-line-x"
            />
          );
        })}
    </g>
  );
};
ChartGrid.displayName = "ChartGrid";

/* =========================================================================
   ChartXAxis & ChartYAxis
   ========================================================================= */

export interface ChartXAxisTick {
  value: string | number;
  x: number;
  [key: string]: unknown;
}

export interface ChartXAxisProps extends React.SVGAttributes<SVGGElement> {
  ticks: ChartXAxisTick[];
  y: number;
  formatter?: (value: unknown) => string;
  valueFormatter?: (value: unknown) => string;
  textAnchor?: "start" | "middle" | "end";
  dy?: string | number;
  className?: string;
  tickClassName?: string;
}

/**
 * SVG horizontal axis ticks rendering aligned category or timestamp labels.
 */
export const ChartXAxis: React.FC<ChartXAxisProps> = ({
  ticks,
  y,
  formatter,
  valueFormatter,
  textAnchor = "middle",
  dy = "1.2em",
  className,
  tickClassName,
  ...props
}) => {
  const format = formatter ?? valueFormatter ?? ((v: unknown) => String(v));

  return (
    <g className={cn("chart-x-axis", className)} {...props}>
      {ticks.map((tick, idx) => (
        <text
          key={`x-tick-${idx}-${tick.value}`}
          x={tick.x}
          y={y}
          dy={dy}
          textAnchor={textAnchor}
          fill="currentColor"
          className={cn("chart-x-tick text-xs fill-muted-foreground select-none", tickClassName)}
        >
          {format(tick.value)}
        </text>
      ))}
    </g>
  );
};
ChartXAxis.displayName = "ChartXAxis";

export interface ChartYAxisTick {
  value: number | string;
  y: number;
  [key: string]: unknown;
}

export interface ChartYAxisProps extends React.SVGAttributes<SVGGElement> {
  ticks: ChartYAxisTick[];
  x: number;
  formatter?: (value: unknown) => string;
  valueFormatter?: (value: unknown) => string;
  textAnchor?: "start" | "middle" | "end";
  dx?: string | number;
  dominantBaseline?: "auto" | "middle" | "central" | "hanging" | "alphabetic";
  className?: string;
  tickClassName?: string;
}

/**
 * SVG vertical axis ticks rendering numeric or value labels.
 */
export const ChartYAxis: React.FC<ChartYAxisProps> = ({
  ticks,
  x,
  formatter,
  valueFormatter,
  textAnchor = "end",
  dx = "-0.5em",
  dominantBaseline = "middle",
  className,
  tickClassName,
  ...props
}) => {
  const format = formatter ?? valueFormatter ?? ((v: unknown) => String(v));

  return (
    <g className={cn("chart-y-axis", className)} {...props}>
      {ticks.map((tick, idx) => (
        <text
          key={`y-tick-${idx}-${tick.value}`}
          x={x}
          y={tick.y}
          dx={dx}
          textAnchor={textAnchor}
          dominantBaseline={dominantBaseline}
          fill="currentColor"
          className={cn("chart-y-tick text-xs fill-muted-foreground select-none", tickClassName)}
        >
          {format(tick.value)}
        </text>
      ))}
    </g>
  );
};
ChartYAxis.displayName = "ChartYAxis";

/* =========================================================================
   ChartTooltip
   ========================================================================= */

export interface ChartTooltipItem {
  key?: string;
  label: string;
  value: number | string;
  color?: ChartColor;
  formattedValue?: string;
}

export interface ChartTooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  title?: React.ReactNode;
  items?: ChartTooltipItem[];
  x?: number;
  y?: number;
  open?: boolean;
  crosshairX?: number;
  crosshairHeight?: number;
  showCrosshair?: boolean;
  valueFormatter?: (value: number) => string;
  content?: React.ReactNode;
}

/**
 * Absolute-positioned HTML floating tooltip card with series indicators and crosshair line.
 */
export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  (
    {
      title,
      items,
      x,
      y,
      open = true,
      crosshairX,
      crosshairHeight,
      showCrosshair = false,
      valueFormatter,
      content,
      className,
      style,
      ...props
    },
    ref
  ) => {
    if (!open) {
      return null;
    }

    const hasCoordinates = x !== undefined && y !== undefined;

    return (
      <>
        {showCrosshair && crosshairX !== undefined && (
          <div
            className="chart-crosshair pointer-events-none absolute top-0 w-px border-l border-dashed border-border/80"
            style={{
              left: `${crosshairX}px`,
              height: crosshairHeight !== undefined ? `${crosshairHeight}px` : "100%",
            }}
            aria-hidden="true"
          />
        )}
        <div
          ref={ref}
          className={cn(
            "chart-tooltip pointer-events-none absolute z-50 min-w-[120px] rounded-lg border border-border bg-popover/95 p-2.5 text-xs text-popover-foreground shadow-md backdrop-blur-sm transition-opacity duration-150",
            className
          )}
          style={{
            left: x !== undefined ? `${x}px` : undefined,
            top: y !== undefined ? `${y}px` : undefined,
            transform: hasCoordinates ? "translate(-50%, -100%) translateY(-8px)" : undefined,
            ...style,
          }}
          {...props}
        >
          {content ? (
            content
          ) : (
            <>
              {title && (
                <div className="chart-tooltip-title font-medium text-foreground mb-1.5 pb-1 border-b border-border/50">
                  {title}
                </div>
              )}
              {items && items.length > 0 && (
                <div className="chart-tooltip-items space-y-1">
                  {items.map((item, idx) => {
                    const itemVal =
                      item.formattedValue ??
                      (typeof item.value === "number" && valueFormatter
                        ? valueFormatter(item.value)
                        : item.value);

                    return (
                      <div
                        key={item.key ?? idx}
                        className="chart-tooltip-item flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="chart-tooltip-dot h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: getChartColor(item.color, idx) }}
                            aria-hidden="true"
                          />
                          <span className="truncate text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-semibold text-foreground shrink-0">{itemVal}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }
);
ChartTooltip.displayName = "ChartTooltip";
(ChartTooltip as unknown as { isHtml: boolean }).isHtml = true;

/* =========================================================================
   ChartLegend
   ========================================================================= */

export interface ChartLegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  series: ChartSeries[];
  activeSeries?: string[];
  disabledSeries?: string[];
  onToggle?: (key: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  itemClassName?: string;
}

/**
 * Series labels list with colored indicator dots and optional click/keyboard toggling.
 */
export const ChartLegend: React.FC<ChartLegendProps> = ({
  series,
  activeSeries,
  disabledSeries,
  onToggle,
  orientation = "horizontal",
  className,
  itemClassName,
  ...props
}) => {
  const isInteractive = Boolean(onToggle);

  return (
    <div
      className={cn(
        "chart-legend flex flex-wrap items-center justify-center gap-4 py-2",
        orientation === "vertical" && "flex-col items-start gap-2",
        className
      )}
      {...props}
    >
      {series.map((item, idx) => {
        const isDisabled =
          disabledSeries?.includes(item.key) ||
          (activeSeries !== undefined && !activeSeries.includes(item.key));

        const content = (
          <>
            <span
              className="chart-legend-dot h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getChartColor(item.color, idx) }}
              aria-hidden="true"
            />
            <span className="chart-legend-label">{item.label}</span>
          </>
        );

        if (isInteractive) {
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle?.(item.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle?.(item.key);
                }
              }}
              aria-pressed={!isDisabled}
              className={cn(
                "chart-legend-item inline-flex items-center gap-1.5 text-xs font-medium transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded px-1 py-0.5",
                isDisabled
                  ? "opacity-40 line-through text-muted-foreground"
                  : "text-foreground hover:opacity-80",
                itemClassName
              )}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={item.key}
            className={cn(
              "chart-legend-item inline-flex items-center gap-1.5 text-xs font-medium",
              isDisabled ? "opacity-40 text-muted-foreground" : "text-foreground",
              itemClassName
            )}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};
ChartLegend.displayName = "ChartLegend";
(ChartLegend as unknown as { isHtml: boolean }).isHtml = true;

/* =========================================================================
   ChartA11yTable
   ========================================================================= */

export interface ChartA11yTableProps {
  caption?: string;
  categories?: string[];
  series: ChartSeries[];
  data: Array<Record<string, unknown>> | number[];
  indexKey?: string;
  index?: string;
  valueFormatter?: (value: unknown) => string;
  className?: string;
}

/**
 * Screen reader accessible semantic table hidden with sr-only class complying with WCAG 2.1 AA.
 */
export const ChartA11yTable: React.FC<ChartA11yTableProps> = ({
  caption,
  categories,
  series,
  data,
  indexKey,
  index,
  valueFormatter,
  className,
}) => {
  const categoryKey = indexKey ?? index;

  return (
    <table className={cn("sr-only", className)}>
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">{categoryKey || "Category"}</th>
          {series.map((s) => (
            <th key={s.key} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => {
          let categoryLabel = "";
          if (
            typeof row === "object" &&
            row !== null &&
            categoryKey &&
            row[categoryKey] !== undefined
          ) {
            categoryLabel = String(row[categoryKey]);
          } else if (categories && categories[rowIdx] !== undefined) {
            categoryLabel = String(categories[rowIdx]);
          } else {
            categoryLabel = `Item ${rowIdx + 1}`;
          }

          return (
            <tr key={`a11y-row-${rowIdx}`}>
              <th scope="row">{categoryLabel}</th>
              {series.map((s) => {
                let rawVal: unknown;
                if (typeof row === "number") {
                  rawVal = row;
                } else if (typeof row === "object" && row !== null) {
                  rawVal = row[s.key];
                }

                const displayVal =
                  valueFormatter && typeof rawVal === "number"
                    ? valueFormatter(rawVal)
                    : rawVal !== undefined && rawVal !== null
                      ? String(rawVal)
                      : "-";

                return <td key={s.key}>{displayVal}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
ChartA11yTable.displayName = "ChartA11yTable";
(ChartA11yTable as unknown as { isHtml: boolean }).isHtml = true;
