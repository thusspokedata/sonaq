"use client";

import { useState } from "react";
import Image from "next/image";
import { SanityImage } from "@/types";
import { urlFor } from "@/lib/sanity";

interface ProductGalleryProps {
  images: SanityImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-neutral-100 flex items-center justify-center text-neutral-400">
        Sin imagen
      </div>
    );
  }

  const mainUrl = urlFor(images[selected]).width(800).height(800).fit("crop").url();

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square bg-neutral-100 relative overflow-hidden">
        <Image
          src={mainUrl}
          alt={images[selected]?.alt ?? title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => {
            const thumbUrl = urlFor(img).width(120).height(120).fit("crop").url();
            return (
              <button
                key={img._key}
                onClick={() => setSelected(i)}
                className={`flex-shrink-0 w-20 h-20 relative border-2 transition-colors ${
                  selected === i ? "border-black" : "border-transparent"
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={img.alt ?? `${title} ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
