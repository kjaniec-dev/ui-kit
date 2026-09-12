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

- [ ] **2.1. Dostępność `Switch`:**
  - Dodanie wymaganego atrybutu `aria-checked` dla elementu z `role="switch"` w `packages/ui/src/components/switch.tsx`.
- [ ] **2.2. Dostępność `Toast`:**
  - Zastąpienie klikalnego `div` semantycznym przyciskiem `<button type="button" aria-label="Dismiss toast">` lub obsługa zdarzeń klawiatury (`onKeyDown` Enter/Space).
- [ ] **2.3. Dostępność `BottomSheet`:**
  - Poprawa dostępności tła overlay (backdrop) w `packages/ui/src/components/bottom-sheet.tsx`.
- [ ] **2.4. Typowanie i eliminacja `noExplicitAny` w pakiecie MCP:**
  - Wprowadzenie dedykowanych typów TypeScript w `packages/mcp/src/extractor.ts` oraz `packages/mcp/src/index.ts`.
- [ ] **2.5. Weryfikacja:**
  - Uruchomienie `npm run lint` oraz testów `packages/ui`.

---

## 🏃 Sprint 3: Component Props & API Explorer w Showcase (Dokumentacja)
**Cel:** Interaktywna dokumentacja API każdego komponentu bezpośrednio w serwisie showcase przy wykorzystaniu metadanych wygenerowanych przez MCP (`components.json`).

- [ ] **3.1. Utworzenie komponentu `PropsTable`:**
  - Nowy komponent `site/src/components/props-table.tsx` renderujący tabelę parametrów: nazwa propsa, typ TypeScript, czy wymagany, wartość domyślna oraz opis JSDoc.
- [ ] **3.2. Integracja metadanych w `ExampleTabs` / sekcjach:**
  - Dodanie nowej zakładki "API / Props" obok podglądu kodu w `ExampleTabs`.
  - Powiązanie komponentów sekcji z danymi z `packages/mcp/data/components.json`.
- [ ] **3.3. Testy jednostkowe i weryfikacja:**
  - Dodanie testów `props-table.test.tsx` oraz weryfikacja poprawnego renderowania tabeli propsów.

---

## 🔮 Przyszłe Sprinty (Droga do v1.0.0)
- **Sprint 4: Pokrycie testami jednostkowymi brakujących 34 komponentów prymitywnych** (`button`, `card`, `badge`, `input`, `avatar`, itd.).
- **Sprint 5: Komponenty Data Visualization** (lekkie wrappery wykresów wykorzystujące paletę `chart1`–`chart6`).
- **Sprint 6: Finalny Release v1.0.0** (aktualizacja `CHANGELOG.md`, wersjonowanie, checklist npm).
