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
    <div className={`inline-flex flex-col gap-3 min-w-[280px] ${className}`}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        disabled={disabled}
        onClick={() => handleOpenToggle(true)}
        className="w-full justify-between gap-4 text-left font-bold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all py-2.5 px-3.5 rounded-xl text-slate-900 dark:text-slate-100"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="font-black text-[0.7rem] bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md shadow-sm tracking-tight uppercase border border-amber-500/30 shrink-0">
            InPost
          </span>
          <span className="truncate text-slate-900 dark:text-slate-100 font-bold text-sm">
            {selectedCode ? `Paczkomat® ${selectedCode}` : triggerText}
          </span>
        </span>
        <span className="text-xs font-black bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950 px-2.5 py-1 rounded-md shrink-0 shadow-sm uppercase tracking-wide">
          {selectedCode ? 'Zmień' : 'Wybierz'}
        </span>
      </Button>

      {showSelectedBadge && selectedCode && (
        <div className="text-xs bg-slate-950 text-slate-100 dark:bg-slate-900 border-2 border-slate-950 dark:border-amber-500/40 p-3.5 rounded-xl flex flex-col gap-1.5 shadow-md">
          <div className="font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm animate-pulse" />
              <span className="font-black text-sm text-amber-400">Paczkomat® {selectedCode}</span>
            </span>
            <span className="text-[0.65rem] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
              Wybrany
            </span>
          </div>
          {selectedAddress && (
            <div className="text-slate-200 dark:text-slate-300 text-[0.78rem] font-medium pl-4 border-l-2 border-slate-800">
              {selectedAddress}
            </div>
          )}
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
