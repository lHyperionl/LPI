"use client";

import { useState } from "react";
import type { PribuznaPolozka, Polozka, Typ } from "@/lib/types";
import { dovodVeta } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { ItemSelect } from "./ItemSelect";
import { Card } from "./ui";

const TYP_FILL: Record<Typ, string> = {
  film: "#0284c7",
  kniha: "#059669",
  hra: "#7c3aed",
  serial: "#d97706",
};

export function RelationGraph({ items }: { items: Polozka[] }) {
  const [item, setItem] = useState<string>("dune");
  const { data, loading } = useApi<{ polozka: Polozka; pribuzne: PribuznaPolozka[] }>(
    "/api/related",
    { item },
  );
  const [hover, setHover] = useState<number | null>(null);

  const stred = data?.polozka;
  const pribuzne = (data?.pribuzne ?? []).slice(0, 8);

  // Radialny layout.
  const W = 720;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const R = 165;
  const maxSila = Math.max(1, ...pribuzne.map((p) => p.sila));

  return (
    <div>
      <div className="mb-5">
        <ItemSelect items={items} value={item} onChange={setItem} label="Stred grafu:" />
      </div>

      <Card className="overflow-hidden p-2">
        {loading ? (
          <div className="h-[460px] animate-pulse rounded-xl bg-slate-100" />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-[640px]">
              {/* Hrany */}
              {pribuzne.map((p, i) => {
                const angle = (i / pribuzne.length) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * R;
                const y = cy + Math.sin(angle) * R;
                const active = hover === null || hover === i;
                return (
                  <line
                    key={`e-${p.polozka.id}`}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={hover === i ? "#4f46e5" : "#cbd5e1"}
                    strokeWidth={1 + (p.sila / maxSila) * 4}
                    strokeOpacity={active ? 0.9 : 0.25}
                  />
                );
              })}

              {/* Periferne uzly */}
              {pribuzne.map((p, i) => {
                const angle = (i / pribuzne.length) * Math.PI * 2 - Math.PI / 2;
                const x = cx + Math.cos(angle) * R;
                const y = cy + Math.sin(angle) * R;
                const active = hover === null || hover === i;
                return (
                  <g
                    key={p.polozka.id}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    opacity={active ? 1 : 0.35}
                    className="cursor-default"
                  >
                    <circle r={9} cx={x} cy={y} fill={TYP_FILL[p.polozka.typ]} />
                    <text
                      x={x}
                      y={y + (Math.sin(angle) >= 0 ? 26 : -16)}
                      textAnchor="middle"
                      className="fill-ink-soft text-[11px] font-medium"
                    >
                      {p.polozka.nazov.length > 22
                        ? p.polozka.nazov.slice(0, 21) + "…"
                        : p.polozka.nazov}
                    </text>
                    <text
                      x={x}
                      y={y + (Math.sin(angle) >= 0 ? 39 : -29)}
                      textAnchor="middle"
                      className="fill-accent text-[10px] font-semibold"
                    >
                      sila {p.sila}
                    </text>
                  </g>
                );
              })}

              {/* Stredovy uzol */}
              {stred && (
                <g>
                  <circle r={30} cx={cx} cy={cy} fill="#0f172a" />
                  <circle r={36} cx={cx} cy={cy} fill="none" stroke="#4f46e5" strokeWidth={2} />
                  <text
                    x={cx}
                    y={cy + 52}
                    textAnchor="middle"
                    className="fill-ink text-sm font-bold"
                  >
                    {stred.nazov}
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}

        {/* Detail zdielanych atributov pri hoveri */}
        {hover !== null && pribuzne[hover] && (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-sm">
              <span className="font-semibold text-ink">{pribuzne[hover].polozka.nazov}</span>{" "}
              <span className="text-ink-faint">zdieľa:</span>{" "}
              {pribuzne[hover].atributy.map((a, i) => (
                <span
                  key={i}
                  className="mr-1.5 inline-block rounded-md bg-accent-wash px-2 py-0.5 text-xs font-medium text-accent"
                >
                  {dovodVeta(a)}
                </span>
              ))}
            </p>
          </div>
        )}
      </Card>

      <p className="mt-3 text-xs text-ink-faint">
        Hrúbka hrany = počet zdieľaných atribútov (žáner, krajina, štúdio, tvorca). Vypočítané
        predikátom <code className="font-mono">pribuzne_polozky/3</code>.
      </p>
    </div>
  );
}
