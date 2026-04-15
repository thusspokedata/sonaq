import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import {
  STATUS_LABEL,
  STATUS_COLOR,
  STATUS_TRANSITIONS,
  formatPrice,
} from "@/lib/order-utils";
import { updateOrderStatus } from "./actions";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Pedido #${id.slice(-6).toUpperCase()}` };
}

export default async function PedidoDetailPage({ params }: Props) {
  const { id } = await params;

  const pedido = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!pedido) notFound();

  const nextStatuses = STATUS_TRANSITIONS[pedido.status];
  const address = pedido.shippingAddress as {
    address?: string;
    city?: string;
    province?: string;
  } | null;

  return (
    <div className="p-8 max-w-3xl">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/pedidos"
          className="text-xs uppercase tracking-widest"
          style={{ color: "#b8521a" }}
        >
          ← Pedidos
        </Link>
        <h1
          className="text-2xl font-bold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
        >
          Pedido #{pedido.id.slice(-6).toUpperCase()}
        </h1>
        <span
          className="px-3 py-1 text-xs font-semibold rounded"
          style={STATUS_COLOR[pedido.status]}
        >
          {STATUS_LABEL[pedido.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cliente */}
        <section
          className="p-5 border rounded"
          style={{ borderColor: "#d4c4ae", backgroundColor: "#fff" }}
        >
          <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#5a4535" }}>
            Cliente
          </h2>
          <p className="font-semibold" style={{ color: "#1a0f00" }}>{pedido.customerName}</p>
          <p className="text-sm" style={{ color: "#5a4535" }}>{pedido.customerEmail}</p>
          {pedido.customerPhone && (
            <p className="text-sm" style={{ color: "#5a4535" }}>{pedido.customerPhone}</p>
          )}
          {address?.address && (
            <p className="text-sm mt-2" style={{ color: "#5a4535" }}>
              {address.address}, {address.city}, {address.province}
            </p>
          )}
        </section>

        {/* Pago */}
        <section
          className="p-5 border rounded"
          style={{ borderColor: "#d4c4ae", backgroundColor: "#fff" }}
        >
          <h2 className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#5a4535" }}>
            Pago
          </h2>
          <p className="text-sm" style={{ color: "#5a4535" }}>
            Método:{" "}
            <span style={{ color: "#1a0f00" }}>
              {pedido.paymentMethod === "BANK_TRANSFER" ? "Transferencia bancaria" : "MercadoPago"}
            </span>
          </p>
          <p className="text-sm mt-1" style={{ color: "#5a4535" }}>
            Fecha:{" "}
            <span style={{ color: "#1a0f00" }}>
              {new Date(pedido.createdAt).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
          <p className="text-xl font-bold mt-3" style={{ color: "#b8521a" }}>
            {formatPrice(pedido.total)}
          </p>
        </section>
      </div>

      {/* Items */}
      <section
        className="border rounded mb-8"
        style={{ borderColor: "#d4c4ae", backgroundColor: "#fff" }}
      >
        <h2 className="text-xs uppercase tracking-widest font-semibold px-5 py-3 border-b" style={{ color: "#5a4535", borderColor: "#d4c4ae" }}>
          Productos
        </h2>
        {pedido.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center px-5 py-3 border-b last:border-0"
            style={{ borderColor: "#ede5d8" }}
          >
            <div>
              <p className="font-medium" style={{ color: "#1a0f00" }}>{item.title}</p>
              <p className="text-xs" style={{ color: "#5a4535" }}>Cantidad: {item.quantity}</p>
            </div>
            <p className="font-semibold" style={{ color: "#1a0f00" }}>
              {formatPrice(Number(item.price) * item.quantity)}
            </p>
          </div>
        ))}
      </section>

      {/* Notas */}
      {pedido.notes && (
        <section
          className="p-5 border rounded mb-8"
          style={{ borderColor: "#d4c4ae", backgroundColor: "#fff" }}
        >
          <h2 className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#5a4535" }}>
            Notas
          </h2>
          <p className="text-sm" style={{ color: "#1a0f00" }}>{pedido.notes}</p>
        </section>
      )}

      {/* Cambiar estado */}
      {nextStatuses.length > 0 && (
        <section
          className="p-5 border rounded"
          style={{ borderColor: "#d4c4ae", backgroundColor: "#fff" }}
        >
          <h2 className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: "#5a4535" }}>
            Cambiar estado
          </h2>
          <div className="flex flex-wrap gap-3">
            {nextStatuses.map((status) => (
              <form
                key={status}
                action={async () => {
                  "use server";
                  await updateOrderStatus(id, status);
                }}
              >
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
                >
                  {STATUS_LABEL[status]}
                </button>
              </form>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
