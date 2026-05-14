"use client";

import Image from "next/image";
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
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Seleccionar color">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          const texturaUrl = color.textura?.asset?.url ?? null;

          return (
            <button
              key={color._key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Color: ${color.name}${isSelected ? " (seleccionado)" : ""}`}
              onClick={() => onChange(color.name)}
              className="relative overflow-hidden transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b8521a]"
              style={{
                width: 48,
                height: 48,
                borderRadius: 6,
                flexShrink: 0,
                backgroundColor: texturaUrl ? undefined : (color.hex ?? "#d4c4ae"),
                border: isSelected ? "3px solid #b8521a" : "2px solid #d4c4ae",
                ...(isSelected && { outline: "2px solid #f5f0e8", outlineOffset: -4 }),
              }}
            >
              {texturaUrl && (
                <Image
                  src={texturaUrl}
                  alt={color.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  draggable={false}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
