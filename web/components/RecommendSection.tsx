"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import type { Odporucanie, Vysvetlenie } from "@/lib/types";
import { dovodVeta, labelZaner, kategoriaTon } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon, ScoreBadge, MatchCategory, Pill } from "./ui";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

function categoryBorderClass(kategoria: string): string {
  const ton = kategoriaTon(kategoria);
  if (ton === "green") return "border-l-[3px] border-l-emerald-400";
  if (ton === "amber") return "border-l-[3px] border-l-amber-400";
  return "";
}

export function RecommendSection({ user }: { user: string }) {
  const { data, loading } = useApi<{ odporucania: Odporucanie[] }>("/api/recommend", { user });
  const [open, setOpen] = useState<string | null>(null);

  const odp = data?.odporucania ?? [];

  return (
    <>
      {loading && <SkeletonGrid />}
      {!loading && odp.length === 0 && (
        <p className="text-sm text-ink-faint">Žiadne odporúčania pre tohto používateľa.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {odp.map((o, i) => (
          <motion.button
            key={o.polozka.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
            onClick={() => setOpen(o.polozka.id)}
            className="group text-left"
          >
            <Card
              className={`flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.12),0_4px_12px_rgba(15,23,42,0.06),0_20px_48px_-16px_rgba(15,23,42,0.18)] ${categoryBorderClass(o.kategoria)}`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TypIcon typ={o.polozka.typ} />
                  <div>
                    <h4 className="font-semibold leading-tight text-ink">{o.polozka.nazov}</h4>
                    <p className="text-xs text-ink-faint">{o.polozka.rok}</p>
                  </div>
                </div>
                <ScoreBadge skore={o.skore} />
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {o.polozka.zanre.slice(0, 3).map((z) => (
                  <Pill key={z}>{labelZaner(z)}</Pill>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <MatchCategory kategoria={o.kategoria} />
                <span className="flex items-center gap-0.5 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                  Prečo? <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>

      <ExplanationPanel
        user={user}
        item={open}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

// --- Panel vysvetlenia (shadcn Sheet — focus trap + Escape + ARIA rola zadarmo) ---
function ExplanationPanel({
  user,
  item,
  onClose,
}: {
  user: string;
  item: string | null;
  onClose: () => void;
}) {
  const { data, loading } = useApi<Vysvetlenie>(item ? "/api/explain" : null, {
    user,
    item: item ?? "",
  });

  return (
    <Sheet open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-5 pr-14 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Prečo odporúčame</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          )}

          {data?.polozka && (
            <div className="mb-6 flex items-center gap-3">
              <TypIcon typ={data.polozka.typ} />
              <div>
                <h3 className="text-lg font-bold text-ink">{data.polozka.nazov}</h3>
                <p className="text-sm text-ink-faint">{data.polozka.rok}</p>
              </div>
            </div>
          )}

          {data && data.odporucane === false && (
            <p className="text-sm text-ink-faint">
              Táto položka pre daného používateľa nie je odporúčaná.
            </p>
          )}

          {data?.dovody && data.dovody.length > 0 && (
            <ol className="space-y-3">
              {data.dovody.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-soft">{dovodVeta(d)}</span>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-8 rounded-xl bg-accent px-4 py-3 text-xs leading-relaxed text-accent-foreground">
            Tieto dôvody pochádzajú priamo z predikátu{" "}
            <code className="font-mono">dovody_odporucania/3</code> v Prologu — žiadna logika
            nie je duplikovaná v JavaScripte.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
