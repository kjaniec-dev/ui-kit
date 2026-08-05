# InPost GeoWidget Component Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, TypeScript-first React 18/19 wrapper component suite for InPost GeoWidget v5 in `@kjaniec-dev/ui` featuring an async script loader hook, inline web component wrapper, modal checkout picker, unit tests, and Storybook stories.

**Architecture:** The module is isolated in `packages/ui/src/components/inpost-geowidget/`. `useInPostScript` manages singleton JS/CSS injection in the browser. `<InPostGeowidget />` mounts the custom element `<inpost-geowidget>` and translates `inpostgeowidget` custom DOM events to React props. `<InPostGeowidgetModal />` integrates with existing `@kjaniec-dev/ui` Modal, Drawer, and Button components to offer a turnkey checkout point selector.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, Storybook, `@kjaniec-dev/design`.

---

### File Structure Map

```
packages/ui/src/components/inpost-geowidget/
├── types.ts                     # TypeScript interfaces (InPostPoint, InPostGeowidgetProps, InPostGeowidgetModalProps)
├── use-inpost-script.ts         # Singleton script & CSS loader hook (SSR safe)
├── use-inpost-script.test.ts    # Vitest tests for script injection & caching
├── inpost-geowidget.tsx         # Inline React wrapper for <inpost-geowidget> custom element
├── inpost-geowidget.test.tsx    # Vitest tests for inline web component wrapper
├── inpost-geowidget-modal.tsx   # Modal & Drawer checkout picker using @kjaniec-dev/ui elements
├── inpost-geowidget-modal.test.tsx # Vitest tests for modal picker & trigger interactions
├── inpost-geowidget.stories.tsx # Storybook stories (Inline & Modal variants)
└── index.ts                     # Module barrel export
```

---

### Task 1: TypeScript Definitions (`types.ts`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/types.ts`

- [ ] **Step 1: Write `types.ts` interface definitions**

```typescript
import type React from 'react';

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

export interface UseInPostScriptOptions {
  sandbox?: boolean;
  customScriptUrl?: string;
  customCssUrl?: string;
}

export interface UseInPostScriptResult {
  isLoaded: boolean;
  error: Error | null;
}
```

- [ ] **Step 2: Typecheck verification**

Run: `npx tsc --noEmit` inside `packages/ui`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/types.ts
git commit -m "feat(ui): add TypeScript definitions for InPost GeoWidget"
```

---

### Task 2: Script Loader Hook (`use-inpost-script.ts`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/use-inpost-script.ts`
- Create: `packages/ui/src/components/inpost-geowidget/use-inpost-script.test.ts`

- [ ] **Step 1: Write the failing unit test for `useInPostScript`**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useInPostScript } from './use-inpost-script';

describe('useInPostScript', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    // reset global cache if any
  });

  it('injects script and link tags into document head', async () => {
    const { result } = renderHook(() => useInPostScript({ sandbox: false }));

    expect(result.current.isLoaded).toBe(false);

    const scriptTag = document.querySelector('script[src*="sdk-for-javascript.js"]');
    const linkTag = document.querySelector('link[href*="easypack.css"]');

    expect(scriptTag).not.toBeNull();
    expect(linkTag).not.toBeNull();

    // Simulate script load event
    scriptTag?.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/inpost-geowidget/use-inpost-script.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `useInPostScript`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { UseInPostScriptOptions, UseInPostScriptResult } from './types';

const PROD_SCRIPT_URL = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';
const PROD_CSS_URL = 'https://geowidget.easypack24.net/css/easypack.css';
const SANDBOX_SCRIPT_URL = 'https://sandbox-geowidget.easypack24.net/js/sdk-for-javascript.js';
const SANDBOX_CSS_URL = 'https://sandbox-geowidget.easypack24.net/css/easypack.css';

let scriptPromise: Promise<void> | null = null;

export function useInPostScript(options: UseInPostScriptOptions = {}): UseInPostScriptResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scriptUrl =
    options.customScriptUrl ||
    (options.sandbox ? SANDBOX_SCRIPT_URL : PROD_SCRIPT_URL);
  const cssUrl =
    options.customCssUrl ||
    (options.sandbox ? SANDBOX_CSS_URL : PROD_CSS_URL);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already present/loaded
    if (window.customElements?.get('inpost-geowidget') || (window as unknown as { easyPack?: unknown }).easyPack) {
      setIsLoaded(true);
      return;
    }

    // Ensure CSS stylesheet is injected
    let linkTag = document.querySelector(`link[href="${cssUrl}"]`) as HTMLLinkElement | null;
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.rel = 'stylesheet';
      linkTag.href = cssUrl;
      linkTag.type = 'text/css';
      document.head.appendChild(linkTag);
    }

    if (!scriptPromise) {
      scriptPromise = new Promise((resolve, reject) => {
        let scriptTag = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement | null;
        if (!scriptTag) {
          scriptTag = document.createElement('script');
          scriptTag.src = scriptUrl;
          scriptTag.async = true;
          document.head.appendChild(scriptTag);
        }

        scriptTag.addEventListener('load', () => resolve());
        scriptTag.addEventListener('error', (err) =>
          reject(err instanceof Error ? err : new Error('Failed to load InPost GeoWidget SDK script'))
        );
      });
    }

    scriptPromise
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [scriptUrl, cssUrl]);

  return { isLoaded, error };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test packages/ui/src/components/inpost-geowidget/use-inpost-script.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/use-inpost-script.ts packages/ui/src/components/inpost-geowidget/use-inpost-script.test.ts
git commit -m "feat(ui): implement useInPostScript loader hook"
```

---

### Task 3: Inline Map Component (`inpost-geowidget.tsx`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/inpost-geowidget.tsx`
- Create: `packages/ui/src/components/inpost-geowidget/inpost-geowidget.test.tsx`

- [ ] **Step 1: Write failing unit test for `InPostGeowidget`**

```typescript
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InPostGeowidget } from './inpost-geowidget';

// Mock script hook to resolve instantly loaded
vi.mock('./use-inpost-script', () => ({
  useInPostScript: () => ({ isLoaded: true, error: null }),
}));

describe('InPostGeowidget', () => {
  it('renders inpost-geowidget custom element and handles point select event', () => {
    const onPointSelect = vi.fn();
    const { container } = render(
      <InPostGeowidget token="test-token" onPointSelect={onPointSelect} />
    );

    const widgetEl = container.querySelector('inpost-geowidget');
    expect(widgetEl).not.toBeNull();
    expect(widgetEl?.getAttribute('token')).toBe('test-token');

    // Dispatch custom event inpostgeowidget
    const mockPoint = { name: 'WAW01M', address: { line1: 'Test', line2: 'City' } };
    const customEvent = new CustomEvent('inpostgeowidget', {
      detail: mockPoint,
      bubbles: true,
    });

    fireEvent(widgetEl!, customEvent);

    expect(onPointSelect).toHaveBeenCalledWith(mockPoint);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/inpost-geowidget/inpost-geowidget.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `InPostGeowidget`**

```typescript
'use client';

import React, { useEffect, useRef } from 'react';
import type { InPostGeowidgetProps, InPostPoint } from './types';

import { useInPostScript } from './use-inpost-script';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'inpost-geowidget': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          token?: string;
          language?: string;
          config?: string;
          sandbox?: string | boolean;
        },
        HTMLElement
      >;
    }
  }
}

export const InPostGeowidget: React.FC<InPostGeowidgetProps> = ({
  token = '',
  language = 'pl',
  config = 'parcelCollect',
  sandbox = false,
  onPointSelect,
  onReady,
  onError,
  className,
  style,
  customScriptUrl,
  customCssUrl,
}) => {
  const { isLoaded, error } = useInPostScript({
    sandbox,
    customScriptUrl,
    customCssUrl,
  });

  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (isLoaded && onReady) {
      onReady();
    }
  }, [isLoaded, onReady]);

  useEffect(() => {
    const el = widgetRef.current;
    if (!el || !onPointSelect) return;

    const handlePointSelect = (event: Event) => {
      const customEv = event as CustomEvent<InPostPoint>;
      const point = customEv.detail || (customEv as unknown as { point: InPostPoint }).point;
      if (point) {
        onPointSelect(point);
      }
    };

    el.addEventListener('inpostgeowidget', handlePointSelect);
    return () => {
      el.removeEventListener('inpostgeowidget', handlePointSelect);
    };
  }, [onPointSelect, isLoaded]);

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 ${
          className || ''
        }`}
        style={style}
      >
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Ładowanie mapy InPost GeoWidget...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-[500px] relative ${className || ''}`} style={style}>
      {React.createElement('inpost-geowidget', {
        ref: widgetRef,
        token,
        language,
        config,
        sandbox: sandbox ? 'true' : 'false',
        style: { width: '100%', height: '100%', display: 'block', minHeight: '500px' },
      })}
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test packages/ui/src/components/inpost-geowidget/inpost-geowidget.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/inpost-geowidget.tsx packages/ui/src/components/inpost-geowidget/inpost-geowidget.test.tsx
git commit -m "feat(ui): implement InPostGeowidget inline component"
```

---

### Task 4: Modal Picker Component (`inpost-geowidget-modal.tsx`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.tsx`
- Create: `packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.test.tsx`

- [ ] **Step 1: Write failing unit test for `InPostGeowidgetModal`**

```typescript
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InPostGeowidgetModal } from './inpost-geowidget-modal';

vi.mock('./use-inpost-script', () => ({
  useInPostScript: () => ({ isLoaded: true, error: null }),
}));

describe('InPostGeowidgetModal', () => {
  it('opens modal on trigger button click and displays selected point', () => {
    const onSelect = vi.fn();
    render(<InPostGeowidgetModal onSelect={onSelect} triggerText="Wybierz Paczkomat" />);

    const triggerBtn = screen.getByRole('button', { name: /Wybierz Paczkomat/i });
    expect(triggerBtn).toBeDefined();

    fireEvent.click(triggerBtn);

    expect(screen.getByText('Wybierz punkt odbioru InPost')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `InPostGeowidgetModal`**

```typescript
'use client';

import React, { useState } from 'react';
import { Button } from '../button';
import { Modal } from '../modal';
import { InPostGeowidget } from './inpost-geowidget';
import type { InPostGeowidgetModalProps, InPostPoint } from './types';

export const InPostGeowidgetModal: React.FC<InPostGeowidgetModalProps> = ({
  value,
  onSelect,
  triggerText = 'Wybierz Paczkomat®',
  modalTitle = 'Wybierz punkt odbioru InPost',
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  showSelectedBadge = true,
  className = '',
  buttonVariant = 'outline',
  buttonSize = 'default',
  token,
  language,
  config,
  sandbox,
  customScriptUrl,
  customCssUrl,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<InPostPoint | null>(
    typeof value === 'object' && value ? value : null
  );

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenToggle = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handlePointSelect = (point: InPostPoint) => {
    setSelectedPoint(point);
    if (onSelect) {
      onSelect(point);
    }
    handleOpenToggle(false);
  };

  const selectedCode = selectedPoint?.name || (typeof value === 'string' ? value : null);
  const selectedAddress = selectedPoint
    ? `${selectedPoint.address?.line1 || ''}, ${selectedPoint.address?.line2 || ''}`
    : null;

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        disabled={disabled}
        onClick={() => handleOpenToggle(true)}
        className="justify-between gap-3 text-left font-normal"
      >
        <span className="flex items-center gap-2">
          <span className="font-semibold text-amber-500">InPost</span>
          <span>{selectedCode ? `Paczkomat: ${selectedCode}` : triggerText}</span>
        </span>
        <span className="text-xs opacity-75">Zmień</span>
      </Button>

      {showSelectedBadge && selectedCode && (
        <div className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2.5 rounded-md flex flex-col gap-0.5">
          <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <span>Paczkomat® {selectedCode}</span>
          </div>
          {selectedAddress && <div>{selectedAddress}</div>}
        </div>
      )}

      <Modal open={isOpen} onClose={() => handleOpenToggle(false)} title={modalTitle}>
        <div className="w-full h-[600px] min-h-[500px]">
          <InPostGeowidget
            token={token}
            language={language}
            config={config}
            sandbox={sandbox}
            customScriptUrl={customScriptUrl}
            customCssUrl={customCssUrl}
            onPointSelect={handlePointSelect}
          />
        </div>
      </Modal>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.tsx packages/ui/src/components/inpost-geowidget/inpost-geowidget-modal.test.tsx
git commit -m "feat(ui): implement InPostGeowidgetModal picker component"
```

---

### Task 5: Module Export & Root Integration (`index.ts`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: Create `components/inpost-geowidget/index.ts`**

```typescript
export * from './types';
export * from './use-inpost-script';
export * from './inpost-geowidget';
export * from './inpost-geowidget-modal';
```

- [ ] **Step 2: Re-export from root `packages/ui/src/index.ts`**

Add line to `packages/ui/src/index.ts`:
```typescript
export * from './components/inpost-geowidget';
```

- [ ] **Step 3: Run full typecheck and tests**

Run: `npm run typecheck && npm test` in `packages/ui`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): export inpost-geowidget module from @kjaniec-dev/ui"
```

---

### Task 6: Storybook Stories (`inpost-geowidget.stories.tsx`)

**Files:**
- Create: `packages/ui/src/components/inpost-geowidget/inpost-geowidget.stories.tsx`

- [ ] **Step 1: Write Storybook story**

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { InPostGeowidget } from './inpost-geowidget';
import { InPostGeowidgetModal } from './inpost-geowidget-modal';
import type { InPostPoint } from './types';

const meta: Meta = {
  title: 'Components/InPostGeowidget',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const InlineMap: StoryObj = {
  render: () => {
    const [selectedPoint, setSelectedPoint] = useState<InPostPoint | null>(null);

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-xl font-bold">Wybór Paczkomatu (Mapa Inline)</h2>
        {selectedPoint && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            Wybrano: <strong>{selectedPoint.name}</strong> - {selectedPoint.address?.line1}
          </div>
        )}
        <div className="border rounded-lg overflow-hidden h-[550px]">
          <InPostGeowidget
            sandbox={true}
            onPointSelect={(point) => setSelectedPoint(point)}
          />
        </div>
      </div>
    );
  },
};

export const ModalPicker: StoryObj = {
  render: () => {
    const [point, setPoint] = useState<InPostPoint | null>(null);

    return (
      <div className="p-6 max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Koszyk / Checkout</h2>
        <p className="text-sm text-slate-600">
          Wybierz metodę dostawy i punkt odbioru Paczkomat®.
        </p>
        <InPostGeowidgetModal
          sandbox={true}
          value={point}
          onSelect={(p) => setPoint(p)}
        />
      </div>
    );
  },
};
```

- [ ] **Step 2: Verify Storybook build**

Run: `npm run build` in `packages/ui`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/components/inpost-geowidget/inpost-geowidget.stories.tsx
git commit -m "feat(ui): add Storybook stories for InPost GeoWidget"
```

---

### Task 7: Full Package Build & Verification

- [ ] **Step 1: Execute clean build**

Run: `npm run clean && npm run build` inside `packages/ui`
Expected: Successful TSUP build creating `./dist/index.js`, `./dist/index.cjs`, and `./dist/index.d.ts`.

- [ ] **Step 2: Execute full test suite**

Run: `npm run test` inside `packages/ui`
Expected: All tests pass cleanly.

- [ ] **Step 3: Commit build verification**

```bash
git commit --allow-empty -m "chore(ui): verify build and package distribution for inpost-geowidget"
```
