"use client";

import { ProductColor } from "@/types";

interface ColorSelectorProps {
  colors: ProductColor[];
  selected: string | null;
  onChange: (colorName: string) => void;
}

export function ColorSelector({ colors, selected, onChange }: ColorSelectorProps) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#5a4535" }}>
        Color{selected ? <span className="ml-2 normal-case font-normal">— {selected}</span> : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          return (
            <button
              key={color._key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Color: ${color.name}${isSelected ? " (seleccionado)" : ""}`}
              onClick={() => onChange(color.name)}
              className="transition-all"
              style={{
                width: 32,
                height: 32,
                borderRadius: 2,
                backgroundColor: color.hex ?? "#d4c4ae",
                border: isSelected ? "3px solid #b8521a" : "2px solid #d4c4ae",
                ...(isSelected && { outline: "2px solid #f5f0e8", outlineOffset: -4 }),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
