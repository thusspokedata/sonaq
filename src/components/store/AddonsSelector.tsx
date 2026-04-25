"use client";

import { ProductAddon, SelectedAddon } from "@/types";
import { formatPrice } from "@/lib/order-utils";

interface AddonsSelectorProps {
  addons: ProductAddon[];
  selected: SelectedAddon[];
  onChange: (selected: SelectedAddon[]) => void;
}

export function AddonsSelector({ addons, selected, onChange }: AddonsSelectorProps) {
  if (!addons || addons.length === 0) return null;

  const toggle = (addon: ProductAddon) => {
    const isSelected = selected.some((s) => s._key === addon._key);
    if (isSelected) {
      onChange(selected.filter((s) => s._key !== addon._key));
    } else {
      onChange([...selected, { _key: addon._key, title: addon.title, price: addon.price }]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#5a4535" }}>
        Opciones adicionales
      </p>
      <div className="flex flex-col gap-2">
        {addons.map((addon) => {
          const isSelected = selected.some((s) => s._key === addon._key);
          return (
            <button
              key={addon._key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(addon)}
              className="flex items-start gap-3 p-3 border text-left transition-colors"
              style={{
                borderColor: isSelected ? "#b8521a" : "#d4c4ae",
                backgroundColor: isSelected ? "#fff5f0" : "#fff",
              }}
            >
              {/* Checkbox visual */}
              <span
                className="mt-0.5 w-4 h-4 flex-shrink-0 border flex items-center justify-center text-xs"
                style={{
                  borderColor: isSelected ? "#b8521a" : "#d4c4ae",
                  backgroundColor: isSelected ? "#b8521a" : "transparent",
                  color: "#f5f0e8",
                }}
              >
                {isSelected ? "✓" : ""}
              </span>
              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-sm font-medium" style={{ color: "#1a0f00" }}>
                    {addon.title}
                  </span>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: "#b8521a" }}>
                    + {formatPrice(addon.price)}
                  </span>
                </div>
                {addon.description && (
                  <p className="text-xs mt-0.5" style={{ color: "#5a4535" }}>
                    {addon.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
