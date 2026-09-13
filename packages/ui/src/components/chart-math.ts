/**
 * Foundational mathematical geometry engine for Data Visualization components.
 * Pure, zero-dependency functions for scales, curve paths, bar layout, and donut arcs.
 */

export interface NiceScaleResult {
  min: number;
  max: number;
  ticks: number[];
}

export interface Point {
  x: number;
  y: number;
}

export type CurveType = "linear" | "smooth" | "step";

export interface BarDataPoint {
  group: number;
  seriesIndex: number;
  value: number;
  [key: string]: unknown;
}

export interface BarLayoutOptions {
  dataCount: number;
  seriesCount: number;
  plotWidth: number;
  plotHeight: number;
  yDomain: [number, number];
  data: BarDataPoint[];
  mode?: "grouped" | "stacked";
  layout?: "vertical" | "horizontal";
  barMaxWidth?: number;
  groupPadding?: number;
  barPadding?: number;
}

export interface BarRect extends BarDataPoint {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DonutSliceInput {
  label: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

export interface DonutOptions {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle?: number;
}

export interface DonutSegment extends DonutSliceInput {
  percentage: number;
  path: string;
  startAngle: number;
  endAngle: number;
  middleAngle: number;
}

function formatCoordinate(val: number): string {
  if (!Number.isFinite(val)) return "0";
  return Number.isInteger(val) ? val.toString() : Number(val.toFixed(2)).toString();
}

function niceNum(range: number, round: boolean): number {
  if (range <= 0 || !Number.isFinite(range)) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * 10 ** exponent;
}

/**
 * Calculates human-friendly rounded tick marks and bounds for chart axes.
 */
export function getNiceScale(minInput: number, maxInput: number, tickCount = 5): NiceScaleResult {
  let min = Number.isFinite(minInput) ? minInput : 0;
  let max = Number.isFinite(maxInput) ? maxInput : 1;

  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
  }

  if (min === max) {
    if (min === 0) {
      min = 0;
      max = 1;
    } else {
      const delta = Math.abs(min) * 0.2 || 1;
      min = min - delta;
      max = max + delta;
    }
  }

  const rawRange = max - min;
  const count = Math.max(2, tickCount);
  const step = niceNum(rawRange / count, true);

  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  const totalTicks = Math.round((niceMax - niceMin) / step);

  for (let i = 0; i <= totalTicks; i++) {
    const val = niceMin + i * step;
    ticks.push(Number(parseFloat(val.toPrecision(12))));
  }

  return {
    min: Number(parseFloat(niceMin.toPrecision(12))),
    max: Number(parseFloat(niceMax.toPrecision(12))),
    ticks,
  };
}

/**
 * Linearly maps a value from a domain to a range.
 */
export function linearScale(
  val: number,
  domain: [number, number],
  range: [number, number]
): number {
  if (!Number.isFinite(val)) return range[0];
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainDelta = d1 - d0;
  if (domainDelta === 0) {
    return r0;
  }
  const ratio = (val - d0) / domainDelta;
  return r0 + ratio * (r1 - r0);
}

/**
 * Generates an SVG path string for a sequence of points with linear, smooth, or step curves.
 */
export function generateLinePath(points: Point[], curve: CurveType = "linear"): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${formatCoordinate(points[0].x)} ${formatCoordinate(points[0].y)}`;

  if (curve === "step") {
    const commands: string[] = [
      `M ${formatCoordinate(points[0].x)} ${formatCoordinate(points[0].y)}`,
    ];
    for (let i = 1; i < n; i++) {
      const p = points[i];
      commands.push(`H ${formatCoordinate(p.x)} V ${formatCoordinate(p.y)}`);
    }
    return commands.join(" ");
  }

  if (curve === "smooth") {
    const commands: string[] = [
      `M ${formatCoordinate(points[0].x)} ${formatCoordinate(points[0].y)}`,
    ];
    for (let i = 0; i < n - 1; i++) {
      const p0 =
        i > 0
          ? points[i - 1]
          : {
              x: 2 * points[0].x - points[1].x,
              y: 2 * points[0].y - points[1].y,
            };
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 =
        i + 2 < n
          ? points[i + 2]
          : {
              x: 2 * points[n - 1].x - points[n - 2].x,
              y: 2 * points[n - 1].y - points[n - 2].y,
            };

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      commands.push(
        `C ${formatCoordinate(cp1x)} ${formatCoordinate(cp1y)}, ${formatCoordinate(cp2x)} ${formatCoordinate(cp2y)}, ${formatCoordinate(p2.x)} ${formatCoordinate(p2.y)}`
      );
    }
    return commands.join(" ");
  }

  // "linear" default
  const commands = points.map((p, i) =>
    i === 0
      ? `M ${formatCoordinate(p.x)} ${formatCoordinate(p.y)}`
      : `L ${formatCoordinate(p.x)} ${formatCoordinate(p.y)}`
  );
  return commands.join(" ");
}

/**
 * Generates an SVG path string closed to a baseline Y coordinate for area fills.
 */
export function generateAreaPath(
  points: Point[],
  baselineY: number,
  curve: CurveType = "linear"
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${formatCoordinate(p.x)} ${formatCoordinate(p.y)} L ${formatCoordinate(p.x)} ${formatCoordinate(baselineY)} Z`;
  }

  const linePath = generateLinePath(points, curve);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${formatCoordinate(last.x)} ${formatCoordinate(baselineY)} L ${formatCoordinate(first.x)} ${formatCoordinate(baselineY)} Z`;
}

/**
 * Calculates bar layout dimensions and coordinates for grouped or stacked bars.
 */
export function calculateBarLayout(options: BarLayoutOptions): BarRect[] {
  const {
    dataCount,
    seriesCount,
    plotWidth,
    plotHeight,
    yDomain,
    data,
    mode = "grouped",
    layout = "vertical",
    barMaxWidth,
    groupPadding = 0.2,
    barPadding = 2,
  } = options;

  if (data.length === 0 || dataCount <= 0 || seriesCount <= 0) {
    return [];
  }

  const domainSpan = yDomain[1] - yDomain[0];
  const safeDomainSpan = domainSpan !== 0 ? domainSpan : 1;

  const isVertical = layout === "vertical";
  const slotSize = isVertical ? plotWidth / dataCount : plotHeight / dataCount;

  if (isVertical) {
    if (mode === "grouped") {
      const groupWidth = slotSize * (1 - groupPadding);
      const totalGaps = Math.max(0, seriesCount - 1) * barPadding;
      let rawBarWidth = (groupWidth - totalGaps) / seriesCount;
      if (rawBarWidth < 1) rawBarWidth = Math.max(1, groupWidth / seriesCount);
      const barWidth = barMaxWidth ? Math.min(rawBarWidth, barMaxWidth) : rawBarWidth;
      const actualGroupBarsWidth = seriesCount * barWidth + (seriesCount - 1) * barPadding;

      return data.map((item) => {
        const groupStart = item.group * slotSize + (slotSize - actualGroupBarsWidth) / 2;
        const x = groupStart + item.seriesIndex * (barWidth + barPadding);
        const height = (Math.abs(item.value) / safeDomainSpan) * plotHeight;
        const y = plotHeight - height;

        return {
          ...item,
          x: Number(parseFloat(x.toPrecision(10))),
          y: Number(parseFloat(y.toPrecision(10))),
          width: Number(parseFloat(barWidth.toPrecision(10))),
          height: Number(parseFloat(height.toPrecision(10))),
        };
      });
    }

    // Stacked vertical
    const rawBarWidth = slotSize * (1 - groupPadding);
    const barWidth = barMaxWidth ? Math.min(rawBarWidth, barMaxWidth) : rawBarWidth;
    const currentStackTops = new Map<number, number>();

    return data.map((item) => {
      const groupCenter = item.group * slotSize + slotSize / 2;
      const x = groupCenter - barWidth / 2;
      const height = (Math.abs(item.value) / safeDomainSpan) * plotHeight;

      const currentY = currentStackTops.get(item.group) ?? plotHeight;
      const y = currentY - height;
      currentStackTops.set(item.group, y);

      return {
        ...item,
        x: Number(parseFloat(x.toPrecision(10))),
        y: Number(parseFloat(y.toPrecision(10))),
        width: Number(parseFloat(barWidth.toPrecision(10))),
        height: Number(parseFloat(height.toPrecision(10))),
      };
    });
  }

  // Horizontal layout
  if (mode === "grouped") {
    const groupHeight = slotSize * (1 - groupPadding);
    const totalGaps = Math.max(0, seriesCount - 1) * barPadding;
    let rawBarHeight = (groupHeight - totalGaps) / seriesCount;
    if (rawBarHeight < 1) rawBarHeight = Math.max(1, groupHeight / seriesCount);
    const barHeight = barMaxWidth ? Math.min(rawBarHeight, barMaxWidth) : rawBarHeight;
    const actualGroupBarsHeight = seriesCount * barHeight + (seriesCount - 1) * barPadding;

    return data.map((item) => {
      const groupStart = item.group * slotSize + (slotSize - actualGroupBarsHeight) / 2;
      const y = groupStart + item.seriesIndex * (barHeight + barPadding);
      const width = (Math.abs(item.value) / safeDomainSpan) * plotWidth;
      const x = 0;

      return {
        ...item,
        x: Number(parseFloat(x.toPrecision(10))),
        y: Number(parseFloat(y.toPrecision(10))),
        width: Number(parseFloat(width.toPrecision(10))),
        height: Number(parseFloat(barHeight.toPrecision(10))),
      };
    });
  }

  // Stacked horizontal
  const rawBarHeight = slotSize * (1 - groupPadding);
  const barHeight = barMaxWidth ? Math.min(rawBarHeight, barMaxWidth) : rawBarHeight;
  const currentStackRights = new Map<number, number>();

  return data.map((item) => {
    const groupCenter = item.group * slotSize + slotSize / 2;
    const y = groupCenter - barHeight / 2;
    const width = (Math.abs(item.value) / safeDomainSpan) * plotWidth;

    const currentX = currentStackRights.get(item.group) ?? 0;
    const x = currentX;
    currentStackRights.set(item.group, currentX + width);

    return {
      ...item,
      x: Number(parseFloat(x.toPrecision(10))),
      y: Number(parseFloat(y.toPrecision(10))),
      width: Number(parseFloat(width.toPrecision(10))),
      height: Number(parseFloat(barHeight.toPrecision(10))),
    };
  });
}

/**
 * Calculates donut or pie arc segment angles, percentages, and SVG path commands.
 */
export function calculateDonutSegments(
  slices: DonutSliceInput[],
  options: DonutOptions
): DonutSegment[] {
  const { cx, cy, innerRadius, outerRadius, startAngle = -90 } = options;

  if (slices.length === 0) {
    return [];
  }

  const total = slices.reduce((sum, s) => sum + (s.value > 0 ? s.value : 0), 0);

  if (total === 0) {
    return slices.map((slice) => ({
      ...slice,
      percentage: 0,
      path: "",
      startAngle: 0,
      endAngle: 0,
      middleAngle: 0,
    }));
  }

  let currentAngleRad = (startAngle * Math.PI) / 180;
  const segments: DonutSegment[] = [];

  for (const slice of slices) {
    if (slice.value <= 0) {
      segments.push({
        ...slice,
        percentage: 0,
        path: "",
        startAngle: Number(parseFloat((currentAngleRad * (180 / Math.PI)).toPrecision(8))),
        endAngle: Number(parseFloat((currentAngleRad * (180 / Math.PI)).toPrecision(8))),
        middleAngle: Number(parseFloat((currentAngleRad * (180 / Math.PI)).toPrecision(8))),
      });
      continue;
    }

    const ratio = slice.value / total;
    const percentage = Math.round(ratio * 10000) / 100;
    const angleSpanRad = ratio * 2 * Math.PI;
    const startA = currentAngleRad;
    const endA = currentAngleRad + angleSpanRad;
    const middleA = currentAngleRad + angleSpanRad / 2;
    currentAngleRad = endA;

    const startDeg = Number(parseFloat((startA * (180 / Math.PI)).toPrecision(8)));
    const endDeg = Number(parseFloat((endA * (180 / Math.PI)).toPrecision(8)));
    const middleDeg = Number(parseFloat((middleA * (180 / Math.PI)).toPrecision(8)));

    // Full 360-degree slice
    if (ratio >= 0.99999) {
      let fullPath = "";
      if (innerRadius > 0) {
        fullPath = `M ${formatCoordinate(cx)} ${formatCoordinate(cy - outerRadius)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 1 1 ${formatCoordinate(cx)} ${formatCoordinate(cy + outerRadius)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 1 1 ${formatCoordinate(cx)} ${formatCoordinate(cy - outerRadius)} L ${formatCoordinate(cx)} ${formatCoordinate(cy - innerRadius)} A ${formatCoordinate(innerRadius)} ${formatCoordinate(innerRadius)} 0 1 0 ${formatCoordinate(cx)} ${formatCoordinate(cy + innerRadius)} A ${formatCoordinate(innerRadius)} ${formatCoordinate(innerRadius)} 0 1 0 ${formatCoordinate(cx)} ${formatCoordinate(cy - innerRadius)} Z`;
      } else {
        fullPath = `M ${formatCoordinate(cx)} ${formatCoordinate(cy - outerRadius)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 1 1 ${formatCoordinate(cx)} ${formatCoordinate(cy + outerRadius)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 1 1 ${formatCoordinate(cx)} ${formatCoordinate(cy - outerRadius)} Z`;
      }

      segments.push({
        ...slice,
        percentage,
        path: fullPath,
        startAngle: startDeg,
        endAngle: endDeg,
        middleAngle: middleDeg,
      });
      continue;
    }

    const x1 = cx + outerRadius * Math.cos(startA);
    const y1 = cy + outerRadius * Math.sin(startA);
    const x2 = cx + outerRadius * Math.cos(endA);
    const y2 = cy + outerRadius * Math.sin(endA);

    const largeArcFlag = angleSpanRad > Math.PI ? 1 : 0;

    let path = "";
    if (innerRadius > 0) {
      const x3 = cx + innerRadius * Math.cos(endA);
      const y3 = cy + innerRadius * Math.sin(endA);
      const x4 = cx + innerRadius * Math.cos(startA);
      const y4 = cy + innerRadius * Math.sin(startA);

      path = `M ${formatCoordinate(x1)} ${formatCoordinate(y1)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 ${largeArcFlag} 1 ${formatCoordinate(x2)} ${formatCoordinate(y2)} L ${formatCoordinate(x3)} ${formatCoordinate(y3)} A ${formatCoordinate(innerRadius)} ${formatCoordinate(innerRadius)} 0 ${largeArcFlag} 0 ${formatCoordinate(x4)} ${formatCoordinate(y4)} Z`;
    } else {
      path = `M ${formatCoordinate(x1)} ${formatCoordinate(y1)} A ${formatCoordinate(outerRadius)} ${formatCoordinate(outerRadius)} 0 ${largeArcFlag} 1 ${formatCoordinate(x2)} ${formatCoordinate(y2)} L ${formatCoordinate(cx)} ${formatCoordinate(cy)} Z`;
    }

    segments.push({
      ...slice,
      percentage,
      path,
      startAngle: startDeg,
      endAngle: endDeg,
      middleAngle: middleDeg,
    });
  }

  return segments;
}
