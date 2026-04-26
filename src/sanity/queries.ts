import { groq } from "next-sanity";

export const ALL_PRODUCTS_QUERY = groq`
  *[_type == "product" && available == true && !(_id in path("drafts.**"))] | order(_createdAt desc) {
    _id,
    title,
    slug,
    shortDescription,
    price,
    "images": images[] { _key, asset, alt },
    category,
    stock,
    featured
  }
`;

export const FEATURED_PRODUCTS_QUERY = groq`
  *[_type == "product" && available == true && featured == true] | order(_createdAt desc) [0..5] {
    _id,
    title,
    slug,
    shortDescription,
    price,
    "images": images[] { _key, asset, alt },
    category,
    stock
  }
`;

export const PRODUCT_BY_SLUG_QUERY = groq`
  *[_type == "product" && slug.current == $slug && available == true][0] {
    _id,
    title,
    slug,
    description,
    shortDescription,
    price,
    "images": images[] { _key, asset, alt },
    category,
    features,
    dimensions,
    materials,
    capacity,
    stock,
    featured,
    "addons": addons[] { _key, title, description, price },
    "colors": colors[] { _key, name, hex }
  }
`;

export const PRODUCTS_BY_CATEGORY_QUERY = groq`
  *[_type == "product" && available == true && category == $category] | order(_createdAt desc) {
    _id,
    title,
    slug,
    shortDescription,
    price,
    "images": images[] { _key, asset, alt },
    category,
    stock
  }
`;
