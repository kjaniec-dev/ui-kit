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

    return () => {
      delete (window as unknown as Record<string, unknown>)[cbName];
      if (el) {
        el.removeEventListener('inpostgeowidget', handlePointSelect);
        el.removeEventListener('onpointselect', handlePointSelect);
      }
    };
  }, [onPointSelect, isLoaded]);

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
    config,
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
