"use client";

import { setStoredValue, useStoredValue } from "@/lib/client-storage";

const DISMISSED_KEY = "construction_banner_dismissed";

export function ConstructionBanner() {
  // undefined (server/hidratación) → oculto, igual que antes de montar.
  const visible = useStoredValue(DISMISSED_KEY) === null;

  const dismiss = () => setStoredValue(DISMISSED_KEY, "1");

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
