import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_COLOR, formatPrice } from "@/lib/order-utils";
import Link from "next/link";

const ALL_STATUSES = Object.values(OrderStatus);

interface Props {
  searchParams: Promise<{ estado?: string }>;
}

export const metadata = { title: "Pedidos" };

export default async function PedidosPage({ searchParams }: Props) {
  const { estado } = await searchParams;
  const statusFilter = ALL_STATUSES.includes(estado as OrderStatus)
    ? (estado as OrderStatus)
    : undefined;

  const pedidos = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold uppercase tracking-widest mb-6"
        style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
      >
        Pedidos
      </h1>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/pedidos"
          className="px-3 py-1 text-xs uppercase tracking-widest border transition-colors"
          style={{
            borderColor: !statusFilter ? "#b8521a" : "#d4c4ae",
            backgroundColor: !statusFilter ? "#b8521a" : "transparent",
            color: !statusFilter ? "#f5f0e8" : "#5a4535",
          }}
        >
          Todos
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?estado=${s}`}
            className="px-3 py-1 text-xs uppercase tracking-widest border transition-colors"
            style={{
              borderColor: statusFilter === s ? "#b8521a" : "#d4c4ae",
              backgroundColor: statusFilter === s ? "#b8521a" : "transparent",
              color: statusFilter === s ? "#f5f0e8" : "#5a4535",
            }}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      {pedidos.length === 0 ? (
        <p className="text-sm" style={{ color: "#5a4535" }}>
          No hay pedidos{statusFilter ? ` con estado "${STATUS_LABEL[statusFilter]}"` : ""}.
        </p>
      ) : (
        <div className="border rounded overflow-hidden" style={{ borderColor: "#d4c4ae" }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#ede5d8" }}>
              <tr>
                {["ID", "Cliente", "Total", "Método", "Estado", "Fecha", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs uppercase tracking-widest font-semibold"
                    style={{ color: "#5a4535" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido, i) => (
                <tr
                  key={pedido.id}
                  style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#faf7f2", borderTop: "1px solid #ede5d8" }}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#5a4535" }}>
                    #{pedido.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#1a0f00" }}>
                    <div>{pedido.customerName}</div>
                    <div className="text-xs" style={{ color: "#5a4535" }}>{pedido.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1a0f00" }}>
                    {formatPrice(pedido.total)}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#5a4535" }}>
                    {pedido.paymentMethod === "BANK_TRANSFER" ? "Transferencia" : "MercadoPago"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={STATUS_COLOR[pedido.status]}
                    >
                      {STATUS_LABEL[pedido.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#5a4535" }}>
                    {new Date(pedido.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${pedido.id}`}
                      className="text-xs uppercase tracking-widest font-semibold"
                      style={{ color: "#b8521a" }}
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
