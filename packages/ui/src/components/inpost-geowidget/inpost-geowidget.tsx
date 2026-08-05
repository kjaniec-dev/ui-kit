'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { InPostConfigType, InPostLanguage, InPostPoint } from './types';
import { useInPostScript } from './use-inpost-script';

/** Props for the inline InPost GeoWidget map component. */
export interface InPostGeowidgetProps {
  /** InPost API Token generated in InPost Manager for your domain. Required for production map. */
  token?: string;
  /** Widget language ('pl', 'en', 'uk', 'de', 'it', 'fr'). Default 'pl'. */
  language?: InPostLanguage;
  /** Widget configuration type ('parcelCollect', 'parcelCollectPayment', 'international', 'postBuy'). Default 'parcelCollect'. */
  config?: InPostConfigType;
  /** Enable sandbox environment. Default false. */
  sandbox?: boolean;
  /** Callback triggered when user selects a parcel locker or pick-up point on the map. */
  onPointSelect?: (point: InPostPoint) => void;
  /** Callback triggered when GeoWidget finishes loading. */
  onReady?: () => void;
  /** Callback triggered on script load error. */
  onError?: (error: Error) => void;
  /** Outer container CSS class name. */
  className?: string;
  /** Inline container styles. */
  style?: React.CSSProperties;
  /** Custom SDK JavaScript URL. */
  customScriptUrl?: string;
  /** Custom SDK CSS URL. */
  customCssUrl?: string;
}

const MOCK_POINTS: InPostPoint[] = [
  {
    name: 'WAW01M',
    address: { line1: 'ul. Towarowa 5', line2: '00-838 Warszawa' },
    address_details: { city: 'Warszawa', street: 'Towarowa', building_number: '5', post_code: '00-838' },
    location: { latitude: 52.2297, longitude: 21.0122 },
    type: ['parcel_locker'],
    status: 'Operating',
    location_description: 'Przy stacji benzynowej BP',
  },
  {
    name: 'KRA02N',
    address: { line1: 'ul. Floriańska 12', line2: '31-021 Kraków' },
    address_details: { city: 'Kraków', street: 'Floriańska', building_number: '12', post_code: '31-021' },
    location: { latitude: 50.0647, longitude: 19.9450 },
    type: ['parcel_locker'],
    status: 'Operating',
    location_description: 'Obok wejścia do sklepu',
  },
  {
    name: 'GDA03P',
    address: { line1: 'ul. Długa 8', line2: '80-827 Gdańsk' },
    address_details: { city: 'Gdańsk', street: 'Długa', building_number: '8', post_code: '80-827' },
    location: { latitude: 54.3520, longitude: 18.6466 },
    type: ['parcel_locker'],
    status: 'Operating',
    location_description: 'Róg ulicy Długiej i Tkackiej',
  },
  {
    name: 'POZ04S',
    address: { line1: 'ul. Półwiejska 42', line2: '61-888 Poznań' },
    address_details: { city: 'Poznań', street: 'Półwiejska', building_number: '42', post_code: '61-888' },
    location: { latitude: 52.4064, longitude: 16.9252 },
    type: ['parcel_locker'],
    status: 'Operating',
    location_description: 'Przy centrum handlowym Stary Browar',
  },
];

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
          onpointselect?: string;
        },
        HTMLElement
      >;
    }
  }
}

export const InPostGeowidget: React.FC<InPostGeowidgetProps> = ({
  token,
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMock, setSelectedMock] = useState<InPostPoint | null>(null);

  const widgetRef = useRef<HTMLElement | null>(null);
  const callbackNameRef = useRef<string>(`inpost_cb_${Math.random().toString(36).substring(2, 9)}`);

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
    if (!token) return;

    const cbName = callbackNameRef.current;

    (window as unknown as Record<string, (point: InPostPoint) => void>)[cbName] = (point: InPostPoint) => {
      if (onPointSelect) {
        onPointSelect(point);
      }
    };

    const el = widgetRef.current;
    const handlePointSelect = (event: Event) => {
      const customEv = event as CustomEvent<InPostPoint>;
      const point = customEv.detail || (customEv as unknown as { point: InPostPoint }).point;
      if (point && onPointSelect) {
        onPointSelect(point);
      }
    };

    if (el) {
      el.addEventListener('inpostgeowidget', handlePointSelect);
      el.addEventListener('onpointselect', handlePointSelect);
    }
    document.addEventListener('onpointselect', handlePointSelect);

    return () => {
      delete (window as unknown as Record<string, unknown>)[cbName];
      if (el) {
        el.removeEventListener('inpostgeowidget', handlePointSelect);
        el.removeEventListener('onpointselect', handlePointSelect);
      }
      document.removeEventListener('onpointselect', handlePointSelect);
    };
  }, [onPointSelect, isLoaded, token]);

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[450px] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center ${
          className || ''
        }`}
        style={style}
      >
        <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
          Błąd ładowania Geowidget InPost
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 max-w-sm">
          Nie udało się pobrać skryptu mapy z serwera InPost. Sprawdź połączenie z siecią.
        </p>
      </div>
    );
  }

  // Fallback demo picker when token is not supplied
  if (!token) {
    const filteredPoints = MOCK_POINTS.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.line1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address_details.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div
        className={`flex flex-col h-full min-h-[450px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 font-sans text-slate-900 dark:text-slate-100 ${
          className || ''
        }`}
        style={style}
      >
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-md p-3 mb-3 text-xs text-amber-900 dark:text-amber-300 flex flex-col gap-1">
          <div className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Tryb demonstracyjny / Wybierz punkt InPost Paczkomat®</span>
          </div>
          <p className="opacity-90 leading-relaxed">
            Do połączenia z żywą, produkcyjną mapą InPost podaj własny prop <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded font-mono">token="TWOJ_TOKEN"</code> zarejestrowany w InPost Manager dla Twojej domeny.
          </p>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Szukaj Paczkomatu (np. Warszawa, WAW01M, Towarowa)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
          {filteredPoints.map((p) => {
            const isSelected = selectedMock?.name === p.name;
            return (
              <div
                key={p.name}
                onClick={() => {
                  setSelectedMock(p);
                  if (onPointSelect) {
                    onPointSelect(p);
                  }
                }}
                className={`p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>Paczkomat® {p.name}</span>
                    {p.location_description && (
                      <span className={`text-[0.7rem] px-1.5 py-0.5 rounded font-normal ${isSelected ? 'bg-amber-600 text-amber-50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {p.location_description}
                      </span>
                    )}
                  </div>
                  <div className={`text-xs ${isSelected ? 'text-amber-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {p.address.line1}, {p.address.line2}
                  </div>
                </div>

                <button
                  type="button"
                  className={`px-3 py-1.5 rounded text-xs font-semibold shrink-0 ${
                    isSelected
                      ? 'bg-white text-amber-900 shadow-sm'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {isSelected ? 'Wybrano ✓' : 'Wybierz'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center min-h-[450px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 ${
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

  const widgetProps: Record<string, string> = {
    language,
    config: String(config).toLowerCase(),
    onpointselect: callbackNameRef.current,
  };

  if (token) {
    widgetProps.token = token;
  }

  if (sandbox) {
    widgetProps.sandbox = 'true';
  }

  return (
    <div className={`w-full h-full min-h-[450px] relative ${className || ''}`} style={style}>
      {React.createElement('inpost-geowidget', {
        ref: widgetRef,
        ...widgetProps,
        style: { width: '100%', height: '100%', display: 'block', minHeight: '450px' },
      })}
    </div>
  );
};
