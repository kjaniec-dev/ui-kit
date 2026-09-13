# KJ Product Kit — Roadmap & Sprints

Plan rozwoju i optymalizacji biblioteki komponentów oraz serwisu dokumentacyjnego podzielony na zwinne sprinty.

---

## 🏃 Sprint 1: Showcase Navigation & Completeness (Szybki zysk)
**Cel:** Kompletna, spójna nawigacja w serwisie dokumentacyjnym (`site/`), uzupełnienie brakujących sekcji w menu bocznym oraz dodanie prezentacji dla brakującego komponentu `PageHeader`.

- [x] **1.1. Synchronizacja `COMPONENT_CATEGORIES` w `site/src/views/components-view.tsx`:**
  - Dodać brakujące sekcje do paska bocznego:
    - `id="avatars-stats"` (Avatars & Stats)
    - `id="accordion"` (Accordion)
    - `id="timeline-code"` (Timeline & CodeBlock)
    - `id="gallery"` (Image Gallery)
    - `id="popover"` (Popover & Tooltip)
  - Rozszerzyć słowa kluczowe (`keywords`) w formularzach o `combobox`, `datepicker`, `daterangepicker`, `dropzone`, `fileupload`.
- [x] **1.2. Uporządkowanie sekcji Accordion:**
  - Usunięcie zduplikowanego renderu Accordion z `site/src/sections/navigation.tsx` na rzecz dedykowanej sekcji w `site/src/sections/data-display.tsx`.
- [x] **1.3. Dodanie prezentacji `PageHeader` w sekcji Layouts:**
  - Zaimportowanie i dodanie przykładu użycia `PageHeader` w `site/src/sections/layouts.tsx` obok `SectionHeader`.
- [x] **1.4. Weryfikacja testów i responsywności:**
  - Aktualizacja testów `site/src/views/components-view.test.tsx` oraz `site/src/main.test.tsx`.
  - Weryfikacja filtrowania i nawigacji na urządzeniach mobilnych oraz desktopie.

---

## 🏃 Sprint 2: Accessibility (a11y) & Biome Fixes (Jakość i standardy)
**Cel:** Eliminacja ostrzeżeń dostępności (WCAG AA), poprawa obsługi czytników ekranowych i klawiatury w interaktywnych komponentach oraz redukcja ostrzeżeń Biome.

- [x] **2.1. Dostępność `Switch`:**
  - Dodanie wymaganego atrybutu `aria-checked` dla elementu z `role="switch"` w `packages/ui/src/components/switch.tsx`.
- [x] **2.2. Dostępność `Toast`:**
  - Zastąpienie klikalnego `div` semantycznym przyciskiem `<button type="button" aria-label="Dismiss toast">` lub obsługa zdarzeń klawiatury (`onKeyDown` Enter/Space).
- [x] **2.3. Dostępność `BottomSheet`:**
  - Poprawa dostępności tła overlay (backdrop) w `packages/ui/src/components/bottom-sheet.tsx`.
- [x] **2.4. Typowanie i eliminacja `noExplicitAny` w pakiecie MCP:**
  - Wprowadzenie dedykowanych typów TypeScript w `packages/mcp/src/extractor.ts` oraz `packages/mcp/src/index.ts`.
- [x] **2.5. Weryfikacja:**
  - Uruchomienie `npm run lint` oraz testów `packages/ui`.

---

## 🏃 Sprint 3: Component Props & API Explorer w Showcase (Dokumentacja)
**Cel:** Interaktywna dokumentacja API każdego komponentu bezpośrednio w serwisie showcase przy wykorzystaniu metadanych wygenerowanych przez MCP (`components.json`).

- [x] **3.1. Utworzenie komponentu `PropsTable`:**
  - Nowy komponent `site/src/components/props-table.tsx` renderujący tabelę parametrów: nazwa propsa, typ TypeScript, czy wymagany, wartość domyślna oraz opis JSDoc.
- [x] **3.2. Integracja metadanych w `ExampleTabs` / sekcjach:**
  - Dodanie nowej zakładki "API / Props" obok podglądu kodu w `ExampleTabs`.
  - Powiązanie komponentów sekcji z danymi z `packages/mcp/data/components.json`.
- [x] **3.3. Testy jednostkowe i weryfikacja:**
  - Dodanie testów `props-table.test.tsx` oraz weryfikacja poprawnego renderowania tabeli propsów.

---

## 🏃 Sprint 4: Pokrycie testami jednostkowymi brakujących 34 komponentów prymitywnych (Stabilność & Jakość)
**Cel:** 100% pokrycia testami jednostkowymi dla wszystkich 66 komponentów biblioteki `packages/ui` (dodanie brakujących 34 zestawów testowych w podziale na grupy tematyczne).

- [x] **4.1. Batch 1A — Form Controls & Actions (12 komponentów w batchu 1):**
  - `button.test.tsx`: testy Button, buttonVariants, stanów disabled/loading, ikon leading/trailing.
  - `input.test.tsx`: testy Input, Textarea, TextField z powiązaniem hintów i błędów przez `aria-describedby`.
  - `checkbox.test.tsx`: testy Checkbox, Radio, CheckboxField z trybem kontrolowanym i niekontrolowanym.
  - `switch.test.tsx`: testy Switch z atrybutem `aria-checked`, stanami kontrolowanymi i niekontrolowanymi.
- [x] **4.2. Batch 1B — Sliders, Segmented & Form Helpers:**
  - `slider.test.tsx`: testy Slider z obliczaniem procentowego gradientu CSS i stylami sliderThumbCSS.
  - `segmented.test.tsx`: testy Segmented (`role="tablist"`, `aria-selected`).
  - `field.test.tsx`: testy Field, Label (ze wskaźnikiem required `*`), Hint (z wariantem błędu).
  - `form-field.test.tsx`: testy FormField z klonowaniem propsów `aria-describedby`, `aria-invalid` i auto-generowanym ID.
- [x] **4.3. Batch 1C — Indicators & Floating Action:**
  - `badge.test.tsx`: testy Badge i 8 wariantów kolorystycznych oraz kropki statusowej.
  - `avatar.test.tsx`: testy Avatar, rozmiarów, tonów, wskaźnika online i kontenera AvatarGroup.
  - `spinner.test.tsx`: testy Spinner (`role="status"`, `aria-label="Loading"`).
  - `fab.test.tsx`: testy Fab, pozycji, wariantu mobileOnly, stanu loading i eksportu `fabVariants`.
- [x] **4.4. Batch 2A — Feedback & Disclosure:**
  - `alert.test.tsx`: testy Alert (`role="alert"`), wariantów, tytułu, ikon.
  - `accordion.test.tsx`: testy Accordion w trybach single i multiple z rozwijaniem i zwijaniem.
  - `breadcrumb.test.tsx`: testy Breadcrumb, BreadcrumbItem (`aria-current="page"`), BreadcrumbSeparator.
  - `pagination.test.tsx`: testy Pagination, przycisków prev/next, stron brzegowych i generowania wielokropków.
- [x] **4.5. Batch 2B — Progress, Stats & Cards:**
  - `progress.test.tsx`: testy Progress (`role="progressbar"`, obcinanie 0-100%, tony).
  - `stat.test.tsx`: testy Stat (trendy up/down, delta).
  - `metric-card.test.tsx`: testy MetricCard (wartości, trendy up/down/neutral, opisy).
  - `card.test.tsx`: pełny zestaw testów dla Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter i polimorfizmu `as`.
- [x] **4.6. Batch 2C — Tables & Empty/Error States:**
  - `table.test.tsx`: testy TableWrap, Table, TableHeader, TableBody, TableRow, TableHead, TableCell z formatowaniem `numeric`.
  - `table-toolbar.test.tsx`: testy TableToolbar z wyszukiwarką, filtrami i akcjami.
  - `empty-state.test.tsx`: testy EmptyState z ikoną, tytułem i akcjami.
  - `error-state.test.tsx`: testy ErrorState z przyciskiem ponowienia akcji `onRetry`.
- [x] **4.7. Batch 3A — Headers & Navigation:**
  - `page-header.test.tsx`: testy PageHeader z eyebrow, tytułem, opisem i akcjami.
  - `sidebar-nav.test.tsx`: testy SidebarNav z grupami, linkami vs buttonami, stanami aktywnymi i badge'ami.
  - `bottom-navigation.test.tsx`: testy BottomNavigation z pozycjonowaniem fixed/relative, trybami showLabels i badge'ami.
- [x] **4.8. Batch 3B — Layout Shells:**
  - `settings-layout.test.tsx`: testy SettingsLayout z panelem bocznym i nagłówkiem.
  - `dashboard-shell.test.tsx`: testy DashboardShell z wariantami szerokości, sticky topbar i mobilnym drawerem.
  - `detail-page-layout.test.tsx`: testy DetailPageLayout z nawigacją wstecz, panelem bocznym i układem siatki.
- [x] **4.9. Batch 3C — Grid, Dialog, Tooltip & Toast:**
  - `calendar-grid.test.tsx`: testy CalendarGrid z roving tabindex, pełną nawigacją klawiaturą (strzałki, Home/End, PageUp/Down) i stylami komórek.
  - `confirm-dialog.test.tsx`: testy ConfirmDialog z tonami, stanem ładowania i zamykaniem na Escape/backdrop.
  - `tooltip.test.tsx`: testy Tooltip z dostępnością klawiatury (`tabIndex={0}`) i rolą tooltip.
  - `toast.test.tsx`: testy ToastProvider i useToast z timerami, dismiss buttonem i animacjami wyjścia.
- [x] **4.10. Weryfikacja końcowa:**
  - 100% pokrycia komponentów (66/66 komponentów przetestowanych).
  - 1,061 testów jednostkowych przechodzi bezbłędnie w całym monorepo.
  - Zero błędów typowania TypeScript i zero błędów lintera.

---

---

## 🏃 Sprint 5: Komponenty Data Visualization (Wizualizacja Danych)
**Cel:** Wprowadzenie do `@kjaniec-dev/ui` autorskiego, lekkiego i w 100% dostępnego zestawu komponentów wizualizacji danych w czystym SVG bez zewnętrznych zależności runtime, zintegrowanego z tokenami `chart1`–`chart6`.

- [x] **5.1. Silnik matematyczny i geometria SVG (`chart-math.ts`):**
  - Funkcje `getNiceScale`, `linearScale`, Catmull-Rom/Bézier `generateLinePath`, zamknięte poligony `generateAreaPath`, układ słupków `calculateBarLayout`, wyliczanie kątów i łuków `calculateDonutSegments`.
  - 29/29 testów jednostkowych algorytmów bez zależności DOM w `chart-math.test.ts`.
- [x] **5.2. Prymitywy bazowe i dostępność (`chart-primitives.tsx`):**
  - `ChartContainer`, `ChartGrid`, `ChartXAxis`, `ChartYAxis`, `ChartTooltip`, `ChartLegend`, oraz semantyczna tabela fallbackowa `ChartA11yTable` (`sr-only` z WCAG AA).
  - Integracja tokenów kolorów `CHART_COLOR_VARS` i `getChartColor`.
  - 26 testów jednostkowych w `chart-primitives.test.tsx`.
- [x] **5.3. Komponent `Sparkline`:**
  - Warianty `line`, `area`, `bar`, wygładzanie krzywych, kropka końcowa `showEndDot`, gradienty.
  - 15 testów w `sparkline.test.tsx` oraz historie Storybook w `sparkline.stories.tsx`.
- [x] **5.4. Komponenty `LineChart` i `AreaChart`:**
  - Wykresy wieloseryjne z osiami X/Y, celownikiem (crosshair), dymkiem podpowiedzi HTML, przełączaniem serii w legendzie i gradientami.
  - 15 testów w `line-chart.test.tsx` oraz historie Storybook w `line-chart.stories.tsx`.
- [x] **5.5. Komponent `BarChart`:**
  - Tryby zgrupowane (`grouped`) i skumulowane (`stacked`), orientacja pionowa i pozioma, zaokrąglone rogi słupków, podświetlenia przy hover i a11y.
  - 15 testów w `bar-chart.test.tsx` oraz historie Storybook w `bar-chart.stories.tsx`.
- [x] **5.6. Komponent `DonutChart`:**
  - Pierścieniowy wykres podziału procentowego, slot na etykietę/metrykę centralną (`centerLabel`), responsywny hover tooltip i legenda.
  - 17 testów w `donut-chart.test.tsx` oraz historie Storybook w `donut-chart.stories.tsx`.
- [x] **5.7. Eksporty w bibliotece i katalog MCP:**
  - Re-eksport wszystkich komponentów i typów TypeScript w `packages/ui/src/index.ts`.
  - Aktualizacja katalogu komponentów MCP w `packages/mcp/data/components.json`.
- [x] **5.8. Prezentacja w serwisie dokumentacyjnym Showcase (`site/`):**
  - Nowa kategoria `"Data Visualization"` i element `"Charts"` w `site/src/views/components-view.tsx`.
  - Nowa sekcja `site/src/sections/charts.tsx` z interaktywnymi kontrolkami i kartami KPI.
  - Zaktualizowane testy nawigacji w `site/src/views/components-view.test.tsx`.
- [x] **5.9. Weryfikacja końcowa:**
  - Ponad 1,179 testów jednostkowych w całym monorepo przechodzi w 100% na zielono.
  - Zero błędów typowania TypeScript i zero błędów lintera Biome.

---

## 🏃 Sprint 6: Finalny Release v1.0.0 (Wersjonowanie, Changelog i Publikacja)
**Cel:** Oficjalne wydanie wersji produkcyjnej `v1.0.0` dla całego ekosystemu KJ Product Kit (`@kjaniec-dev/ui`, `@kjaniec-dev/design`, `@kjaniec-dev/ui-mcp`, `@kjaniec-dev/site`).

- [x] **6.1. Podbicie wersji semantycznej do `1.0.0`:**
  - Podbicie wersji w manifestach: `package.json`, `packages/design/package.json`, `packages/ui/package.json`, `packages/mcp/package.json`, `site/package.json`.
  - Aktualizacja tokenów `packages/design/tokens.json` oraz serwera MCP `packages/mcp/src/index.ts`.
  - Aktualizacja wersji w serwisie dokumentacyjnym (`site/src/components/site-header.tsx`, `site/src/main.tsx`, `site/src/sections/layouts.tsx`, `site/src/views/patterns-view.tsx`).
- [x] **6.2. Aktualizacja dzienników zmian (CHANGELOG.md):**
  - Kompletny wpis `[1.0.0]` w `packages/ui/CHANGELOG.md` podsumowujący moduł Data Visualization, 100% pokrycia testami (1,179 testów), PropsTable oraz ulepszenia dostępności WCAG/Biome.
  - Wpis `[1.0.0]` w `packages/design/CHANGELOG.md` uwzględniający tokeny wykresów `--kj-color-chart-1` do `chart-6`.
- [x] **6.3. Aktualizacja dokumentacji głównej (README.md):**
  - Aktualizacja tabeli pakietów do wersji `1.0.0` oraz aktualizacja liczników komponentów (70+ komponentów, 150+ wariantów).
- [x] **6.4. Weryfikacja jakościowa i artefaktów npm:**
  - Wszystkie 1,179 testów jednostkowych przechodzi bezbłędnie.
  - Zero błędów kompilacji TypeScript (`typecheck`) i zerowa liczba błędów lintera Biome (`lint`).
  - Weryfikacja pakietów do publikacji (`npm pack --dry-run`).

