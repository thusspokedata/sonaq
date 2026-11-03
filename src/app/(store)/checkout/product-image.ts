import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/types";

export function resolveProductImage(images?: SanityImage[]): string | null {
  const image = images?.[0];
  if (!image?.asset?._ref) return null;

  try {
    return urlFor(image).width(200).height(200).fit("crop").url();
  } catch {
    return null;
  }
}
