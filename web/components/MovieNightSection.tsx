"use client";

import { useState } from "react";
import { Clock, Trophy, Sigma } from "lucide-react";
import type { MovieNightFilm } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Card, ScoreBadge } from "./ui";

export function MovieNightSection({ user }: { user: string }) {
  const [limit, setLimit] = useState<number>(300);
  const { data, loading } = useApi<{
    najdene: boolean;
    celkova_dlzka?: number;
    celkove_skore?: number;
    filmy: MovieNightFilm[];
  }>("/api/movie-night", { user, limit });

  const filmy = data?.filmy ?? [];

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="limit" className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Clock className="h-4 w-4 text-accent" /> Časový limit večera
          </label>
          <span className="rounded-lg bg-accent-wash px-3 py-1 text-sm font-bold tabular-nums text-accent">
            {limit} min
          </span>
        </div>
        <input
          id="limit"
          type="range"
          min={90}
          max={600}
          step={15}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-faint">
          <span>90 min</span>
          <span>600 min</span>
        </div>
      </div>

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-slate-100" />
      ) : !data?.najdene || filmy.length === 0 ? (
        <p className="text-sm text-ink-faint">
          Pre tento limit sa nedá zostaviť žiadny filmový večer.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <Metric icon={<Sigma className="h-4 w-4" />} label="Celková dĺžka">
              {data.celkova_dlzka} / {limit} min
            </Metric>
            <Metric icon={<Trophy className="h-4 w-4" />} label="Maximalizované skóre">
              {data.celkove_skore} bodov
            </Metric>
          </div>

          <ul className="space-y-2">
            {filmy.map((f) => (
              <li
                key={f.polozka.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {f.polozka.nazov} <span className="text-ink-faint">({f.polozka.rok})</span>
                  </p>
                  <p className="text-xs text-ink-faint">{f.dlzka} min</p>
                </div>
                <ScoreBadge skore={f.skore} />
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-5 rounded-xl bg-ink/[0.03] px-4 py-3 text-xs leading-relaxed text-ink-faint">
        Optimálny výber rieši <strong>reálny CLP(FD) constraint solver</strong> v SWI-Prologu
        (<code className="font-mono">filmovy_vecer/5</code>,{" "}
        <code className="font-mono">labeling([max(Skóre)])</code>) — nie aproximácia v JavaScripte.
      </p>
    </Card>
  );
}

function Metric({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-2.5">
      <span className="text-accent">{icon}</span>
      <span>
        <span className="block text-[11px] uppercase tracking-wide text-ink-faint">{label}</span>
        <span className="block text-sm font-bold text-ink">{children}</span>
      </span>
    </div>
  );
}
