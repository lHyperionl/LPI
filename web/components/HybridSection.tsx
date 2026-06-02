"use client";

import type { HybridOdporucanie } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon, Pill } from "./ui";

export function HybridSection({ user }: { user: string }) {
  const { data, loading } = useApi<{ odporucania: HybridOdporucanie[] }>("/api/hybrid", { user });
  const odp = (data?.odporucania ?? []).slice(0, 6);
  const max = Math.max(1, ...odp.map((o) => o.hybrid));

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />;
  if (odp.length === 0)
    return <p className="text-sm text-ink-faint">Žiadne hybridné odporúčania.</p>;

  return (
    <Card className="divide-y divide-slate-100">
      {odp.map((o) => (
        <div key={o.polozka.id} className="flex items-center gap-4 px-5 py-4">
          <TypIcon typ={o.polozka.typ} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-semibold text-ink">{o.polozka.nazov}</p>
              <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                {o.hybrid}
              </span>
            </div>
            {/* Bar: content (plne) + bonus (svetly) */}
            <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-primary"
                style={{ width: `${(o.content / max) * 100}%` }}
                title={`Content skóre: ${o.content}`}
              />
              <div
                className="h-full bg-primary/35"
                style={{ width: `${(o.bonus / max) * 100}%` }}
                title={`Hybridný bonus: +${o.bonus}`}
              />
            </div>
          </div>
          {o.bonus > 0 && <Pill tone="accent">+{o.bonus} bonus</Pill>}
        </div>
      ))}
      <div className="flex items-center gap-4 px-5 py-3 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-accent" /> content-based skóre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-full bg-primary/35" /> collab / adaptácia / univerzum
        </span>
      </div>
    </Card>
  );
}
