"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { SanityProduct, SelectedAddon, ProductColorCatalog } from "@/types";
import { urlFor } from "@/lib/sanity";
import { AddonsSelector } from "./AddonsSelector";
import { ColorSelector } from "./ColorSelector";
import { CatalogColorSelector } from "./CatalogColorSelector";
import { formatPrice } from "@/lib/order-utils";

interface AddToCartButtonProps {
  product: SanityProduct;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  // Swatch de textura propio
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  // Catálogo externo (Faplac / Egger)
  const [selectedCatalog, setSelectedCatalog] = useState<ProductColorCatalog | null>(null);
  const [catalogColorText, setCatalogColorText] = useState("");

  const addItem = useCartStore((s) => s.addItem);

  const hasColors = product.colors && product.colors.length > 0;
  const hasCatalogs = product.colorCatalogs && product.colorCatalogs.length > 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const catalogExtra = selectedCatalog?.priceExtra ?? 0;
  const totalPrice = (product.price ?? 0) + addonsTotal + catalogExtra;

  // Exclusión mutua: al elegir swatch se limpia catálogo y viceversa
  const handleColorChange = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedCatalog(null);
    setCatalogColorText("");
  };

  const handleCatalogSelect = (catalog: ProductColorCatalog | null) => {
    setSelectedCatalog(catalog);
    if (catalog) setSelectedColor(null);
  };

  // Puede agregar si:
  // - No hay colores ni catálogos → siempre
  // - Hay swatches → debe haber uno seleccionado
  // - Hay catálogos → si eligió catálogo, debe haber escrito el color
  const colorRequired = hasColors || hasCatalogs;
  const colorChosen =
    selectedColor !== null ||
    (selectedCatalog !== null && catalogColorText.trim().length > 0);
  const canAdd = !colorRequired || colorChosen;

  const handleAdd = () => {
    if (!canAdd) return;

    const sanityImage = product.images?.[0];
    const hasSanityImage = sanityImage?.asset?._ref !== "" && sanityImage?.asset?._ref != null;
    const imageUrl = hasSanityImage
      ? urlFor(sanityImage).width(200).height(200).fit("crop").url()
      : (product.localImages?.[0] ?? undefined);

    // Color final: swatch propio o "Marca — código del catálogo"
    const colorValue = selectedColor
      ? selectedColor
      : selectedCatalog
      ? `${selectedCatalog.brand} — ${catalogColorText.trim()}`
      : undefined;

    const addonKey = selectedAddons.map((a) => a._key).sort().join("|");
    const colorKey = colorValue ?? "";
    const cartItemId = [product._id, colorKey, addonKey].filter(Boolean).join("-");

    addItem({
      cartItemId,
      productId: product._id,
      title: product.title,
      basePrice: product.price ?? 0,
      price: totalPrice,
      addons: selectedAddons,
      color: colorValue,
      quantity: 1,
      slug: product.slug.current,
      image: imageUrl,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (disabled) {
    return (
      <button
        disabled
        className="w-full py-4 text-sm font-semibold uppercase tracking-widest cursor-not-allowed"
        style={{ backgroundColor: "#d4c4ae", color: "#5a4535" }}
      >
        Sin stock
      </button>
    );
  }

  // Mensaje de ayuda en el botón según el estado
  const buttonLabel = () => {
    if (added) return "✓ Agregado";
    if (!canAdd) {
      if (selectedCatalog && !catalogColorText.trim()) return "Escribí el color del catálogo";
      return "Elegí un color para continuar";
    }
    return "Agregar al carrito";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de swatch de textura propio */}
      {hasColors && (
        <ColorSelector
          colors={product.colors!}
          selected={selectedColor}
          onChange={handleColorChange}
        />
      )}

      {/* Selector de catálogo externo */}
      {hasCatalogs && (
        <CatalogColorSelector
          catalogs={product.colorCatalogs!}
          selectedCatalog={selectedCatalog}
          colorText={catalogColorText}
          onSelectCatalog={handleCatalogSelect}
          onColorTextChange={setCatalogColorText}
          disabled={selectedColor !== null}
        />
      )}

      {/* Selector de opcionales */}
      {product.addons && product.addons.length > 0 && (
        <AddonsSelector
          addons={product.addons}
          selected={selectedAddons}
          onChange={setSelectedAddons}
        />
      )}

      {/* Total cuando hay extras */}
      {(selectedAddons.length > 0 || catalogExtra > 0) && (
        <div className="flex justify-between items-baseline border-t pt-3" style={{ borderColor: "#d4c4ae" }}>
          <span className="text-xs uppercase tracking-widest" style={{ color: "#5a4535" }}>
            Total
          </span>
          <span className="text-2xl font-black" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
      )}

      {/* Botón */}
      <span style={{ cursor: !canAdd ? "not-allowed" : "default" }}>
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full py-4 text-sm font-semibold uppercase tracking-widest transition-all"
          style={{
            backgroundColor: !canAdd ? "#d4c4ae" : added ? "#8b3d10" : "#b8521a",
            color: !canAdd ? "#5a4535" : "#f5f0e8",
            letterSpacing: "0.15em",
            pointerEvents: !canAdd ? "none" : "auto",
          }}
        >
          {buttonLabel()}
        </button>
      </span>
    </div>
  );
}
