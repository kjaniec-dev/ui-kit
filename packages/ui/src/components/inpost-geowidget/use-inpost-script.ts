'use client';

import { useEffect, useState } from 'react';
import type { UseInPostScriptOptions, UseInPostScriptResult } from './types';

const OFFICIAL_SCRIPT_URL = 'https://geowidget.easypack24.net/js/sdk-for-javascript.js';
const OFFICIAL_CSS_URL = 'https://geowidget.easypack24.net/css/easypack.css';

let scriptPromise: Promise<void> | null = null;

export function useInPostScript(options: UseInPostScriptOptions = {}): UseInPostScriptResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const scriptUrl = options.customScriptUrl || OFFICIAL_SCRIPT_URL;
  const cssUrl = options.customCssUrl || OFFICIAL_CSS_URL;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script/customElement is already defined
    if (
      window.customElements?.get('inpost-geowidget') ||
      (window as unknown as { easyPack?: unknown }).easyPack
    ) {
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
      .then(async () => {
        if (typeof window !== 'undefined' && window.customElements?.whenDefined) {
          try {
            await Promise.race([
              window.customElements.whenDefined('inpost-geowidget'),
              new Promise((r) => setTimeout(r, 100)),
            ]);
          } catch {
            /* ignore */
          }
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, [scriptUrl, cssUrl]);

  return { isLoaded, error };
}
