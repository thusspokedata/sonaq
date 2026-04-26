"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, NewsletterState } from "@/app/(store)/newsletter/actions";

const INITIAL: NewsletterState = { status: "idle" };

interface NewsletterFormProps {
  /** Activar variante sobre fondo oscuro (#1a0f00) */
  dark?: boolean;
}

export function NewsletterForm({ dark = false }: NewsletterFormProps) {
  const [state, action, pending] = useActionState(subscribeToNewsletter, INITIAL);

  if (state.status === "success") {
    return (
      <p role="status" aria-live="polite" className="text-sm font-semibold" style={{ color: "#b8521a" }}>
        Listo. Te avisamos cuando haya novedades.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex gap-0">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          aria-label="Tu email"
          disabled={pending}
          className="flex-1 min-w-0 px-3 py-2 text-sm outline-none"
          style={{
            border: dark ? "1px solid #3d2a18" : "1px solid #d4c4ae",
            borderRight: "none",
            backgroundColor: dark ? "#2e1f0e" : "#fff",
            color: dark ? "#f5f0e8" : "#1a0f00",
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            backgroundColor: pending ? (dark ? "#3d2a18" : "#d4c4ae") : "#b8521a",
            color: pending && !dark ? "#5a4535" : "#f5f0e8",
            whiteSpace: "nowrap",
          }}
        >
          {pending ? "..." : "Suscribirme"}
        </button>
      </div>
      <div aria-live="polite" role="status">
        {state.status === "duplicate" && (
          <p className="text-xs" style={{ color: dark ? "#b8521a" : "#5a4535" }}>
            Ya estás suscripto con ese email.
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="text-xs" style={{ color: "#b8521a" }}>
            Ocurrió un error. Intentá de nuevo.
          </p>
        )}
      </div>
    </form>
  );
}
