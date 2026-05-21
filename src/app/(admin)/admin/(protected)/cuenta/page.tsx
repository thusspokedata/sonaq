"use client";

import { useActionState } from "react";
import { changeEmail, changePassword, CuentaState } from "./actions";

const IDLE: CuentaState = { status: "idle" };

const FIELD: React.CSSProperties = {
  border: "1px solid #d4c4ae",
  backgroundColor: "#fff",
  color: "#1a0f00",
  padding: "10px 12px",
  fontSize: 13,
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

const CARD = "flex flex-col gap-4 p-6 border bg-white";
const HEADING_FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif" };

function Feedback({ state }: { state: CuentaState }) {
  if (state.status === "idle") return null;
  return (
    <p
      className="text-xs font-medium"
      style={{ color: state.status === "success" ? "#2d7a3a" : "#b8521a" }}
    >
      {state.message}
    </p>
  );
}

function EmailForm() {
  const [state, action, pending] = useActionState(changeEmail, IDLE);

  return (
    <form action={action} className={CARD} style={{ borderColor: "#d4c4ae" }}>
      <h2 className="text-xl font-black uppercase" style={{ ...HEADING_FONT, color: "#1a0f00" }}>
        Cambiar email
      </h2>

      <div className="flex flex-col gap-1">
        <label style={LABEL}>Nuevo email</label>
        <input name="newEmail" type="email" required autoComplete="email" style={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label style={LABEL}>Contraseña actual (para confirmar)</label>
        <input name="currentPassword" type="password" required autoComplete="current-password" style={FIELD} />
      </div>

      <Feedback state={state} />

      <button
        type="submit"
        disabled={pending}
        className="py-3 text-xs font-semibold uppercase tracking-widest transition-opacity disabled:opacity-60 self-start px-6"
        style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
      >
        {pending ? "Guardando..." : "Actualizar email"}
      </button>
    </form>
  );
}

function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, IDLE);

  return (
    <form action={action} className={CARD} style={{ borderColor: "#d4c4ae" }}>
      <h2 className="text-xl font-black uppercase" style={{ ...HEADING_FONT, color: "#1a0f00" }}>
        Cambiar contraseña
      </h2>

      <div className="flex flex-col gap-1">
        <label style={LABEL}>Contraseña actual</label>
        <input name="currentPassword" type="password" required autoComplete="current-password" style={FIELD} />
      </div>

      <div className="flex flex-col gap-1">
        <label style={LABEL}>Nueva contraseña</label>
        <input name="newPassword" type="password" required autoComplete="new-password" minLength={8} style={FIELD} />
        <p className="text-xs" style={{ color: "#a08060" }}>Mínimo 8 caracteres</p>
      </div>

      <div className="flex flex-col gap-1">
        <label style={LABEL}>Confirmar nueva contraseña</label>
        <input name="confirmPassword" type="password" required autoComplete="new-password" style={FIELD} />
      </div>

      <Feedback state={state} />

      <button
        type="submit"
        disabled={pending}
        className="py-3 text-xs font-semibold uppercase tracking-widest transition-opacity disabled:opacity-60 self-start px-6"
        style={{ backgroundColor: "#b8521a", color: "#f5f0e8" }}
      >
        {pending ? "Guardando..." : "Actualizar contraseña"}
      </button>
    </form>
  );
}

export default function CuentaPage() {
  return (
    <div className="p-8 max-w-xl flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: "#b8521a" }}>
          Mi cuenta
        </p>
        <h1 className="text-3xl font-black uppercase" style={{ ...HEADING_FONT, color: "#1a0f00" }}>
          Configuración
        </h1>
      </div>

      <EmailForm />
      <PasswordForm />
    </div>
  );
}
