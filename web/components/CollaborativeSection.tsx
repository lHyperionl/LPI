"use client";

import { Users, ArrowRight } from "lucide-react";
import type { PodobnyPouzivatel, Polozka } from "@/lib/types";
import { dovodVeta } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon, Pill } from "./ui";

export function CollaborativeSection({ user }: { user: string }) {
  const { data, loading } = useApi<{
    podobni: PodobnyPouzivatel[];
    odporucania: Polozka[];
  }>("/api/collaborative", { user });

  if (loading) return <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />;

  const podobni = data?.podobni ?? [];
  const odp = data?.odporucania ?? [];

  if (podobni.length === 0)
    return (
      <p className="text-sm text-ink-faint">
        Pre tohto používateľa systém nenašiel dostatočne podobných používateľov.
      </p>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Podobni pouzivatelia */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <Users className="h-4 w-4 text-accent" /> Podobní používatelia
        </h3>
        <div className="space-y-3">
          {podobni.map((p) => (
            <Card key={p.pouzivatel.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-ink">{p.pouzivatel.meno}</span>
                <Pill tone="accent">skóre podobnosti {p.skore}</Pill>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.dovody.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-ink-faint ring-1 ring-slate-200"
                  >
                    {dovodVeta(d)}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Co od nich odporucame */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <ArrowRight className="h-4 w-4 text-accent" /> Odporúčania od podobných používateľov
        </h3>
        {odp.length === 0 ? (
          <p className="text-sm text-ink-faint">Žiadne ďalšie odporúčania.</p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {odp.map((p) => (
              <Card key={p.id} className="flex items-center gap-3 p-3">
                <TypIcon typ={p.typ} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{p.nazov}</p>
                  <p className="text-xs text-ink-faint">{p.rok}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
