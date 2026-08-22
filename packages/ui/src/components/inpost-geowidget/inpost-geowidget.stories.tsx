import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { InPostGeowidget } from "./inpost-geowidget";
import { InPostGeowidgetModal } from "./inpost-geowidget-modal";
import type { InPostPoint } from "./types";

const meta: Meta = {
  title: "Components/InPostGeowidget",
  parameters: {
    layout: "padded",
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
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-sm">
            Wybrano: <strong>{selectedPoint.name}</strong> - {selectedPoint.address?.line1}
          </div>
        )}
        <div className="border rounded-lg overflow-hidden h-[550px]">
          <InPostGeowidget sandbox={true} onPointSelect={(point) => setSelectedPoint(point)} />
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
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Wybierz metodę dostawy i punkt odbioru Paczkomat®.
        </p>
        <InPostGeowidgetModal sandbox={true} value={point} onSelect={(p) => setPoint(p)} />
      </div>
    );
  },
};
