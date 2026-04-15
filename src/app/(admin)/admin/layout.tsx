import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col border-r shrink-0"
        style={{ backgroundColor: "#ede5d8", borderColor: "#d4c4ae" }}
      >
        {/* Logo */}
        <div className="flex justify-center py-6 border-b" style={{ borderColor: "#d4c4ae" }}>
          <Link href="/" target="_blank" aria-label="Ver tienda">
            <Image
              src="/logo-sonaq.png"
              alt="Sonaq"
              width={52}
              height={78}
              style={{ mixBlendMode: "multiply" }}
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          <p
            className="text-xs uppercase tracking-widest mb-2 px-2"
            style={{ color: "#a08060" }}
          >
            Gestión
          </p>
          {[
            { href: "/admin/pedidos", label: "Pedidos" },
            { href: "/admin/productos", label: "Productos" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium rounded transition-colors hover:bg-white/50"
              style={{ color: "#1a0f00" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: "#d4c4ae" }}>
          <p className="text-xs mb-3 truncate" style={{ color: "#5a4535" }}>
            {session.user?.email}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="w-full py-2 text-xs uppercase tracking-widest border transition-colors hover:bg-white/50"
              style={{ borderColor: "#d4c4ae", color: "#5a4535" }}
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
