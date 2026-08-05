# Design Spec: InPost GeoWidget React Wrapper Component for `@kjaniec-dev/ui`

**Date:** 2026-08-05  
**Package:** `@kjaniec-dev/ui`  
**Status:** Approved  

---

## 1. Overview

InPost GeoWidget (SDK v5) allows e-commerce and web applications to embed an interactive map for selecting InPost parcel lockers (`Paczkomaty`) and drop-off/pick-up points. Existing wrapper npm packages (`react-inpost-geowidget`, `inpost-geowidget-react`) are outdated, unmaintained, and lack support for React 18/19, TypeScript, and modern UI component systems.

This design introduces a first-class React wrapper component suite for InPost GeoWidget v5 into `@kjaniec-dev/ui`.

---

## 2. Key Features

- **Modern React 18/19 & Next.js App Router Support**: Full client-side SSR safety with `"use client"` directives.
- **Asynchronous Script & Style Loader (`useInPostScript`)**: Automatic injection of `sdk-for-javascript.js` and `easypack.css` with singleton state management and error/loading feedback.
- **Inline Map Component (`InPostGeowidget`)**: Clean wrapper around the `<inpost-geowidget>` Web Component, bridging React events with native custom events (`inpostgeowidget`).
- **Modal / Drawer Picker Component (`InPostGeowidgetModal`)**: E-commerce ready modal checkout component built with `@kjaniec-dev/ui` design system components (`Button`, `Modal`, `Drawer`, `Spinner`).
- **Comprehensive TypeScript Definitions**: Full type coverage for InPost point objects, configuration parameters, and component props.

---

## 3. Directory & File Structure

All source files are organized under `packages/ui/src/components/inpost-geowidget/`:

```
packages/ui/src/components/inpost-geowidget/
├── types.ts                     # TypeScript definitions for InPost point, config, props
├── use-inpost-script.ts         # Script & CSS loader hook with singleton caching
├── inpost-geowidget.tsx         # Inline map React component wrapper
├── inpost-geowidget-modal.tsx   # Modal picker component integrated with @kjaniec-dev/ui
├── index.ts                     # Module barrel export
├── inpost-geowidget.test.tsx    # Vitest unit & integration tests
└── inpost-geowidget.stories.tsx # Storybook documentation & interactive playground
```

Exports are also re-exported from `packages/ui/src/index.ts`.

---

## 4. Technical Architecture

### 4.1 Script & CSS Loading (`useInPostScript`)

- **Default Production JS**: `https://geowidget.easypack24.net/js/sdk-for-javascript.js`
- **Default Production CSS**: `https://geowidget.easypack24.net/css/easypack.css`
- **Sandbox URLs**: Automatically used when `sandbox: true` or overridden via custom props.
- **Singleton promise / global registry**: Prevents duplicate script elements from being appended to `<head>` across multiple component mounts or re-renders.

### 4.2 Web Component Integration (`InPostGeowidget`)

InPost GeoWidget v5 relies on the custom Web Component element `<inpost-geowidget>`.
The React component `<InPostGeowidget />`:
1. Renders a container element with the `<inpost-geowidget>` custom tag.
2. Applies initial configuration attributes: `token`, `language`, `config`, `sandbox`.
3. Attaches an event listener to the custom event `inpostgeowidget` on the custom element.
4. Triggers the `onPointSelect(point)` callback when a user clicks a point on the map.
5. Cleans up event listeners upon component unmount.

### 4.3 Modal Picker (`InPostGeowidgetModal`)

The modal picker provides a turnkey checkout button and modal container:
- Renders a trigger `<Button>` styled with `@kjaniec-dev/design` tokens.
- Displays current selection status (e.g. `Paczkomat WAW01M - ul. Towarowa 5` or `Wybierz Paczkomat®`).
- Opens a responsive `@kjaniec-dev/ui` modal with `<InPostGeowidget>` inside.
- Auto-closes the modal upon point selection and notifies parent component via `onSelect(point)`.

---

## 5. TypeScript API Interfaces

```typescript
export interface InPostAddressDetails {
  city: string;
  street: string;
  building_number: string;
  post_code: string;
  province?: string;
}

export interface InPostLocation {
  latitude: number;
  longitude: number;
}

export interface InPostPoint {
  name: string;
  address: {
    line1: string;
    line2: string;
  };
  address_details: InPostAddressDetails;
  location: InPostLocation;
  type: string[] | string;
  status: string;
  location_description?: string;
  opening_hours?: string;
  payment_point_descr?: string;
  functions?: string[];
  [key: string]: unknown;
}

export type InPostLanguage = 'pl' | 'en' | 'uk' | 'de' | 'it' | 'fr';

export type InPostConfigType = 
  | 'parcelCollect' 
  | 'parcelCollectPayment' 
  | 'international' 
  | 'postBuy' 
  | string;

export interface InPostGeowidgetProps {
  token?: string;
  language?: InPostLanguage;
  config?: InPostConfigType;
  sandbox?: boolean;
  onPointSelect?: (point: InPostPoint) => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  customScriptUrl?: string;
  customCssUrl?: string;
}

export interface InPostGeowidgetModalProps extends Omit<InPostGeowidgetProps, 'className' | 'style'> {
  value?: InPostPoint | string | null;
  onSelect?: (point: InPostPoint) => void;
  triggerText?: string;
  modalTitle?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showSelectedBadge?: boolean;
  className?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'sm' | 'default' | 'lg';
}
```

---

## 6. Verification Strategy

1. **Unit & Integration Tests**: Run `npm test` inside `packages/ui` using Vitest + React Testing Library.
   - Verify `useInPostScript` injects `<script>` and `<link>` elements cleanly.
   - Verify `<InPostGeowidget />` renders `<inpost-geowidget>` and dispatches `onPointSelect`.
   - Verify `<InPostGeowidgetModal />` toggles modal state and updates selection badge.
2. **Typecheck**: Run `npm run typecheck` inside `packages/ui` to verify TypeScript definitions.
3. **Build Verification**: Run `npm run build` inside `packages/ui` to ensure TSUP bundles ES modules, CJS, and `.d.ts` declaration files without errors.
4. **Storybook**: Add `inpost-geowidget.stories.tsx` for visual and interactive manual testing.
