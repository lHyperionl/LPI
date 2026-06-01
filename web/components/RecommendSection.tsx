"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronRight } from "lucide-react";
import type { Odporucanie, Vysvetlenie } from "@/lib/types";
import { dovodVeta, labelZaner } from "@/lib/labels";
import { useApi } from "@/lib/useApi";
import { Card, TypIcon, ScoreBadge, MatchCategory, Pill } from "./ui";

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
            <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
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
                <span className="flex items-center gap-0.5 text-xs font-medium text-accent opacity-0 transition group-hover:opacity-100">
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

// --- Panel vysvetlenia (slide-in zprava) ---------------------
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
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Prečo odporúčame
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-ink-faint transition hover:bg-slate-100 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loading && <p className="text-sm text-ink-faint">Vyhodnocujem dopyt v Prologu…</p>}
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
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{dovodVeta(d)}</span>
                    </li>
                  ))}
                </ol>
              )}

              <p className="mt-8 rounded-xl bg-accent-wash px-4 py-3 text-xs leading-relaxed text-accent">
                Tieto dôvody pochádzajú priamo z predikátu{" "}
                <code className="font-mono">dovody_odporucania/3</code> v Prologu — žiadna logika
                nie je duplikovaná v JavaScripte.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}
