"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Fanusik, Polozka } from "@/lib/types";
import { dovodVeta } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon } from "./ui";
import { ItemSelect } from "./ItemSelect";

export function FansSection({ items }: { items: Polozka[] }) {
  const [item, setItem] = useState<string>("witcher3");
  const { data, loading } = useApi<{ polozka: Polozka; fanusikovia: Fanusik[] }>("/api/fans", {
    item,
  });

  const polozka = data?.polozka ?? items.find((i) => i.id === item);
  const fanusikovia = data?.fanusikovia ?? [];

  return (
    <div>
      <div className="mb-5">
        <ItemSelect items={items} value={item} onChange={setItem} label="Komu by sa páčilo:" />
      </div>

      <Card className="overflow-hidden">
        {polozka && (
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <TypIcon typ={polozka.typ} />
            <div>
              <p className="font-bold text-ink">{polozka.nazov}</p>
              <p className="text-xs text-ink-faint">{polozka.rok}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-24 animate-pulse bg-slate-100" />
        ) : fanusikovia.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-faint">
            Žiadny používateľ s konkrétnymi dôvodmi zhody.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {fanusikovia.map((f) => (
              <li key={f.pouzivatel.id} className="flex items-start gap-3 px-5 py-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                  <Heart className="h-4 w-4" fill="currentColor" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{f.pouzivatel.meno}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {f.dovody.map((d, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-ink-faint ring-1 ring-slate-200"
                      >
                        {dovodVeta(d)}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
