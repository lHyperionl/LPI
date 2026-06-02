"use client";

import { useEffect, useState } from "react";

// Maly fetch hook na klientske volania proxy endpointov /api/*.
export function useApi<T>(
  path: string | null,
  params?: Record<string, string | number>,
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);

  const key = path ? `${path}?${new URLSearchParams(
    Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])),
  ).toString()}` : null;

  useEffect(() => {
    if (!path || !key) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetch(key, { headers: { Accept: "application/json" } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (alive) setData(json as T);
      })
      .catch((e) => {
        console.error("useApi error:", e);
        if (alive) setError("Nepodarilo sa načítať dáta. Skúste to znova.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error };
}
