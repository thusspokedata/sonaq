"use client";

import { useState } from "react";
import Image from "next/image";
import { SanityImage } from "@/types";
import { urlFor } from "@/lib/sanity";

interface ProductGalleryProps {
  images: SanityImage[];
  localImages?: string[];
  title: string;
}

export function ProductGallery({ images, localImages, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  // Determina si usar Sanity o imágenes locales
  const hasSanityImages = images?.length > 0 && images[0]?.asset?._ref !== "";

  if (hasSanityImages) {
    const mainUrl = urlFor(images[selected]).width(800).height(800).fit("crop").url();
    return (
      <div className="flex flex-col gap-3">
        <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "#ede5d8" }}>
          <Image src={mainUrl} alt={images[selected]?.alt ?? title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img._key}
                onClick={() => setSelected(i)}
                className="flex-shrink-0 w-20 h-20 relative border-2 transition-colors"
                style={{ borderColor: selected === i ? "#b8521a" : "transparent" }}
              >
                <Image src={urlFor(img).width(120).height(120).fit("crop").url()} alt={img.alt ?? `${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback a imágenes locales
  const imgs = localImages ?? [];
  if (imgs.length === 0) {
    return (
      <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: "#ede5d8", color: "#d4c4ae" }}>
        Sin imagen
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square relative overflow-hidden" style={{ backgroundColor: "#ede5d8" }}>
        <Image src={imgs[selected]} alt={`${title} ${selected + 1}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex-shrink-0 w-20 h-20 relative border-2 transition-colors"
              style={{ borderColor: selected === i ? "#b8521a" : "transparent" }}
            >
              <Image src={src} alt={`${title} ${i + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
