# Specyfikacja Projektowa: Komponent BottomSheet (Dolny Arkusz)

**Data:** 2026-06-26  
**Status:** Do weryfikacji  
**Autor:** Antigravity  

---

## 1. Cel i Wymagania

Celem jest dodanie nowego komponentu `BottomSheet` do biblioteki `@kjaniec-dev/ui`. Komponent ten służy do wyświetlania kontekstowej zawartości (formularzy, list opcji, szczegółowych informacji) w sposób dopasowany do urządzenia:
- **Na urządzeniach mobilnych:** wysuwa się od dołu ekranu jako arkusz (dolny panel) z zaokrąglonymi górnymi krawędziami.
- **Na urządzeniach desktopowych:** automatycznie transformuje się w tradycyjny, wycentrowany dialog (modal) na środku ekranu.

### Wymagania Funkcjonalne:
- **Podejście responsywne oparte na CSS:** Całkowite przełączanie wyglądu odbywa się za pomocą klas responsywnych Tailwind CSS (prefiks `md:`). Zapobiega to błędom hydratacji po stronie serwera (SSR) w Next.js.
- **Zgodność z systemem projektowym:** Pełne oparcie na tokenach design system (kolory tła `bg-surface`, zaokrąglenia `rounded-t-kj-2xl` i `rounded-kj-2xl`, cienie `shadow-kj-lg`).
- **Dostępność (a11y):**
  - Obsługa atrybutów `role="dialog"`, `aria-modal="true"`.
  - Dynamiczne powiązanie nagłówka z opisem przez atrybuty `aria-labelledby` oraz `aria-describedby`.
  - Przechwytywanie klawisza tabulacji (Focus Trap) wewnątrz otwartego arkusza.
  - Zamykanie po naciśnięciu klawisza `Escape`.
  - Przywracanie fokusu na ostatnio aktywny element po zamknięciu.
  - Blokowanie przewijania tła (`overflow: hidden` na `body`).

---

## 2. API Komponentu (React / JSX)

Komponent zostanie zaimplementowany w oparciu o wzorzec komponentów złożonych (Compound Components) pod adresem [packages/ui/src/components/bottom-sheet.tsx](file:///Users/kjaniec-dev/dev/projects/kj-product-kit-starter/packages/ui/src/components/bottom-sheet.tsx).

### Interfejsy i Eksporty:

```typescript
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Maksymalna szerokość na desktopie. Domyślnie 'max-w-md' (440px). */
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl";
}
```

### Proponowana struktura JSX:

```tsx
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetContent,
  BottomSheetFooter
} from "@kjaniec-dev/ui";

function Example() {
  return (
    <BottomSheet open={open} onClose={handleClose}>
      <BottomSheetHeader>
        <BottomSheetTitle>Tytuł arkusza</BottomSheetTitle>
        <BottomSheetDescription>Opcjonalny pomocniczy opis.</BottomSheetDescription>
      </BottomSheetHeader>
      <BottomSheetContent>
        <p>Główna zawartość...</p>
      </BottomSheetContent>
      <BottomSheetFooter>
        <button onClick={handleClose}>Zamknij</button>
      </BottomSheetFooter>
    </BottomSheet>
  );
}
```

---

## 3. Szczegóły Implementacji Stylów (Tailwind CSS)

Komponent będzie składał się z dwóch części: tła przyciemniającego (Backdrop) oraz właściwego kontenera arkusza (Panel).

### 3.1 Backdrop (Tło):
Uruchamiane w trybie `fixed inset-0 z-[100]`. Wykorzystuje mieszanie kolorów do uzyskania półprzezroczystego tła oraz lekki blur:
- Klasy: `fixed inset-0 z-[100] transition-opacity duration-300 backdrop-blur-[2px] bg-[color-mix(in_oklch,#09090b_45%,transparent)]`
- Desktop responsywny: na desktopie tło zachowuje ten sam styl (lub staje się nieco ciemniejsze).

### 3.2 Panel (Arkusz / Modal):
Struktura pozycjonowana relatywnie do widoku:
- **Mobilnie (Domyślnie):** Panel jest przyklejony do dołu ekranu.
  - Klasy: `fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex flex-col max-h-[90vh] shadow-kj-lg outline-none transition-transform duration-300 ease-in-out`
  - Stan zamknięty vs otwarty: `open ? "translate-y-0" : "translate-y-full"`
- **Desktop (`md:` i wyżej):** Panel wyśrodkowuje się na ekranie i zmienia w Modal.
  - Klasy: `md:relative md:top-auto md:bottom-auto md:left-auto md:right-auto md:margin-auto md:my-8 md:w-full md:rounded-kj-2xl md:border md:shadow-kj-lg md:scale-100`
  - Stan zamknięty vs otwarty: `open ? "md:scale-100 md:translate-y-0" : "md:scale-95 md:translate-y-2"`
  - Backdrop na desktopie staje się kontenerem typu grid do łatwego centrowania: `md:grid md:place-items-center md:p-6`.

### 3.3 Elementy wewnętrzne:
- **Uchwyt (Drag Handle) na mobilkach:** Na samej górze panelu (wyłącznie na urządzeniach mobilnych, ukryty na desktopie).
  - Klasy: `w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto my-3 md:hidden`
- **Przycisk Zamknięcia (X):** Klasyczny przycisk w rogu.
  - Klasy: `absolute top-4 right-4 p-1.5 rounded-kj-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer`

---

## 4. Plan Weryfikacji i Testów

1. **Testy jednostkowe (Vitest):**
   - Weryfikacja renderowania komponentu przy `open={true}`.
   - Weryfikacja wywoływania zdarzenia `onClose` po naciśnięciu Escape.
   - Weryfikacja poprawnego przypisania `aria-labelledby` oraz `aria-describedby` na podstawie wygenerowanych ID z `React.useId()`.
   - Sprawdzenie Focus Trapa (klawisz Tab cykluje wyłącznie po elementach wewnątrz arkusza).
2. **Storybook:**
   - Dodanie pliku `packages/ui/src/components/bottom-sheet.stories.tsx`.
   - Konfiguracja viewportu Storybooka, aby sprawdzić zachowanie mobilne i desktopowe w Storybook.
3. **Showcase na stronie głównej (site):**
   - Integracja w [site/src/main.tsx](file:///Users/kjaniec-dev/dev/projects/kj-product-kit-starter/site/src/main.tsx) w celu prezentacji komponentu na żywo w sekcji Overlayów / Modalów.
