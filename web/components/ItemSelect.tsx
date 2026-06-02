"use client";

import type { Polozka } from "@/lib/types";
import { labelTyp } from "@/lib/labels";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="inline-flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[220px] font-medium">
          <SelectValue placeholder="Vyber položku..." />
        </SelectTrigger>
        <SelectContent>
          {typy.map((t) => {
            const skupina = items.filter((i) => i.typ === t);
            if (skupina.length === 0) return null;
            return (
              <SelectGroup key={t}>
                <SelectLabel>{labelTyp(t)}</SelectLabel>
                {skupina.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.nazov} ({i.rok})
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
