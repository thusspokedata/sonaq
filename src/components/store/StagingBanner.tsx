export function StagingBanner() {
  if (process.env.NEXT_PUBLIC_STAGING_BANNER !== "true") return null;

  return (
    <div
      className="w-full sticky top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-center"
      style={{ backgroundColor: "#f0ad00", color: "#1a0f00" }}
    >
      ⚠️ Entorno de pruebas — los pedidos no son reales. Sitio oficial:{" "}
      <a
        href="https://sonaq.com.ar"
        className="underline underline-offset-2 hover:opacity-70 transition-opacity"
        style={{ color: "#1a0f00" }}
      >
        sonaq.com.ar
      </a>
    </div>
  );
}
