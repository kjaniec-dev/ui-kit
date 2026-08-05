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
