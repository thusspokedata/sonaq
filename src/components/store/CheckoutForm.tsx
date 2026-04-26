"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { createOrder, CheckoutFormState } from "@/app/(store)/checkout/actions";

const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

const FIELD: React.CSSProperties = {
  border: "1px solid #d4c4ae",
  backgroundColor: "#fff",
  color: "#1a0f00",
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

const LABEL: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#5a4535",
  fontWeight: 600,
};

const STORAGE_KEY = "sonaq-checkout-info";

interface SavedInfo {
  name: string; email: string; phone: string;
  address: string; city: string; province: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [state, setState] = useState<CheckoutFormState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState<SavedInfo | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch { /* ignorar datos corruptos */ }
  }, []);

  const err = (field: string) =>
    state.status === "error" ? state.errors[field]?.[0] : undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Guardar datos para la próxima compra
    try {
      const info: SavedInfo = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        address: String(formData.get("address") ?? ""),
        city: String(formData.get("city") ?? ""),
        province: String(formData.get("province") ?? ""),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    } catch { /* ignorar errores de storage */ }

    startTransition(async () => {
      const result = await createOrder(items, formData);
      if (result.status === "success") {
        clearCart();
        router.push(`/gracias?orden=${result.orderId}`);
      } else {
        setState(result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Datos personales */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
          Datos de contacto
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="name" style={LABEL}>Nombre completo *</label>
          <input id="name" name="name" type="text" required autoComplete="name" defaultValue={saved?.name} style={FIELD} />
          {err("name") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("name")}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" style={LABEL}>Email *</label>
            <input id="email" name="email" type="email" required autoComplete="email" defaultValue={saved?.email} style={FIELD} />
            {err("email") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("email")}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" style={LABEL}>Teléfono</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={saved?.phone} style={FIELD} />
          </div>
        </div>
      </section>

      {/* Dirección de envío */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
          Dirección de envío
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="address" style={LABEL}>Dirección *</label>
          <input id="address" name="address" type="text" required autoComplete="street-address" defaultValue={saved?.address} style={FIELD} />
          {err("address") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("address")}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="city" style={LABEL}>Ciudad *</label>
            <input id="city" name="city" type="text" required autoComplete="address-level2" defaultValue={saved?.city} style={FIELD} />
            {err("city") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("city")}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="province" style={LABEL}>Provincia *</label>
            <select id="province" name="province" required defaultValue={saved?.province ?? ""} style={FIELD}>
              <option value="" disabled>Seleccioná...</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {err("province") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("province")}</p>}
          </div>
        </div>
      </section>

      {/* Método de pago */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-black uppercase" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
          Método de pago
        </h2>

        <div className="flex flex-col gap-2">
          {[
            { value: "BANK_TRANSFER", label: "Transferencia bancaria", desc: "Te enviamos los datos por email al confirmar" },
            { value: "MERCADOPAGO", label: "MercadoPago", desc: "Tarjeta de crédito, débito o cuotas (próximamente)", disabled: true },
          ].map(({ value, label, desc, disabled }) => (
            <label
              key={value}
              className="flex items-start gap-3 p-3 border cursor-pointer"
              style={{
                borderColor: "#d4c4ae",
                backgroundColor: disabled ? "#f9f7f4" : "#fff",
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={value}
                defaultChecked={value === "BANK_TRANSFER"}
                disabled={disabled}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1a0f00" }}>{label}</p>
                <p className="text-xs" style={{ color: "#5a4535" }}>{desc}</p>
              </div>
            </label>
          ))}
        </div>
        {err("paymentMethod") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("paymentMethod")}</p>}
      </section>

      {/* Notas */}
      <div className="flex flex-col gap-1">
        <label htmlFor="notes" style={LABEL}>Notas adicionales</label>
        <textarea id="notes" name="notes" rows={3} style={{ ...FIELD, resize: "vertical" }} placeholder="Instrucciones de entrega, referencias, etc." />
      </div>

      {/* Resumen */}
      <div className="flex justify-between items-center py-4 border-t border-b" style={{ borderColor: "#d4c4ae" }}>
        <span className="text-sm uppercase tracking-widest font-semibold" style={{ color: "#5a4535" }}>
          Total {mounted ? `(${items.reduce((s, i) => s + i.quantity, 0)} productos)` : ""}
        </span>
        <span className="text-2xl font-black" style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}>
          {mounted ? `$${total().toLocaleString("es-AR")}` : "—"}
        </span>
      </div>

      {/* T&C */}
      <div className="flex items-start gap-2">
        <input id="acceptsTerms" name="acceptsTerms" type="checkbox" required className="mt-0.5" />
        <label htmlFor="acceptsTerms" className="text-xs" style={{ color: "#5a4535" }}>
          Acepto los{" "}
          <a href="/terminos" target="_blank" className="underline" style={{ color: "#b8521a" }}>términos y condiciones</a>
          {" "}y la{" "}
          <a href="/privacidad" target="_blank" className="underline" style={{ color: "#b8521a" }}>política de privacidad</a>
        </label>
      </div>
      {err("acceptsTerms") && <p className="text-xs" style={{ color: "#b8521a" }}>{err("acceptsTerms")}</p>}

      {err("_") && <p className="text-sm text-center" style={{ color: "#b8521a" }}>{err("_")}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 text-sm font-semibold uppercase tracking-widest transition-opacity"
        style={{
          backgroundColor: isPending ? "#d4c4ae" : "#b8521a",
          color: isPending ? "#5a4535" : "#f5f0e8",
          letterSpacing: "0.15em",
        }}
      >
        {isPending ? "Procesando..." : "Confirmar pedido"}
      </button>

      {/* Indicador de compra segura */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {[
            { icon: "🔒", label: "Compra segura" },
            { icon: "🚚", label: "Envío a todo el país" },
            { icon: "✅", label: "Confirmación por email" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-sm" aria-hidden="true">{icon}</span>
              <span className="text-xs" style={{ color: "#5a4535" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
