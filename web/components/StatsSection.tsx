"use client";

import { Film, BookOpen, Gamepad2, Tv } from "lucide-react";
import type { Statistika } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Card } from "./ui";

export function StatsSection({ user }: { user: string }) {
  const { data, loading } = useApi<Statistika>("/api/stats", { user });

  if (loading) return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />;
  if (!data) return null;

  const cells = [
    { label: "Filmy", value: data.filmy, icon: Film, color: "text-sky-600 bg-sky-50" },
    { label: "Knihy", value: data.knihy, icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
    { label: "Hry", value: data.hry, icon: Gamepad2, color: "text-violet-600 bg-violet-50" },
    { label: "Seriály", value: data.serialy, icon: Tv, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col justify-center p-5">
        <span className="text-4xl font-bold tabular-nums text-primary">{data.spolu}</span>
        <span className="mt-1 text-sm text-ink-faint">odporúčaní spolu</span>
      </Card>
      {cells.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="flex items-center gap-4 p-5">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <span className="block text-2xl font-bold tabular-nums text-ink">{c.value}</span>
              <span className="text-sm text-ink-faint">{c.label}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
