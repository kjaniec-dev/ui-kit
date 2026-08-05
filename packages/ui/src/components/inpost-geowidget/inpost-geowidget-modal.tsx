'use client';

import React, { useState } from 'react';
import { Button } from '../button';
import { Modal, ModalTitle } from '../modal';
import { InPostGeowidget } from './inpost-geowidget';
import type { InPostConfigType, InPostLanguage, InPostPoint } from './types';

/** Props for the InPost GeoWidget Modal checkout component. */
export interface InPostGeowidgetModalProps {
  /** Currently selected point object or point code string (e.g. 'WAW01M'). */
  value?: InPostPoint | string | null;
  /** Callback triggered when point is selected on the map. */
  onSelect?: (point: InPostPoint) => void;
  /** Trigger button label. Default 'Wybierz Paczkomat®'. */
  triggerText?: string;
  /** Modal header title. Default 'Wybierz punkt odbioru InPost'. */
  modalTitle?: string;
  /** Disable trigger button. Default false. */
  disabled?: boolean;
  /** Controlled open state of the modal. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Show selected point badge under trigger button. Default true. */
  showSelectedBadge?: boolean;
  /** Outer container CSS class name. */
  className?: string;
  /** Trigger button style variant ('primary', 'secondary', 'outline', 'ghost', 'danger'). Default 'outline'. */
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Trigger button size ('sm', 'md', 'lg'). Default 'md'. */
  buttonSize?: 'sm' | 'md' | 'lg';
  /** InPost API Token (optional for sandbox). */
  token?: string;
  /** Widget language ('pl', 'en', 'uk', 'de', 'it', 'fr'). Default 'pl'. */
  language?: InPostLanguage;
  /** Widget configuration type ('parcelCollect', 'parcelCollectPayment', 'international', 'postBuy'). Default 'parcelCollect'. */
  config?: InPostConfigType;
  /** Enable sandbox environment. Default false. */
  sandbox?: boolean;
  /** Custom SDK JavaScript URL. */
  customScriptUrl?: string;
  /** Custom SDK CSS URL. */
  customCssUrl?: string;
}

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
  buttonSize = 'md',
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

      <Modal open={isOpen} onClose={() => handleOpenToggle(false)} width={850}>
        <ModalTitle>{modalTitle}</ModalTitle>
        <div className="w-full h-[550px] min-h-[450px] mt-3">
          {isOpen && (
            <InPostGeowidget
              token={token}
              language={language}
              config={config}
              sandbox={sandbox}
              customScriptUrl={customScriptUrl}
              customCssUrl={customCssUrl}
              onPointSelect={handlePointSelect}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
