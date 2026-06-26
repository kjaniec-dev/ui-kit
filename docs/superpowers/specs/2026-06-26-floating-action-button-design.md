# Specyfikacja Projektowa: Komponent Fab (Floating Action Button)

**Data:** 2026-06-26  
**Status:** W trakcie weryfikacji  
**Autor:** Antigravity  

---

## 1. Cel i Wymagania

Celem jest dodanie nowego komponentu `Fab` (Floating Action Button) do biblioteki `@kjaniec-dev/ui`. Komponent ten służy do udostępnienia kluczowej, pojedynczej akcji na ekranie, szczególnie na widokach mobilnych.

### Wymagania Funkcjonalne:
- **Pływające pozycjonowanie (`fixed`):** Domyślne umieszczenie w prawym dolnym rogu ekranu, z możliwością zmiany na inne pozycje (`bottom-left`, `bottom-center`) lub wyłączenia pozycjonowania `fixed` (`none`).
- **Widoczność mobilna (`mobileOnly`):** Opcjonalne ukrywanie przycisku na ekranach desktopowych (od rozmiaru `md` w górę w Tailwindzie).
- **Zgodność z systemem projektowym:** Wykorzystanie istniejących wariantów kolorystycznych z systemu tokenów (np. `primary`, `secondary`, `danger`) oraz pełna zgodność z komponentem `Button`.
- **Dostępność (a11y):** Wymóg dostarczenia czytelnej etykiety (`label` lub `aria-label`) dla czytników ekranu (szczególnie ważne, gdy na przycisku renderowana jest sama ikona).
- **Stany interaktywne:** Wsparcie dla stanów hover, active, focus oraz stanu ładowania (`loading`) i wyłączenia (`disabled`).

---

## 2. Architektura i API Komponentu

Komponent zostanie zaimplementowany jako `Fab` w katalogu `packages/ui/src/components/fab.tsx`. Będzie on owijał istniejący komponent `Button` lub korzystał z jego klas stylizujących, wzbogacając je o klasy pozycjonowania i specyficzny wygląd (okrągły kształt, głęboki cień).

### Interfejs Właściwości (`FabProps`):

```typescript
import * as React from "react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./button";

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ikona renderowana wewnątrz przycisku. */
  icon: React.ReactNode;
  
  /** Opis tekstowy dla dostępności (oraz opcjonalnie jako etykieta rozszerzona). */
  label: string;
  
  /** Pozycja na ekranie. */
  position?: "bottom-right" | "bottom-left" | "bottom-center" | "none";
  
  /** Jeśli true, przycisk będzie widoczny wyłącznie na urządzeniach mobilnych (ukrywany na desktopie). */
  mobileOnly?: boolean;
  
  /** Wariant kolorystyczny (primary, secondary, danger, outline). Domyślnie 'primary'. */
  variant?: "primary" | "secondary" | "danger" | "outline";
  
  /** Rozmiar przycisku. Domyślnie 'md'. */
  size?: "sm" | "md" | "lg";
  
  /** Wyświetla spinner ładowania i blokuje kliknięcia. */
  loading?: boolean;
}
```

---

## 3. Szczegóły Stylizacji (Tailwind CSS)

Komponent `Fab` będzie używał klas Tailwind do uzyskania odpowiedniego wyglądu:
1. **Kształt:** Zawsze okrągły (`rounded-full`).
2. **Cień:** Wyraźne uniesienie nad zawartością za pomocą cienia klasy `shadow-lg` (lub `shadow-xl`).
3. **Rozmiary:**
   - `sm`: Przycisk o wymiarach `w-10 h-10` z małą ikoną.
   - `md` (domyślny): Przycisk o wymiarach `w-14 h-14` z ikoną standardowej wielkości.
   - `lg`: Przycisk o wymiarach `w-16 h-16` z dużą ikoną.
4. **Pozycjonowanie fixed:**
   - `bottom-right`: `fixed bottom-6 right-6 z-50`
   - `bottom-left`: `fixed bottom-6 left-6 z-50`
   - `bottom-center`: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`
   - `none`: Bez pozycjonowania fixed (elastyczne umieszczenie).
5. **Ukrywanie na desktopie:**
   - Gdy `mobileOnly={true}`: dodanie klasy `md:hidden` do kontenera/przycisku.

---

## 4. Wdrożenie i Testowanie

### Kroki Wdrożenia:
1. Utworzenie pliku [packages/ui/src/components/fab.tsx](file:///Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui/src/components/fab.tsx).
2. Dodanie eksportu w głównym pliku [packages/ui/src/index.ts](file:///Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui/src/index.ts).
3. Dodanie plików Storybook w [packages/ui/src/components/fab.stories.tsx](file:///Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui/src/components/fab.stories.tsx) w celu manualnej weryfikacji.
4. Napisanie testów jednostkowych/integracyjnych lub zweryfikowanie poprawnej budowy pakietu poleceniem `npm run build` w pakiecie `ui`.
5. Prezentacja komponentu w galerii demonstracyjnej (np. `demo-gallery.jsx` lub `site`).

### Przykładowy Test Dostępności:
- Sprawdzenie, czy przycisk ma odpowiedni atrybut `aria-label` ustawiony na wartość właściwości `label`.
- Upewnienie się, że ikona ma `aria-hidden="true"`, aby uniknąć powtarzania komunikatów w czytnikach ekranu.
