import {
  AreaChart,
  Badge,
  BarChart,
  type BarChartLayout,
  type BarChartType,
  Card,
  type ChartSeries,
  DonutChart,
  LineChart,
  type LineChartCurve,
  Segmented,
  Sparkline,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kjaniec-dev/ui";
import * as React from "react";
import { Box, Sec, Sub } from "./primitives";

/* -------------------------------------------------------------------------- */
/* Section 1: KPI Cards with Sparklines                                       */
/* -------------------------------------------------------------------------- */

const revenueSparklineData = [38, 45, 42, 58, 64, 61, 75, 84, 92, 108, 102, 128];
const usersSparklineData = [18, 22, 19, 26, 31, 28, 35, 39, 36, 42, 45, 48];
const conversionSparklineData = [2.8, 3.1, 2.9, 3.2, 3.0, 3.4, 3.3, 3.6, 3.5, 3.7, 3.6, 3.84];

export function KpiCardsDemo() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <Sub className="mb-1">1. KPI Cards & Embedded Sparklines</Sub>
          <p className="text-xs text-muted-foreground m-0">
            Lightweight sparklines embedded into metric cards for high-density dashboards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
            <Badge variant="success" dot>
              +14.2%
            </Badge>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground mb-3">$128,450</div>
          <div className="w-full">
            <Sparkline
              data={revenueSparklineData}
              variant="area"
              color="chart1"
              height={44}
              ariaLabel="Revenue trend over 12 months"
            />
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Active Users
            </span>
            <Badge variant="success" dot>
              +8.7%
            </Badge>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground mb-3">24,890</div>
          <div className="w-full">
            <Sparkline
              data={usersSparklineData}
              variant="bar"
              color="chart2"
              height={44}
              barRadius={2}
              ariaLabel="Active users trend"
            />
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Conversion Rate
            </span>
            <Badge variant="info" dot>
              +0.45%
            </Badge>
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground mb-3">3.84%</div>
          <div className="w-full">
            <Sparkline
              data={conversionSparklineData}
              variant="line"
              color="chart3"
              height={44}
              showEndDot
              ariaLabel="Conversion rate trend"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section 2: LineChart & AreaChart with Timeframe Toggle                     */
/* -------------------------------------------------------------------------- */

const lineData7d = [
  { date: "Mon", organic: 1200, paid: 850, direct: 450 },
  { date: "Tue", organic: 1450, paid: 920, direct: 510 },
  { date: "Wed", organic: 1380, paid: 980, direct: 490 },
  { date: "Thu", organic: 1620, paid: 1100, direct: 580 },
  { date: "Fri", organic: 1850, paid: 1250, direct: 620 },
  { date: "Sat", organic: 1400, paid: 890, direct: 410 },
  { date: "Sun", organic: 1280, paid: 820, direct: 390 },
];

const lineData30d = [
  { date: "May 1", organic: 8500, paid: 5200, direct: 3100 },
  { date: "May 6", organic: 9200, paid: 5800, direct: 3400 },
  { date: "May 11", organic: 9800, paid: 6100, direct: 3600 },
  { date: "May 16", organic: 11200, paid: 6900, direct: 4100 },
  { date: "May 21", organic: 12400, paid: 7500, direct: 4500 },
  { date: "May 26", organic: 13800, paid: 8200, direct: 4900 },
  { date: "May 31", organic: 15100, paid: 9100, direct: 5300 },
];

const lineData90d = [
  { date: "W1", organic: 24000, paid: 15000, direct: 9000 },
  { date: "W3", organic: 27500, paid: 16800, direct: 10200 },
  { date: "W5", organic: 31000, paid: 19200, direct: 11500 },
  { date: "W7", organic: 36200, paid: 21500, direct: 13100 },
  { date: "W9", organic: 41000, paid: 24000, direct: 14800 },
  { date: "W11", organic: 46500, paid: 27200, direct: 16500 },
  { date: "W13", organic: 52000, paid: 30500, direct: 18200 },
];

const lineSeries: ChartSeries[] = [
  { key: "organic", label: "Organic Search", color: "chart1" },
  { key: "paid", label: "Paid Media", color: "chart2" },
  { key: "direct", label: "Direct Traffic", color: "chart3" },
];

export function LineAreaDemo() {
  const [timeframe, setTimeframe] = React.useState<"7d" | "30d" | "90d">("30d");
  const [chartType, setChartType] = React.useState<"area" | "line">("area");
  const [curve, setCurve] = React.useState<LineChartCurve>("smooth");

  const currentData = React.useMemo(() => {
    switch (timeframe) {
      case "7d":
        return lineData7d;
      case "90d":
        return lineData90d;
      case "30d":
      default:
        return lineData30d;
    }
  }, [timeframe]);

  const valueFormatter = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return `${value}`;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <Sub className="mb-1">2. Multi-Series Line & Area Chart</Sub>
          <p className="text-xs text-muted-foreground m-0">
            Interactive multi-series trends with timeframe filtering, curve modes, and floating
            crosshairs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { value: "area", label: "Area" },
              { value: "line", label: "Line" },
            ]}
            value={chartType}
            onChange={setChartType}
            aria-label="Chart representation"
          />
          <Segmented
            options={[
              { value: "smooth", label: "Smooth" },
              { value: "linear", label: "Linear" },
              { value: "step", label: "Step" },
            ]}
            value={curve}
            onChange={setCurve}
            aria-label="Interpolation curve"
          />
          <Segmented
            options={[
              { value: "7d", label: "7D" },
              { value: "30d", label: "30D" },
              { value: "90d", label: "90D" },
            ]}
            value={timeframe}
            onChange={setTimeframe}
            aria-label="Time period"
          />
        </div>
      </div>

      <div className="w-full bg-card/50 rounded-kj-lg border border-border/60 p-4">
        {chartType === "area" ? (
          <AreaChart
            data={currentData}
            index="date"
            series={lineSeries}
            curve={curve}
            height={320}
            valueFormatter={valueFormatter}
          />
        ) : (
          <LineChart
            data={currentData}
            index="date"
            series={lineSeries}
            curve={curve}
            height={320}
            valueFormatter={valueFormatter}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section 3: BarChart comparing Sales by Department                          */
/* -------------------------------------------------------------------------- */

const departmentSalesData = [
  { department: "Sales", q1: 145000, q2: 172000, q3: 188000, q4: 215000 },
  { department: "Marketing", q1: 88000, q2: 104000, q3: 118000, q4: 135000 },
  { department: "Engineering", q1: 195000, q2: 210000, q3: 225000, q4: 248000 },
  { department: "Support", q1: 54000, q2: 62000, q3: 69000, q4: 78000 },
  { department: "Product", q1: 112000, q2: 128000, q3: 142000, q4: 160000 },
];

const barSeries: ChartSeries[] = [
  { key: "q1", label: "Q1", color: "chart1" },
  { key: "q2", label: "Q2", color: "chart2" },
  { key: "q3", label: "Q3", color: "chart3" },
  { key: "q4", label: "Q4", color: "chart4" },
];

export function BarChartDemo() {
  const [barType, setBarType] = React.useState<BarChartType>("grouped");
  const [barLayout, setBarLayout] = React.useState<BarChartLayout>("vertical");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <Sub className="mb-1">3. Bar Chart (Sales by Department)</Sub>
          <p className="text-xs text-muted-foreground m-0">
            Compare categories with grouped side-by-side or stacked totals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { value: "grouped", label: "Grouped" },
              { value: "stacked", label: "Stacked" },
            ]}
            value={barType}
            onChange={setBarType}
            aria-label="Bar presentation mode"
          />
          <Segmented
            options={[
              { value: "vertical", label: "Vertical" },
              { value: "horizontal", label: "Horizontal" },
            ]}
            value={barLayout}
            onChange={setBarLayout}
            aria-label="Bar orientation"
          />
        </div>
      </div>

      <div className="w-full bg-card/50 rounded-kj-lg border border-border/60 p-4">
        <BarChart
          data={departmentSalesData}
          index="department"
          series={barSeries}
          type={barType}
          layout={barLayout}
          height={320}
          valueFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section 4: DonutChart showing Traffic Sources Breakdown                    */
/* -------------------------------------------------------------------------- */

const trafficSourcesData = [
  { source: "Organic Search", visitors: 45200 },
  { source: "Direct Traffic", visitors: 28400 },
  { source: "Referral", visitors: 16800 },
  { source: "Social Media", visitors: 9600 },
  { source: "Email Campaigns", visitors: 5000 },
];

export function DonutChartDemo() {
  const [size, setSize] = React.useState<"sm" | "md" | "lg">("md");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <Sub className="mb-1">4. Donut Chart (Traffic Sources)</Sub>
          <p className="text-xs text-muted-foreground m-0">
            Categorical breakdown with central KPI metric and interactive slices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            options={[
              { value: "sm", label: "SM" },
              { value: "md", label: "MD" },
              { value: "lg", label: "LG" },
            ]}
            value={size}
            onChange={setSize}
            aria-label="Donut diameter size"
          />
        </div>
      </div>

      <div className="w-full bg-card/50 rounded-kj-lg border border-border/60 p-4 flex flex-col items-center justify-center">
        <DonutChart
          data={trafficSourcesData}
          category="source"
          value="visitors"
          size={size}
          valueFormatter={(v) => `${v.toLocaleString()} visits`}
          centerLabel={
            <div className="flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">105k</span>
              <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                Total Visits
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Charts Section Container                                              */
/* -------------------------------------------------------------------------- */

export function ChartsSection() {
  return (
    <Sec
      id="charts"
      title="Charts"
      desc="Responsive SVG charts with smooth curves, automatic nice-scaling, hover crosshairs, floating tooltips, legend toggling, dark mode support, and WCAG AA accessibility tables."
      components={["Sparkline", "LineChart", "AreaChart", "BarChart", "DonutChart"]}
    >
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="overview">All Demos</TabsTrigger>
          <TabsTrigger value="kpi">KPI Cards & Sparklines</TabsTrigger>
          <TabsTrigger value="line-area">Line & Area Charts</TabsTrigger>
          <TabsTrigger value="bars">Bar Chart</TabsTrigger>
          <TabsTrigger value="donut">Donut Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="flex flex-col gap-6">
            <Box className="mb-0">
              <KpiCardsDemo />
            </Box>
            <Box className="mb-0">
              <LineAreaDemo />
            </Box>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Box className="mb-0">
                <BarChartDemo />
              </Box>
              <Box className="mb-0">
                <DonutChartDemo />
              </Box>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kpi">
          <Box className="mb-0">
            <KpiCardsDemo />
          </Box>
        </TabsContent>

        <TabsContent value="line-area">
          <Box className="mb-0">
            <LineAreaDemo />
          </Box>
        </TabsContent>

        <TabsContent value="bars">
          <Box className="mb-0">
            <BarChartDemo />
          </Box>
        </TabsContent>

        <TabsContent value="donut">
          <Box className="mb-0">
            <DonutChartDemo />
          </Box>
        </TabsContent>
      </Tabs>
    </Sec>
  );
}
