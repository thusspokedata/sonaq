"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin/pedidos";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="email"
          className="text-xs uppercase tracking-widest"
          style={{ color: "#5a4535" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 text-sm border outline-none focus:ring-2"
          style={{
            backgroundColor: "#fff",
            borderColor: "#d4c4ae",
            color: "#1a0f00",
            // @ts-expect-error custom property
            "--tw-ring-color": "#b8521a",
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-xs uppercase tracking-widest"
          style={{ color: "#5a4535" }}
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 text-sm border outline-none focus:ring-2"
          style={{
            backgroundColor: "#fff",
            borderColor: "#d4c4ae",
            color: "#1a0f00",
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-center" style={{ color: "#b8521a" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 py-3 text-sm font-semibold uppercase tracking-widest transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#b8521a", color: "#f5f0e8", letterSpacing: "0.15em" }}
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-sonaq.png"
            alt="Sonaq"
            width={72}
            height={108}
            priority
            style={{ mixBlendMode: "multiply" }}
          />
        </div>

        <h1
          className="text-center text-sm uppercase tracking-widest mb-8"
          style={{ color: "#5a4535", letterSpacing: "0.2em" }}
        >
          Panel de administración
        </h1>

        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
