
import type { InPostGeowidgetProps } from './inpost-geowidget';
import type { InPostGeowidgetModalProps } from './inpost-geowidget-modal';

export type { InPostGeowidgetProps, InPostGeowidgetModalProps };

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

export interface UseInPostScriptOptions {
  sandbox?: boolean;
  customScriptUrl?: string;
  customCssUrl?: string;
}

export interface UseInPostScriptResult {
  isLoaded: boolean;
  error: Error | null;
}
