'use client';

import React, { useState } from 'react';
import { Button } from '../button';
import { Modal, ModalTitle } from '../modal';
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

  const mappedVariant =
    buttonVariant === 'default'
      ? 'primary'
      : buttonVariant === 'link'
        ? 'ghost'
        : buttonVariant;

  const mappedSize = buttonSize === 'default' ? 'md' : buttonSize;

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <Button
        type="button"
        variant={mappedVariant}
        size={mappedSize}
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

      <Modal open={isOpen} onClose={() => handleOpenToggle(false)} width={800}>
        {modalTitle && <ModalTitle className="mb-4">{modalTitle}</ModalTitle>}
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
