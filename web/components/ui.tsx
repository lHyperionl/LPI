// =============================================================
// ui.tsx  -  Zdielane male UI primitivy
// =============================================================
"use client";

import { Film, BookOpen, Gamepad2, Tv, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { Typ } from "@/lib/types";
import { kategoriaLabel, kategoriaTon, labelTyp } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

// --- Ikona + farba podla typu obsahu -------------------------
const TYP_META: Record<Typ, { icon: LucideIcon; color: string; bg: string }> = {
  film: { icon: Film, color: "text-sky-600", bg: "bg-sky-50" },
  kniha: { icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  hra: { icon: Gamepad2, color: "text-violet-600", bg: "bg-violet-50" },
  serial: { icon: Tv, color: "text-amber-600", bg: "bg-amber-50" },
};

export function TypIcon({ typ, className = "" }: { typ: Typ; className?: string }) {
  const meta = TYP_META[typ] ?? TYP_META.film;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.color} ${className}`}
      title={labelTyp(typ)}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </span>
  );
}

export function typColor(typ: Typ): string {
  return (TYP_META[typ] ?? TYP_META.film).color;
}
export function typBg(typ: Typ): string {
  return (TYP_META[typ] ?? TYP_META.film).bg;
}

// --- Skore badge (pulses on mount when data arrives) ---------
export function ScoreBadge({ skore, suffix = "b" }: { skore: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold tabular-nums text-accent-foreground"
    >
      {skore} {suffix}
    </motion.span>
  );
}

// --- Kategoria zhody -----------------------------------------
export function MatchCategory({ kategoria }: { kategoria: string }) {
  const ton = kategoriaTon(kategoria);
  const cls =
    ton === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : ton === "amber"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${cls}`}>
      {kategoriaLabel(kategoria)}
    </span>
  );
}

// --- Pill (genericky stitok) ---------------------------------
export function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "accent";
}) {
  const cls =
    tone === "accent"
      ? "bg-accent text-accent-foreground ring-primary/15"
      : "bg-slate-50 text-ink-soft ring-slate-200";
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${cls}`}>
      {children}
    </span>
  );
}

// --- Nadpis sekcie -------------------------------------------
export function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-8 max-w-2xl border-l-2 border-primary/20 pl-4">
      <div className="mb-2">
        <Badge
          variant="outline"
          className="border-primary/30 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary"
        >
          {eyebrow}
        </Badge>
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      {desc ? <p className="mt-3 text-[15px] leading-relaxed text-ink-faint">{desc}</p> : null}
    </div>
  );
}

// --- Karta sekcie (obal) -------------------------------------
export function Card({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button";
}) {
  const Comp = as;
  return (
    <Comp
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-card ${className}`}
    >
      {children}
    </Comp>
  );
}
