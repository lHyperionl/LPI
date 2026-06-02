"use client";

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import type { CrossDomainItem, Polozka } from "@/lib/types";
import { dovodVeta } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon } from "./ui";
import { ItemSelect } from "./ItemSelect";

export function CrossDomainSection({
  user,
  items,
  consumed,
}: {
  user: string;
  items: Polozka[];
  consumed: { id: string; nazov: string; typ: Polozka["typ"] }[];
}) {
  // Predvolene vyberieme prvu polozku, ktoru pouzivatel uz konzumoval
  // (cross-domain ma zmysel iba pre uz konzumovane polozky).
  const consumedItems = useMemo(
    () => items.filter((i) => consumed.some((c) => c.id === i.id)),
    [items, consumed],
  );
  const [source, setSource] = useState<string>(consumedItems[0]?.id ?? "");

  const effectiveSource = consumedItems.some((c) => c.id === source)
    ? source
    : (consumedItems[0]?.id ?? "");

  const { data, loading } = useApi<{ odporucania: CrossDomainItem[] }>(
    effectiveSource ? "/api/cross-domain" : null,
    { user, item: effectiveSource },
  );

  const odp = data?.odporucania ?? [];
  const zdroj = items.find((i) => i.id === effectiveSource);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <ItemSelect
          items={consumedItems}
          value={effectiveSource}
          onChange={setSource}
          label="Páčilo sa mi:"
        />
        {zdroj && (
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-faint">
            <Shuffle className="h-4 w-4 text-primary" /> hľadám naprieč ostatnými doménami
          </span>
        )}
      </div>

      {loading && <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />}
      {!loading && odp.length === 0 && (
        <p className="text-sm text-ink-faint">
          Pre túto položku systém nenašiel cross-domain odporúčania.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {odp.slice(0, 12).map((c) => (
          <Card key={c.polozka.id} className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <TypIcon typ={c.polozka.typ} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{c.polozka.nazov}</p>
                <p className="text-xs text-ink-faint">{c.polozka.rok}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.dovody.map((d, i) => (
                <span
                  key={i}
                  className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground"
                >
                  {dovodVeta(d)}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
