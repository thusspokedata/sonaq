"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** false en el server y durante la hidratación; true una vez montado en el cliente. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// Listeners para escrituras en la misma pestaña (el evento "storage" solo
// dispara en las otras pestañas).
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Valor de localStorage para `key`. Devuelve `undefined` en el server y durante
 * la hidratación (todavía no se sabe), `null` si la clave no existe.
 */
export function useStoredValue(key: string): string | null | undefined {
  return useSyncExternalStore(subscribe, () => read(key), () => undefined);
}

export function setStoredValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignorar errores de storage */
  }
  listeners.forEach((l) => l());
}
