"use client";

import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** false en el server y durante la hidratación; true una vez montado en el cliente. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
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
 * la hidratación (todavía no se sabe), `null` si la clave no existe. Se actualiza
 * cuando otra pestaña cambia esa clave.
 */
export function useStoredValue(key: string): string | null | undefined {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onStorage = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    },
    [key],
  );
  return useSyncExternalStore(subscribe, () => read(key), () => undefined);
}
