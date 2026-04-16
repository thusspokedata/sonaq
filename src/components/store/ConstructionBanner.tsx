"use client";

import { useState, useEffect } from "react";

export function ConstructionBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("construction_banner_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem("construction_banner_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="w-full flex items-center justify-between gap-4 px-4 py-3"
      style={{ backgroundColor: "#1a0f00" }}
    >
      <div className="flex items-center gap-3 flex-1 justify-center">
        <span className="text-lg">🚧</span>
        <p
          className="text-xs uppercase tracking-widest font-medium"
          style={{ color: "#ede5d8", letterSpacing: "0.15em" }}
        >
          Sitio en construcción — pronto abrimos
        </p>
        <span className="text-lg">🚧</span>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-xs uppercase tracking-widest px-3 py-1 border transition-opacity hover:opacity-70"
        style={{ borderColor: "#5a4535", color: "#ede5d8" }}
        aria-label="Cerrar aviso"
      >
        Ver igual
      </button>
    </div>
  );
}
