"use client";

import type { Polozka } from "@/lib/types";
import { labelTyp } from "@/lib/labels";

// Jednoduchy nativny select polozky (zoskupeny podla typu).
export function ItemSelect({
  items,
  value,
  onChange,
  label,
}: {
  items: Polozka[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  const typy: Polozka["typ"][] = ["film", "kniha", "hra", "serial"];
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm outline-none ring-accent/30 transition focus:border-accent focus:ring-2"
      >
        {typy.map((t) => {
          const skupina = items.filter((i) => i.typ === t);
          if (skupina.length === 0) return null;
          return (
            <optgroup key={t} label={labelTyp(t)}>
              {skupina.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nazov} ({i.rok})
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </label>
  );
}
