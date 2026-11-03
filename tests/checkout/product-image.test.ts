import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SanityImage } from "../../src/types";

const mocks = vi.hoisted(() => ({
  urlFor: vi.fn(),
}));

vi.mock("@/lib/sanity", () => ({
  urlFor: mocks.urlFor,
}));

import { resolveProductImage } from "../../src/app/(store)/checkout/product-image";

const validImage: SanityImage = {
  _key: "image-1",
  asset: { _ref: "image-reference", _type: "reference" },
};

describe("resolveProductImage", () => {
  beforeEach(() => {
    mocks.urlFor.mockReset();
  });

  it("returns null without images", () => {
    expect(resolveProductImage()).toBeNull();
    expect(resolveProductImage([])).toBeNull();
    expect(mocks.urlFor).not.toHaveBeenCalled();
  });

  it("returns null when the image has no asset", () => {
    const image = { _key: "image-1" } as SanityImage;

    expect(resolveProductImage([image])).toBeNull();
    expect(mocks.urlFor).not.toHaveBeenCalled();
  });

  it("returns null when the asset has no _ref", () => {
    const image = { _key: "image-1", asset: {} } as SanityImage;

    expect(resolveProductImage([image])).toBeNull();
    expect(mocks.urlFor).not.toHaveBeenCalled();
  });

  it("returns null when asset._ref is empty", () => {
    const image: SanityImage = {
      _key: "image-1",
      asset: { _ref: "", _type: "reference" },
    };

    expect(resolveProductImage([image])).toBeNull();
    expect(mocks.urlFor).not.toHaveBeenCalled();
  });

  it("builds the URL for a valid asset reference", () => {
    const builder = {
      width: vi.fn().mockReturnThis(),
      height: vi.fn().mockReturnThis(),
      fit: vi.fn().mockReturnThis(),
      url: vi.fn().mockReturnValue("https://cdn.sanity.io/product.jpg"),
    };
    mocks.urlFor.mockReturnValue(builder);

    expect(resolveProductImage([validImage])).toBe("https://cdn.sanity.io/product.jpg");
    expect(builder.width).toHaveBeenCalledWith(200);
    expect(builder.height).toHaveBeenCalledWith(200);
    expect(builder.fit).toHaveBeenCalledWith("crop");
  });

  it("returns null when the URL builder throws", () => {
    mocks.urlFor.mockImplementation(() => {
      throw new Error("Invalid image");
    });

    expect(resolveProductImage([validImage])).toBeNull();
  });
});
