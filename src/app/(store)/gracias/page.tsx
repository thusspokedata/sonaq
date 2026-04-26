import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "¡Pedido confirmado!" };

const HEADING: React.CSSProperties = {
  fontFamily: "var(--font-barlow-condensed), sans-serif",
  color: "#1a0f00",
};

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string }>;
}) {
  const { orden } = await searchParams;

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

  return (
    <div className="max-w-xl mx-auto px-4 py-20 flex flex-col gap-8">
      {/* Icono + título */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="w-16 h-16 flex items-center justify-center text-3xl"
          style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
        >
          ✓
        </div>
        <h1 className="text-4xl font-black uppercase" style={HEADING}>
          ¡Pedido recibido!
        </h1>
        <p className="text-sm" style={{ color: "#5a4535" }}>
          Gracias, <strong>{order.customerName}</strong>. Te confirmamos la orden a{" "}
          <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Resumen */}
      <div className="flex flex-col gap-3 p-5" style={{ backgroundColor: "#ede5d8" }}>
        <div className="flex justify-between text-sm pb-2 border-b" style={{ borderColor: "#d4c4ae" }}>
          <span style={{ color: "#5a4535" }}>Número de orden</span>
          <span className="font-mono text-xs" style={{ color: "#1a0f00" }}>{order.id}</span>
        </div>

        {/* Items */}
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 text-sm">
            <div className="w-14 h-14 flex-shrink-0 relative" style={{ backgroundColor: "#d4c4ae" }}>
              {item.image ? (
                <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" onError={() => {}} />
              ) : null}
            </div>
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
                  {(item.addons as { title: string; _key?: string }[]).map((a) => (
                    <li key={a._key ?? a.title}>+ {a.title}</li>
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

      {/* Instrucciones según método de pago */}
      {order.paymentMethod === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: "#b8521a" }}>
            Datos para la transferencia
          </p>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Te enviaremos los datos bancarios a <strong>{order.customerEmail}</strong> en los próximos minutos.
            Una vez realizada la transferencia, mandanos el comprobante por WhatsApp al{" "}
            <a href="https://wa.me/5493512881616" className="underline font-medium" style={{ color: "#b8521a" }}>
              +54 9 351 288-1616
            </a>
            .
          </p>
        </div>
      )}

      {order.paymentMethod === "MERCADOPAGO" && (
        <div className="flex flex-col gap-3 p-5 border" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Nos pondremos en contacto para completar el pago.
          </p>
        </div>
      )}

      <Link
        href="/productos"
        className="text-center text-sm font-semibold uppercase tracking-widest py-3 transition-opacity hover:opacity-80"
        style={{ color: "#b8521a" }}
      >
        Seguir comprando
      </Link>
    </div>
  );
}
