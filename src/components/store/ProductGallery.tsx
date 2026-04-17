"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SanityImage } from "@/types";
import { urlFor } from "@/lib/sanity";

interface ProductGalleryProps {
  images: SanityImage[];
  localImages?: string[];
  title: string;
}

function Lightbox({
  src, alt, onClose, onPrev, onNext, hasPrev, hasNext,
}: {
  src: string; alt: string; onClose: () => void;
  onPrev: () => void; onNext: () => void;
  hasPrev: boolean; hasNext: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,15,0,0.92)" }}
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
        style={{ color: "#f5f0e8", backgroundColor: "rgba(255,255,255,0.1)" }}
        aria-label="Cerrar"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Flecha izquierda */}
      {hasPrev && (
        <button
          className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full transition-colors z-10"
          style={{ color: "#f5f0e8", backgroundColor: "rgba(255,255,255,0.1)" }}
          aria-label="Anterior"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          ←
        </button>
      )}

      {/* Flecha derecha */}
      {hasNext && (
        <button
          className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full transition-colors z-10"
          style={{ color: "#f5f0e8", backgroundColor: "rgba(255,255,255,0.1)" }}
          aria-label="Siguiente"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          →
        </button>
      )}

      {/* Imagen */}
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img
          key={src}
          src={src}
          alt={alt}
          className="w-full h-full object-contain max-h-[90vh]"
          style={{ display: "block", animation: "fadeIn 0.3s ease" }}
        />
        <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>
    </div>
  );
}

export function ProductGallery({ images, localImages, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasSanityImages = images?.length > 0 && images[0]?.asset?._ref !== "";

  if (hasSanityImages) {
    const mainUrl = urlFor(images[selected]).width(1200).url();
    const lightboxUrl = urlFor(images[selected]).width(2000).url();

    return (
      <>
        {lightbox && (
          <Lightbox
            src={lightboxUrl}
            alt={images[selected]?.alt ?? title}
            onClose={() => setLightbox(false)}
            onPrev={() => setSelected((s) => s - 1)}
            onNext={() => setSelected((s) => s + 1)}
            hasPrev={selected > 0}
            hasNext={selected < images.length - 1}
          />
        )}
        <div className="flex flex-col gap-3">
          <button
            className="aspect-[4/3] relative overflow-hidden w-full cursor-zoom-in"
            style={{ backgroundColor: "#ede5d8" }}
            onClick={() => setLightbox(true)}
            aria-label="Ver imagen ampliada"
          >
            <Image
              src={mainUrl}
              alt={images[selected]?.alt ?? title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          </button>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img._key}
                  onClick={() => setSelected(i)}
                  className="flex-shrink-0 w-20 h-20 relative border-2 transition-colors"
                  style={{ borderColor: selected === i ? "#b8521a" : "transparent", backgroundColor: "#ede5d8" }}
                >
                  <Image
                    src={urlFor(img).width(160).url()}
                    alt={img.alt ?? `${title} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // Fallback a imágenes locales
  const imgs = localImages ?? [];
  if (imgs.length === 0) {
    return (
      <div className="aspect-[4/3] flex items-center justify-center" style={{ backgroundColor: "#ede5d8", color: "#d4c4ae" }}>
        Sin imagen
      </div>
    );
  }

  return (
    <>
      {lightbox && (
        <Lightbox
          src={imgs[selected]}
          alt={`${title} ${selected + 1}`}
          onClose={() => setLightbox(false)}
          onPrev={() => setSelected((s) => s - 1)}
          onNext={() => setSelected((s) => s + 1)}
          hasPrev={selected > 0}
          hasNext={selected < imgs.length - 1}
        />
      )}
      <div className="flex flex-col gap-3">
        <button
          className="aspect-[4/3] relative overflow-hidden w-full cursor-zoom-in"
          style={{ backgroundColor: "#ede5d8" }}
          onClick={() => setLightbox(true)}
          aria-label="Ver imagen ampliada"
        >
          <Image
            src={imgs[selected]}
            alt={`${title} ${selected + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        </button>
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {imgs.map((src, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="flex-shrink-0 w-20 h-20 relative border-2 transition-colors"
                style={{ borderColor: selected === i ? "#b8521a" : "transparent", backgroundColor: "#ede5d8" }}
              >
                <Image src={src} alt={`${title} ${i + 1}`} fill sizes="80px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
