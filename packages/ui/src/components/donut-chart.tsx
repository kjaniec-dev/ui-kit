"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { calculateDonutSegments, type DonutSegment, type DonutSliceInput } from "./chart-math";
import {
  ChartA11yTable,
  type ChartColor,
  ChartContainer,
  ChartLegend,
  type ChartSeries,
  ChartTooltip,
  DEFAULT_CHART_COLORS,
  getChartColor,
} from "./chart-primitives";

export type DonutChartSize = "sm" | "md" | "lg" | number;

const SIZE_MAP: Record<"sm" | "md" | "lg", number> = {
  sm: 160,
  md: 220,
  lg: 280,
};

function getDimension(size: DonutChartSize = "md"): number {
  if (typeof size === "number") {
    return size > 0 ? size : 220;
  }
  return SIZE_MAP[size] ?? 220;
}

export interface DonutChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of data records to plot. */
  data: Array<Record<string, unknown>>;
  /** Key identifying category label in each data item (e.g. "source", "name"). */
  category: string;
  /** Key identifying numeric value in each data item (e.g. "visitors", "amount"). */
  value: string;
  /** Custom label or metric element rendered in the center hole of the donut ring. */
  centerLabel?: React.ReactNode;
  /** Chart diameter: predefined "sm" (160px), "md" (220px), "lg" (280px) or custom pixel number. Defaults to "md". */
  size?: DonutChartSize;
  /** Inner radius ratio (0 to 1, relative to outerRadius) or absolute pixel radius (> 1). Defaults to 0.65. Set to 0 for pie chart. */
  innerRadius?: number;
  /** Custom color palette or token sequence (e.g. ["chart1", "chart2"] or hex strings). */
  colors?: (ChartColor | string)[];
  /** Whether to render series legend. Defaults to true. */
  showLegend?: boolean;
  /** Whether to display interactive floating tooltip card on slice hover/touch. Defaults to true. */
  showTooltip?: boolean;
  /** Whether to render a semantic hidden table for screen readers. Defaults to true when caption is provided. */
  showA11yTable?: boolean;
  /** Value formatter for numeric tooltip metrics and accessible table values. */
  valueFormatter?: (value: number) => string;
  /** Text to render when `data` is empty. Defaults to "Brak danych do wyświetlenia". */
  emptyMessage?: string;
  /** Accessible label for screen readers. */
  ariaLabel?: string;
  /** Screen reader semantic table caption. */
  caption?: string;
  /** Column header label for numeric metric in screen reader table. Defaults to "Wartość". */
  valueLabel?: string;
  /** Controlled list of active category keys. */
  activeCategories?: string[];
  /** Callback fired when user clicks a legend item to toggle category visibility. */
  onCategoryToggle?: (category: string) => void;
  /** Additional CSS class applied to each SVG path slice. */
  sliceClassName?: string;
}

/**
 * Responsive DonutChart component rendering SVG annular ring segments,
 * center content slot, hover highlights, interactive legend toggling,
 * floating tooltip, and WCAG AA screen reader table.
 */
export const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data,
      category,
      value,
      centerLabel,
      size = "md",
      innerRadius: innerRadiusProp,
      colors,
      showLegend = true,
      showTooltip = true,
      showA11yTable,
      valueFormatter,
      emptyMessage = "Brak danych do wyświetlenia",
      ariaLabel,
      caption,
      valueLabel = "Wartość",
      activeCategories: activeCategoriesProp,
      onCategoryToggle,
      sliceClassName,
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

    // State hooks
    const [internalDisabled, setInternalDisabled] = React.useState<string[]>([]);
    const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

    const safeData = data || [];

    const dimension = getDimension(size);
    const cx = dimension / 2;
    const cy = dimension / 2;
    const padding = 8;
    const outerRadius = Math.max(10, dimension / 2 - padding);

    // Compute inner radius: ratio (0 to 1) or absolute pixels (> 1)
    let computedInnerRadius: number;
    if (innerRadiusProp !== undefined) {
      if (innerRadiusProp >= 0 && innerRadiusProp <= 1) {
        computedInnerRadius = outerRadius * innerRadiusProp;
      } else {
        computedInnerRadius = Math.min(innerRadiusProp, Math.max(0, outerRadius - 4));
      }
    } else {
      computedInnerRadius = outerRadius * 0.65;
    }

    // Prepare legend series with stable colors matching data order
    const legendSeries: ChartSeries[] = React.useMemo(() => {
      return safeData.map((item, idx) => {
        const cat = String(item[category] ?? `Item ${idx + 1}`);
        const rawColor =
          (item.color as string | undefined) ??
          (colors
            ? colors[idx % colors.length]
            : DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]);
        return {
          key: cat,
          label: cat,
          color: rawColor,
        };
      });
    }, [safeData, category, colors]);

    const disabledCategories = activeCategoriesProp
      ? legendSeries.filter((s) => !activeCategoriesProp.includes(s.key)).map((s) => s.key)
      : internalDisabled;

    const handleLegendToggle = (catKey: string) => {
      onCategoryToggle?.(catKey);
      setInternalDisabled((prev) =>
        prev.includes(catKey) ? prev.filter((k) => k !== catKey) : [...prev, catKey]
      );
    };

    // Calculate slice inputs with zero value for disabled categories
    const sliceInputs: DonutSliceInput[] = React.useMemo(() => {
      return safeData.map((item, idx) => {
        const cat = String(item[category] ?? `Item ${idx + 1}`);
        const isDisabled = disabledCategories.includes(cat);
        const rawVal = item[value];
        const numVal =
          typeof rawVal === "number" && Number.isFinite(rawVal) ? rawVal : Number(rawVal) || 0;

        const rawColor =
          (item.color as string | undefined) ??
          (colors
            ? colors[idx % colors.length]
            : DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length]);

        return {
          label: cat,
          value: isDisabled ? 0 : Math.max(0, numVal),
          color: getChartColor(rawColor, idx),
          originalValue: numVal,
          originalIndex: idx,
        };
      });
    }, [safeData, category, value, colors, disabledCategories]);

    const segments: DonutSegment[] = React.useMemo(() => {
      return calculateDonutSegments(sliceInputs, {
        cx,
        cy,
        innerRadius: computedInnerRadius,
        outerRadius,
        startAngle: -90,
      });
    }, [sliceInputs, cx, cy, computedInnerRadius, outerRadius]);

    const computedAriaLabel = props["aria-label"] ?? ariaLabel ?? "Wykres pierścieniowy";

    // Fallback if data is empty
    if (!data || data.length === 0) {
      return (
        <ChartContainer
          ref={combinedRef}
          aria-label={computedAriaLabel}
          className={cn("chart-donut-empty flex flex-col items-center justify-center", className)}
          style={style}
          {...props}
        >
          <div className="chart-empty-message flex min-h-[160px] w-full items-center justify-center text-sm text-muted-foreground select-none">
            {emptyMessage}
          </div>
        </ChartContainer>
      );
    }

    const updateTooltipPosition = (segment: DonutSegment, clientX?: number, clientY?: number) => {
      const midRad = (segment.middleAngle * Math.PI) / 180;
      const midRadius = (computedInnerRadius + outerRadius) / 2;
      const targetX = cx + midRadius * Math.cos(midRad);
      const targetY = cy + midRadius * Math.sin(midRad);

      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        if (
          containerRect.width > 0 &&
          containerRect.height > 0 &&
          clientX !== undefined &&
          clientY !== undefined
        ) {
          setTooltipPos({
            x: clientX - containerRect.left,
            y: clientY - containerRect.top,
          });
          return;
        }
      }

      setTooltipPos({ x: targetX, y: targetY });
    };

    const handleSliceMouseEnter = (
      idx: number,
      segment: DonutSegment,
      e: React.MouseEvent<SVGPathElement>
    ) => {
      if (!showTooltip) return;
      setActiveIdx(idx);
      updateTooltipPosition(segment, e.clientX, e.clientY);
    };

    const handleSliceMouseMove = (
      _idx: number,
      segment: DonutSegment,
      e: React.MouseEvent<SVGPathElement>
    ) => {
      if (!showTooltip) return;
      updateTooltipPosition(segment, e.clientX, e.clientY);
    };

    const handleSliceMouseLeave = () => {
      setActiveIdx(null);
      setTooltipPos(null);
    };

    const handleSliceTouchStart = (
      idx: number,
      segment: DonutSegment,
      e: React.TouchEvent<SVGPathElement>
    ) => {
      if (!showTooltip) return;
      setActiveIdx(idx);
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updateTooltipPosition(segment, touch.clientX, touch.clientY);
      } else {
        updateTooltipPosition(segment);
      }
    };

    const handleSliceTouchEnd = () => {
      setActiveIdx(null);
      setTooltipPos(null);
    };

    const activeSegment = activeIdx !== null && segments[activeIdx] ? segments[activeIdx] : null;

    // Accessible table preparation
    const shouldShowA11yTable = showA11yTable ?? Boolean(caption);
    const a11ySeries: ChartSeries[] = [
      { key: value, label: valueLabel },
      { key: "__percentage__", label: "Udział (%)" },
    ];

    const a11yData = data.map((row) => {
      const cat = String(row[category] ?? "");
      const seg = segments.find((s) => s.label === cat);
      return {
        ...row,
        __percentage__: seg ? `${seg.percentage}%` : "0%",
      };
    });

    const sizeClass =
      typeof size === "number"
        ? undefined
        : size === "sm"
          ? "max-w-[160px] max-h-[160px]"
          : size === "lg"
            ? "max-w-[280px] max-h-[280px]"
            : "max-w-[220px] max-h-[220px]";

    return (
      <ChartContainer
        ref={combinedRef}
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        aria-label={computedAriaLabel}
        className={cn(
          "chart-donut-root relative flex flex-col items-center justify-start mx-auto w-full",
          className
        )}
        svgClassName={cn("chart-donut-svg mx-auto shrink-0", sizeClass)}
        style={
          {
            "--donut-dim": `${dimension}px`,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Slices group */}
        <g className="chart-donut-slices">
          {segments.map((segment, idx) => {
            const isHovered = activeIdx === idx;
            const isDimmed = activeIdx !== null && !isHovered;
            const origVal = (segment.originalValue as number) ?? segment.value;
            const displayVal = valueFormatter ? valueFormatter(origVal) : String(origVal);
            const hasPath = Boolean(segment.path);

            return (
              <path
                key={`slice-${idx}-${segment.label}`}
                className={cn(
                  "chart-donut-slice transition-all duration-150 cursor-pointer outline-none",
                  sliceClassName
                )}
                d={segment.path || ""}
                fill={segment.color}
                opacity={!hasPath ? 0 : isDimmed ? 0.4 : 1}
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: isHovered && hasPath ? "scale(1.03)" : "scale(1)",
                  filter: isHovered && hasPath ? "brightness(1.1)" : undefined,
                  pointerEvents: hasPath ? undefined : "none",
                }}
                tabIndex={hasPath ? 0 : -1}
                role="graphics-symbol"
                aria-label={`${segment.label}: ${displayVal} (${segment.percentage}%)`}
                onMouseEnter={hasPath ? (e) => handleSliceMouseEnter(idx, segment, e) : undefined}
                onMouseMove={hasPath ? (e) => handleSliceMouseMove(idx, segment, e) : undefined}
                onMouseLeave={hasPath ? handleSliceMouseLeave : undefined}
                onTouchStart={hasPath ? (e) => handleSliceTouchStart(idx, segment, e) : undefined}
                onTouchEnd={hasPath ? handleSliceTouchEnd : undefined}
                onFocus={
                  hasPath
                    ? (e) =>
                        handleSliceMouseEnter(
                          idx,
                          segment,
                          e as unknown as React.MouseEvent<SVGPathElement>
                        )
                    : undefined
                }
                onBlur={hasPath ? handleSliceMouseLeave : undefined}
              />
            );
          })}
        </g>

        {/* Center label slot */}
        {centerLabel && (
          <div
            className="chart-donut-center pointer-events-none absolute flex flex-col items-center justify-center text-center select-none"
            style={{
              width: `${Math.max(20, Math.floor(computedInnerRadius * 1.8))}px`,
              height: `${Math.max(20, Math.floor(computedInnerRadius * 1.8))}px`,
              left: "50%",
              top: `${dimension / 2}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {centerLabel}
          </div>
        )}

        {/* Interactive Tooltip */}
        {showTooltip && activeSegment && tooltipPos && activeSegment.path && (
          <ChartTooltip
            open={Boolean(activeSegment)}
            x={tooltipPos.x}
            y={tooltipPos.y}
            items={[
              {
                key: activeSegment.label,
                label: activeSegment.label,
                value: (activeSegment.originalValue as number) ?? activeSegment.value,
                formattedValue: `${
                  valueFormatter
                    ? valueFormatter((activeSegment.originalValue as number) ?? activeSegment.value)
                    : ((activeSegment.originalValue as number) ?? activeSegment.value)
                } (${activeSegment.percentage}%)`,
                color: activeSegment.color,
              },
            ]}
          />
        )}

        {/* Interactive Legend */}
        {showLegend && (
          <ChartLegend
            series={legendSeries}
            disabledSeries={disabledCategories}
            onToggle={handleLegendToggle}
          />
        )}

        {/* Semantic Accessible Table for Screen Readers */}
        {shouldShowA11yTable && (
          <ChartA11yTable
            caption={caption ?? computedAriaLabel}
            series={a11ySeries}
            data={a11yData}
            indexKey={category}
            valueFormatter={(v) =>
              typeof v === "number" && valueFormatter ? valueFormatter(v) : String(v)
            }
          />
        )}
      </ChartContainer>
    );
  }
);

DonutChart.displayName = "DonutChart";
