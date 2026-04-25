"use client";

import { useState } from "react";

const FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#b8521a" };

export function EmailReveal() {
  const [visible, setVisible] = useState(false);

  const email = ["ventas", "sonaq.com.ar"].join("@");

  return visible ? (
    <a
      href={`mailto:${email}`}
      className="text-2xl font-black uppercase hover:underline"
      style={FONT}
    >
      {email}
    </a>
  ) : (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="text-2xl font-black uppercase hover:opacity-80 transition-opacity text-left"
      style={FONT}
    >
      Mostrar email →
    </button>
  );
}
