import { defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Producto",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripcion",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "shortDescription",
      title: "Descripcion corta",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Precio (ARS)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "images",
      title: "Imagenes",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "string",
      options: {
        list: [
          { title: "Vitrina para guitarras", value: "vitrina" },
          { title: "Soporte de pared", value: "soporte-pared" },
          { title: "Soporte de pie", value: "soporte-pie" },
          { title: "Rack de guitarras", value: "rack" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "features",
      title: "Caracteristicas",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "dimensions",
      title: "Dimensiones",
      type: "object",
      fields: [
        defineField({ name: "width", title: "Ancho (cm)", type: "number" }),
        defineField({ name: "height", title: "Alto (cm)", type: "number" }),
        defineField({ name: "depth", title: "Profundidad (cm)", type: "number" }),
        defineField({ name: "weight", title: "Peso (kg)", type: "number" }),
      ],
    }),
    defineField({
      name: "materials",
      title: "Materiales",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "capacity",
      title: "Capacidad (cantidad de guitarras)",
      type: "number",
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "featured",
      title: "Destacado en inicio",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "available",
      title: "Disponible para venta",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      price: "price",
      media: "images.0",
    },
    prepare({ title, price, media }) {
      return {
        title,
        subtitle: price ? `$${price.toLocaleString("es-AR")}` : "Sin precio",
        media,
      };
    },
  },
});
