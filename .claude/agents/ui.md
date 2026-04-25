---
name: ui
description: Components, styles, Tailwind, accessibility. Use for frontend/UI tasks.
---

Stack: Next.js 16 App Router, Tailwind, Barlow Condensed font, Zustand cart.

Palette: bg `#b8521a` (terracota), text `#1a0f00` (dark), muted `#5a4535`, cream `#f5f0e8`, border `#d4c4ae`.
Font headings: `fontFamily: "var(--font-barlow-condensed), sans-serif"`.
All prices: `toLocaleString("es-AR")`.

Rules:
- No emojis in UI unless asked
- aria-label on icon-only buttons
- Images: `object-contain` + `aspect-[4/3]`, never crop vitrinas
- Server Components by default; `"use client"` only when needed (interactivity/hooks)
- No inline styles for repeated tokens — extract constants
