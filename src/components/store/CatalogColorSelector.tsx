"use client";

import { ProductColorCatalog } from "@/types";
import { formatPrice } from "@/lib/order-utils";

interface CatalogColorSelectorProps {
  catalogs: ProductColorCatalog[];
  selectedCatalog: ProductColorCatalog | null;
  colorText: string;
  onSelectCatalog: (catalog: ProductColorCatalog | null) => void;
  onColorTextChange: (text: string) => void;
  /** true cuando ya hay un swatch de textura seleccionado */
  disabled?: boolean;
}

export function CatalogColorSelector({
  catalogs,
  selectedCatalog,
  colorText,
  onSelectCatalog,
  onColorTextChange,
  disabled = false,
}: CatalogColorSelectorProps) {
  if (!catalogs || catalogs.length === 0) return null;

  const handleCatalogClick = (catalog: ProductColorCatalog) => {
    if (disabled) return;
    // Toggle: click en el seleccionado lo deselecciona
    if (selectedCatalog?._key === catalog._key) {
      onSelectCatalog(null);
      onColorTextChange("");
    } else {
      onSelectCatalog(catalog);
      onColorTextChange("");
    }
  };

  return (
    <div
      className="flex flex-col gap-3"
      style={{ opacity: disabled ? 0.4 : 1, transition: "opacity 0.2s" }}
    >
      {/* Separador con label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: "#d4c4ae" }} />
        <p
          className="text-xs uppercase tracking-widest font-semibold shrink-0"
          style={{ color: "#5a4535" }}
        >
          O elegí del catálogo
        </p>
        <div className="flex-1 h-px" style={{ backgroundColor: "#d4c4ae" }} />
      </div>

      {/* Botones de catálogo */}
      <div className="flex flex-wrap gap-2">
        {catalogs.map((catalog) => {
          const isSelected = selectedCatalog?._key === catalog._key;
          return (
            <button
              key={catalog._key}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Catálogo ${catalog.brand}, precio adicional ${formatPrice(catalog.priceExtra)}`}
              onClick={() => handleCatalogClick(catalog)}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
              style={{
                border: isSelected ? "2px solid #b8521a" : "2px solid #d4c4ae",
                backgroundColor: isSelected ? "rgba(184,82,26,0.06)" : "transparent",
                color: isSelected ? "#b8521a" : "#5a4535",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {catalog.brand}
              <span
                className="font-normal normal-case"
                style={{ color: isSelected ? "#b8521a" : "#9a7a65", opacity: 0.9 }}
              >
                +{formatPrice(catalog.priceExtra)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Instrucciones + input — solo cuando hay catálogo seleccionado */}
      {selectedCatalog && (
        <div
          className="flex flex-col gap-3 p-4"
          style={{ backgroundColor: "#f5f0e8", border: "1px solid #d4c4ae" }}
        >
          {/* Pasos */}
          <ol className="flex flex-col gap-1.5 text-xs" style={{ color: "#5a4535" }}>
            <li>
              <span className="font-semibold">① </span>
              {selectedCatalog.catalogUrl ? (
                <a
                  href={selectedCatalog.catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: "#b8521a" }}
                >
                  Abrí el catálogo {selectedCatalog.brand} →
                </a>
              ) : (
                <span>Buscá el catálogo {selectedCatalog.brand} en su sitio web</span>
              )}
            </li>
            <li>
              <span className="font-semibold">② </span>
              Elegí el color que te gusta y anotá el código o nombre
            </li>
            <li>
              <span className="font-semibold">③ </span>
              Escribilo acá abajo
            </li>
          </ol>

          {/* Input */}
          <input
            type="text"
            value={colorText}
            onChange={(e) => onColorTextChange(e.target.value)}
            placeholder={`Ej: ${selectedCatalog.brand === "Egger" ? "M961 ST9 Fresno Natural" : "B2 Blanco Polar"}`}
            aria-label={`Código o nombre del color ${selectedCatalog.brand}`}
            className="w-full px-3 py-2 text-sm outline-none transition-colors"
            style={{
              border: "1px solid #d4c4ae",
              backgroundColor: "#fff",
              color: "#1a0f00",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#b8521a")}
            onBlur={(e) => (e.target.style.borderColor = "#d4c4ae")}
          />

          {/* Aclaración */}
          <p className="text-xs" style={{ color: "#9a7a65" }}>
            El código aparece debajo de cada muestra en el catálogo. Sonaq se contactará con vos para confirmar disponibilidad antes de fabricar.
          </p>
        </div>
      )}

      {/* Aviso cuando está deshabilitado */}
      {disabled && (
        <p className="text-xs" style={{ color: "#9a7a65" }}>
          Deseleccioná el acabado de arriba para elegir un color del catálogo.
        </p>
      )}
    </div>
  );
}
