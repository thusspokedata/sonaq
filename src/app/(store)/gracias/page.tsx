import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ClearCartOnMount } from "@/components/store/ClearCartOnMount";

export const metadata: Metadata = {
  title: "Tu pedido — Sonaq",
  robots: { index: false, follow: false },
};

const HEADING: React.CSSProperties = {
  fontFamily: "var(--font-barlow-condensed), sans-serif",
  color: "#1a0f00",
};

type PageState = "success" | "pending" | "failure";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string; mp?: string }>;
}) {
  const { orden, mp } = await searchParams;

  const order = orden
    ? await prisma.order.findUnique({
        where: { id: orden },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          paymentMethod: true,
          total: true,
          items: {
            select: { id: true, title: true, quantity: true, price: true, color: true, image: true, addons: true },
          },
        },
      })
    : null;

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center flex flex-col gap-6">
        <p className="text-4xl font-black uppercase" style={HEADING}>Orden no encontrada</p>
        <Link href="/productos" className="text-sm underline" style={{ color: "#b8521a" }}>
          Volver a productos
        </Link>
      </div>
    );
  }

  const pageState: PageState =
    order.paymentMethod === "BANK_TRANSFER" ? "success" :
    mp === "success" ? "success" :
    mp === "failure" ? "failure" :
    "pending";

  const shouldClearCart = pageState === "success";

  // Configuración visual por estado
  const stateConfig = {
    success: {
      icon: "✓",
      iconBg: "#b8521a",
      heading: "¡Pedido confirmado!",
      subtext: (name: string, email: string) =>
        <>Gracias, <strong>{name}</strong>. Te confirmamos la orden a <strong>{email}</strong>.</>,
    },
    pending: {
      icon: "⏳",
      iconBg: "#9a7a65",
      heading: "Tu pago está siendo procesado",
      subtext: (name: string) =>
        <>{name}, tu orden fue recibida. El pago puede tardar unos minutos en confirmarse.</>,
    },
    failure: {
      icon: "✕",
      iconBg: "#5a4535",
      heading: "El pago no se completó",
      subtext: () =>
        <>No pudimos procesar el pago. Tu carrito sigue guardado — podés reintentar sin perder nada.</>,
    },
  } as const;

  const cfg = stateConfig[pageState];

  return (
    <div className="max-w-xl mx-auto px-4 py-20 flex flex-col gap-8">
      {/* Limpiar carrito solo en estado exitoso */}
      <ClearCartOnMount active={shouldClearCart} />

      {/* Icono + título */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-16 h-16 flex items-center justify-center text-3xl"
          style={{ backgroundColor: cfg.iconBg, color: "#f5f0e8" }}
        >
          {cfg.icon}
        </div>
        <h1 className="text-4xl font-black uppercase" style={HEADING}>
          {cfg.heading}
        </h1>
        <p className="text-sm" style={{ color: "#5a4535" }}>
          {cfg.subtext(order.customerName, order.customerEmail)}
        </p>
      </div>

      {/* Resumen de orden — siempre visible */}
      <div className="flex flex-col gap-3 p-5" style={{ backgroundColor: "#ede5d8" }}>
        <div className="flex justify-between text-sm pb-2 border-b" style={{ borderColor: "#d4c4ae" }}>
          <span style={{ color: "#5a4535" }}>Número de orden</span>
          <span className="font-mono text-xs" style={{ color: "#1a0f00" }}>{order.id}</span>
        </div>

        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 text-sm">
            {item.image && (
              <div className="w-14 h-14 flex-shrink-0 relative" style={{ backgroundColor: "#d4c4ae" }}>
                <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />
              </div>
            )}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex justify-between">
                <span className="font-medium" style={{ color: "#1a0f00" }}>
                  {item.title} × {item.quantity}
                </span>
                <span style={{ color: "#1a0f00" }}>
                  ${(Number(item.price) * item.quantity).toLocaleString("es-AR")}
                </span>
              </div>
              {item.color && (
                <span className="text-xs" style={{ color: "#5a4535" }}>Color: {item.color}</span>
              )}
              {Array.isArray(item.addons) && item.addons.length > 0 && (
                <ul className="text-xs" style={{ color: "#5a4535" }}>
                  {(item.addons as { title: string }[]).map((a, j) => (
                    <li key={j}>+ {a.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-between text-sm pt-2 border-t font-bold" style={{ borderColor: "#d4c4ae" }}>
          <span style={{ color: "#5a4535" }}>Total</span>
          <span style={{ color: "#1a0f00" }}>
            ${Number(order.total).toLocaleString("es-AR")}
          </span>
        </div>
      </div>

      {/* Bloque de instrucciones/acción por estado */}
      {pageState === "success" && order.paymentMethod === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#b8521a" }}>
            Datos para la transferencia
          </p>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Te enviaremos los datos bancarios a <strong>{order.customerEmail}</strong> en los próximos minutos.
            Una vez realizada la transferencia, mandanos el comprobante por WhatsApp al{" "}
            <a href="https://wa.me/5493512881616" className="underline font-medium" style={{ color: "#b8521a" }}>
              +54 9 351 288-1616
            </a>.
          </p>
        </div>
      )}

      {pageState === "success" && order.paymentMethod === "MERCADOPAGO" && (
        <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Tu pago fue procesado por MercadoPago. Recibirás la confirmación por email.
          </p>
        </div>
      )}

      {pageState === "pending" && (
        <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#9a7a65" }}>
            Pago en proceso
          </p>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Si pagaste en efectivo (Rapipago / PagoFácil), la acreditación puede tardar hasta 2 días hábiles.
            Te avisaremos por email cuando se confirme.
          </p>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            ¿Tenés dudas? Escribinos por{" "}
            <a href="https://wa.me/5493512881616" className="underline font-medium" style={{ color: "#b8521a" }}>
              WhatsApp al +54 9 351 288-1616
            </a>.
          </p>
        </div>
      )}

      {pageState === "failure" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae", backgroundColor: "#fdf8f5" }}>
            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#5a4535" }}>
              ¿Qué podés hacer?
            </p>
            <p className="text-sm" style={{ color: "#5a4535" }}>
              Tu carrito sigue guardado con todos los productos. Podés volver al checkout y reintentar
              con otra tarjeta o elegir pago por transferencia bancaria.
            </p>
          </div>

          {/* CTA principal: reintentar */}
          <Link
            href="/checkout"
            className="text-center py-3 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
          >
            Reintentar pago
          </Link>

          {/* Alternativa: WhatsApp */}
          <a
            href="https://wa.me/5493512881616"
            className="text-center text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "#b8521a" }}
          >
            Contactarnos por WhatsApp
          </a>
        </div>
      )}

      {pageState !== "failure" && (
        <Link
          href="/productos"
          className="text-center text-sm font-semibold uppercase tracking-widest py-3 transition-opacity hover:opacity-80"
          style={{ color: "#b8521a" }}
        >
          Seguir comprando
        </Link>
      )}
    </div>
  );
}
