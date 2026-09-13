# Sprint 5: Data Visualization Components Design Specification

- **Date:** 2026-09-13
- **Status:** Approved
- **Scope:** Sprint 5 — Data Visualization (`Sparkline`, `LineChart`, `AreaChart`, `BarChart`, `DonutChart`)
- **Package:** `@kjaniec-dev/ui`, `@kjaniec-dev/design`, `site/`

---

## 1. Cel i Kontekst

Celem Sprintu 5 jest rozszerzenie biblioteki `@kjaniec-dev/ui` o zestaw nowoczesnych, lekkich i w 100% dostępnych (WCAG 2.1 AA) komponentów wizualizacji danych (Data Visualization). 

Komponenty te:
- Wykorzystują autorski, czysty rendering wektorowy SVG bez zewnętrznych ciężkich bibliotek (zero dodatkowych zależności runtime w `@kjaniec-dev/ui`).
- Bezpośrednio integrują się z tokenami kolorystycznymi `--kj-chart1` do `--kj-chart6` (oraz klasami Tailwind `color-chart1`–`chart6`).
- W pełni wspierają tryby jasny i ciemny (Light & Dark mode).
- Posiadają wbudowaną dostępność dla czytników ekranowych za pośrednictwem semantycznej tabeli fallbackowej (`sr-only`).
- Zapewniają intuicyjne API oparte na tabelarycznych tablicach obiektów (styl Tremor/Recharts).

---

## 2. Architektura i Podział Plików

Struktura plików w `packages/ui/src/components/`:

```
packages/ui/src/components/
├── chart-math.ts              # Czyste funkcje matematyczne, skale, łuki, interpolacja ścieżek
├── chart-math.test.ts         # Testy jednostkowe geometrii i kalkulacji
├── chart-primitives.tsx       # ChartContainer, ChartGrid, ChartAxis, ChartTooltip, ChartLegend, ChartA11yTable
├── sparkline.tsx              # Kompaktowy mini-wykres (warianty: line, area, bar)
├── sparkline.test.tsx         # Testy jednostkowe Sparkline
├── sparkline.stories.tsx      # Historie Storybook
├── line-chart.tsx             # Wykres liniowy i warstwowy (LineChart, AreaChart)
├── line-chart.test.tsx        # Testy jednostkowe LineChart & AreaChart
├── line-chart.stories.tsx     # Historie Storybook
├── bar-chart.tsx              # Wykres słupkowy (pionowy, poziomy, zgrupowany, skumulowany)
├── bar-chart.test.tsx         # Testy jednostkowe BarChart
├── bar-chart.stories.tsx      # Historie Storybook
├── donut-chart.tsx            # Wykres pierścieniowy z centralną etykietą/metryką
├── donut-chart.test.tsx       # Testy jednostkowe DonutChart
└── donut-chart.stories.tsx    # Historie Storybook
```

Eksporty w `packages/ui/src/index.ts`:
- Wszystkie komponenty wykresów, typy propsów, definicje serii (`ChartSeries`) i palety kolorów (`ChartColor`).

Integracja w serwisie dokumentacyjnym `site/`:
- `site/src/sections/charts.tsx` — sekcja prezentacji wszystkich typów wykresów z interaktywnymi kontrolkami.
- `site/src/views/components-view.tsx` — dodanie kategorii `data-visualization` w menu bocznym i wyszukiwarce.

---

## 3. Szczegółowy Projekt Komponentów

### 3.1. Typy Wspólne (`ChartSeries`, `ChartColor`)

```typescript
export type ChartColor =
  | "chart1"
  | "chart2"
  | "chart3"
  | "chart4"
  | "chart5"
  | "chart6"
  | (string & {});

export interface ChartSeries {
  /** Klucz odpowiadający polu w obiektach danych, np. "revenue". */
  key: string;
  /** Czytelna etykieta wyświetlana w legendzie i dymku tooltipa, np. "Przychód". */
  label: string;
  /** Kolor serii z palety chart1–chart6 lub dowolny kolor CSS. Domyślnie przypisywany z palety wg kolejności. */
  color?: ChartColor;
}

export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
```

Mapowanie tokenów na kolory CSS:
- `chart1`: `var(--kj-chart1)` (Amber: `#a84f08` light / `#f5b82e` dark)
- `chart2`: `var(--kj-chart2)` (Teal: `#0f746d` light / `#38c6b7` dark)
- `chart3`: `var(--kj-chart3)` (Sky: `#0284c7` light / `#38bdf8` dark)
- `chart4`: `var(--kj-chart4)` (Violet: `#7c3aed` light / `#a78bfa` dark)
- `chart5`: `var(--kj-chart5)` (Rose: `#e11d48` light / `#fb7185` dark)
- `chart6`: `var(--kj-chart6)` (Lime: `#65a30d` light / `#a3e635` dark)

---

### 3.2. Silnik Matematyczny (`chart-math.ts`)

Czyste funkcje bez zależności od środowiska DOM:
1. `getNiceScale(min: number, max: number, tickCount?: number)`:
   - Wyznacza zaokrąglone granice osi i listę wartości podziałek (np. min=3, max=88 -> `[0, 20, 40, 60, 80, 100]`).
   - Bezpiecznie obsługuje przypadek min === max oraz same wartości ujemne.
2. `linearScale(value: number, domain: [number, number], range: [number, number]): number`:
   - Liniowe mapowanie wartości ze skali danych na piksele obszaru rysowania.
3. `generateLinePath(points: Array<{ x: number; y: number }>, curve?: "linear" | "smooth" | "step"): string`:
   - `linear`: proste odcinki `L x y`.
   - `smooth`: krzywe sześcienne Béziera z gładką kontrolą stycznych (Catmull-Rom / monotonic cubic) eliminujące przesterowania i pętle.
   - `step`: schodkowe przejścia `H x V y`.
4. `generateAreaPath(points: Array<{ x: number; y: number }>, baselineY: number, curve?: "linear" | "smooth" | "step"): string`:
   - Zamyka linię do poziomu `baselineY` tworząc wielokąt do gradientowego wypełnienia.
5. `calculateBarLayout(options: BarLayoutOptions)`:
   - Wylicza współrzędne `x, y, width, height` dla każdego słupka w trybie `grouped` oraz `stacked`, z zachowaniem `barMaxWidth` i `gap`.
6. `calculateDonutSegments(data: Array<{ value: number; label: string }>, options: DonutLayoutOptions)`:
   - Wylicza kąty początkowe i końcowe oraz generuje komendy łuków `M ... A ... L ... A ... Z`.

---

### 3.3. Prymitywy Bazowe (`chart-primitives.tsx`)

1. **`ChartContainer`:**
   - Zarządza kontenerem `relative w-full`, obsługuje stałą wysokość lub proporcje aspect ratio.
   - Posiada `svg` z `viewBox` dopasowanym do szerokości i wysokości roboczej.
2. **`ChartGrid`:**
   - Rysuje przerywane lub ciągłe linie siatki poziomej (i opcjonalnie pionowej) w kolorze `--kj-border-subtle`.
3. **`ChartXAxis` & `ChartYAxis`:**
   - Renderują czytelne znaczniki tekstowe z wyrównaniem i opcjonalnym formaterem `valueFormatter`.
4. **`ChartTooltip`:**
   - Pływający div HTML pozycjonowany bezwzględnie w kontenerze.
   - Zawiera nagłówek kategorii/daty, kolorowe kropki serii, nazwy i wartości.
   - Posiada linię celownika (`crosshair`) lub podświetlenie aktywnego słupka/wycinka.
5. **`ChartLegend`:**
   - Pasek z listą serii pod lub nad wykresem.
   - Opcjonalne przełączanie widoczności serii przy kliknięciu.
6. **`ChartA11yTable`:**
   - Niewidoczna wizualnie tabela HTML (`sr-only`), renderująca semantyczny zrzut danych dla czytników ekranu.

---

### 3.4. Komponenty Gotowe (High-Level)

#### 1. `Sparkline`
- **Przeznaczenie:** Karty metryk (`MetricCard`), wiersze tabeli (`DataTable`), statusy KPI.
- **Props:**
  - `data: number[] | Record<string, any>[]`
  - `dataKey?: string`
  - `variant?: "line" | "area" | "bar"` (domyślnie `"line"`)
  - `curve?: "linear" | "smooth"` (domyślnie `"smooth"`)
  - `color?: ChartColor` (domyślnie `"chart1"`)
  - `strokeWidth?: number` (domyślnie `2`)
  - `showEndDot?: boolean` (akcentująca kropka na ostatniej wartości)
  - `showGradient?: boolean` (dla wariantu `"area"`)
  - `height?: number` (domyślnie `36`)

#### 2. `LineChart` oraz `AreaChart`
- **Przeznaczenie:** Trendy czasowe, metryki biznesowe, porównanie wielu serii.
- **Props:**
  - `data: T[]`
  - `index: keyof T`
  - `series: ChartSeries[]`
  - `variant?: "line" | "area"` (domyślnie `"line"`)
  - `curve?: "linear" | "smooth" | "step"`
  - `showGrid?: boolean` (domyślnie `true`)
  - `showXAxis?: boolean` (domyślnie `true`)
  - `showYAxis?: boolean` (domyślnie `true`)
  - `showLegend?: boolean` (domyślnie `true` gdy seria > 1)
  - `showTooltip?: boolean` (domyślnie `true`)
  - `valueFormatter?: (value: number) => string`
  - `emptyMessage?: string` (domyślnie `"Brak danych do wyświetlenia"`)
  - `height?: number | string` (domyślnie `280`)

#### 3. `BarChart`
- **Przeznaczenie:** Porównania wielkości między kategoriami.
- **Props:**
  - `data: T[]`
  - `index: keyof T`
  - `series: ChartSeries[]`
  - `type?: "grouped" | "stacked"` (domyślnie `"grouped"`)
  - `layout?: "vertical" | "horizontal"` (domyślnie `"vertical"`)
  - `radius?: number` (domyślnie `4`)
  - `showGrid?: boolean`
  - `showXAxis?: boolean`
  - `showYAxis?: boolean`
  - `showLegend?: boolean`
  - `showTooltip?: boolean`
  - `valueFormatter?: (value: number) => string`
  - `height?: number | string` (domyślnie `280`)

#### 4. `DonutChart`
- **Przeznaczenie:** Udziały procentowe, struktura sprzedaży/użytkowników.
- **Props:**
  - `data: T[]`
  - `category: keyof T`
  - `value: keyof T`
  - `colors?: ChartColor[]`
  - `innerRadius?: number` (domyślnie `0.65`)
  - `centerLabel?: React.ReactNode`
  - `showLegend?: boolean`
  - `showTooltip?: boolean`
  - `valueFormatter?: (value: number, total: number) => string`
  - `size?: "sm" | "md" | "lg" | number` (domyślnie `"md"` = 220px)

---

## 4. Dostępność (a11y) i WCAG 2.1 AA

1. **Reprezentacja semantyczna:**
   - SVG otrzymuje `role="img"` oraz wyliczony `aria-label` (np. `"Wykres sprzedaży od stycznia do grudnia"`).
   - Wewnątrz kontenera renderowana jest tabela `<table className="sr-only">` z nagłówkami kolumn i wierszy odpowiadającymi danym, co pozwala użytkownikom czytników ekranowych na wygodne przeglądanie wartości tabelarycznych.
2. **Klawiatura i fokus:**
   - Punkty wykresu i elementy legendy mogą otrzymywać fokus (`tabIndex={0}`) z obsługą klawiatury (Enter/Spacja przełącza serię lub aktywuje dymek z informacją).
3. **Kontrast i tryby ciemne:**
   - Wszystkie kolory `chart1`–`chart6` posiadają gwarantowany kontrast WCAG AA zarówno w motywie jasnym, jak i ciemnym, zgodnie z paletą zdefiniowaną w `packages/design/tokens.json`.

---

## 5. Integracja i Prezentacja w Showcase (`site/`)

1. **Nowa sekcja w menu:**
   - W `site/src/views/components-view.tsx` dodana kategoria `"Data Visualization"` pod kluczem `id="data-visualization"`.
2. **Przykłady interaktywne:**
   - `MetricCard` ze zintegrowanymi `Sparkline` (wariant liniowy, słupkowy i warstwowy).
   - `LineChart` i `AreaChart` z filtrowaniem serii i przełączaniem zakresów.
   - `BarChart` ze zmianą trybu (`grouped` vs `stacked`).
   - `DonutChart` z interaktywnym podświetlaniem wycinków.
3. **Ekstraktor MCP:**
   - Uruchomienie `npm run mcp:extract` w celu zarejestrowania nowych komponentów w `packages/mcp/data/components.json` i udostępnienia ich parametrów w eksploratorze API Props.

---

## 6. Plan Weryfikacji i Kryteria Sukcesu

- Wszystkie funkcje w `chart-math.test.ts` przechodzą testy (skrajne przypadki, 0, puste tablice, liczby ujemne).
- Każdy komponent posiada plik `.test.tsx` z pełnym pokryciem testami renderowania, a11y i zdarzeń.
- `npm run typecheck` przechodzi bez błędów w całym monorepo.
- `npm run lint` (Biome) przechodzi z kodem 0.
- `npm test` przechodzi bezbłędnie (wszystkie testy istniejące + nowe).
- Serwis `site/` uruchamia się i prawidłowo renderuje nową sekcję Data Visualization na desktopie i mobile.
