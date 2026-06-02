"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import type { Polozka, VlastnyOdporucanie } from "@/lib/types";
import { labelZaner, labelTypPlural, labelKrajina, labelStudio, labelTvorca } from "@/lib/labels";
import { Card, TypIcon, ScoreBadge, Pill } from "./ui";
import { Slider } from "@/components/ui/slider";

// ─── Constants ───────────────────────────────────────────────

const ALL_GENRES = [
  "sci_fi", "thriller", "akcia", "drama", "romansa", "komedia",
  "horor", "krimi", "fantasy", "dobrodruzny", "rpg", "puzzle",
];
const ALL_TYPES = ["film", "kniha", "hra", "serial"] as const;

// ─── Reusable toggle pill ────────────────────────────────────

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium ring-1 transition ${
        active
          ? "bg-primary text-white ring-primary/60"
          : "bg-slate-50 text-ink-soft ring-slate-200 hover:ring-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Searchable multi-select combobox ───────────────────────

interface Option { value: string; label: string }

function MultiCombobox({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: Option[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      options.filter(
        (o) =>
          !selected.includes(o.value) &&
          o.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, selected, query],
  );

  function add(value: string) {
    onChange([...selected, value]);
    setQuery("");
    inputRef.current?.focus();
  }

  function remove(value: string) {
    onChange(selected.filter((v) => v !== value));
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((v) => {
            const label = options.find((o) => o.value === v)?.label ?? v;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20"
              >
                {label}
                <button
                  onClick={() => remove(v)}
                  className="rounded-sm text-primary/60 hover:text-primary"
                  aria-label={`Odstrániť ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={selected.length === 0 ? placeholder : "Pridať ďalšie…"}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />

        {open && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {filtered.map((o) => (
              <button
                key={o.value}
                onMouseDown={(e) => { e.preventDefault(); add(o.value); }}
                className="flex w-full items-center px-3 py-2 text-left text-sm text-ink hover:bg-accent"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {open && query.length > 0 && filtered.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-ink-faint shadow-lg">
            Žiadne výsledky
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section label ───────────────────────────────────────────

function Label({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
      {text}
      {optional && (
        <span className="ml-1 font-normal normal-case text-ink-faint/60">(voliteľné)</span>
      )}
    </p>
  );
}

// ─── Score color ─────────────────────────────────────────────

function scoreColor(skore: number) {
  if (skore >= 13) return "border-l-emerald-400";
  if (skore >= 10) return "border-l-amber-400";
  return "border-l-slate-300";
}

// ─── Main component ──────────────────────────────────────────

export function CustomProfilePanel({ items }: { items: Polozka[] }) {
  const [genres, setGenres] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([...ALL_TYPES]);
  const [minRating, setMinRating] = useState(1);
  const [countries, setCountries] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);
  const [studios, setStudios] = useState<string[]>([]);
  const [consumed, setConsumed] = useState<string[]>([]);
  const [results, setResults] = useState<VlastnyOdporucanie[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive unique combobox options from items
  const countryOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return items
      .map((i) => i.krajina)
      .filter((k): k is string => !!k && !seen.has(k) && !!seen.add(k))
      .sort()
      .map((k) => ({ value: k, label: labelKrajina(k) }));
  }, [items]);

  const creatorOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return items
      .flatMap((i) => i.tvorcovia.map((t) => t.meno))
      .filter((m) => !seen.has(m) && !!seen.add(m))
      .sort()
      .map((m) => ({ value: m, label: labelTvorca(m) }));
  }, [items]);

  const studioOptions = useMemo<Option[]>(() => {
    const seen = new Set<string>();
    return items
      .map((i) => i.studio)
      .filter((s): s is string => !!s && !seen.has(s) && !!seen.add(s))
      .sort()
      .map((s) => ({ value: s, label: labelStudio(s) }));
  }, [items]);

  const consumedOptions = useMemo<Option[]>(() =>
    items.map((i) => ({ value: i.id, label: `${i.nazov} (${i.rok})` })),
    [items],
  );

  function toggleGenre(g: string) {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }
  function toggleType(t: string) {
    setTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  const canSubmit = genres.length > 0 && types.length > 0 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const params = new URLSearchParams({
        genres: genres.join(","),
        types: types.join(","),
        min_rating: String(minRating),
      });
      if (creators.length > 0) params.set("creators", creators.join(","));
      if (countries.length > 0) params.set("countries", countries.join(","));
      if (studios.length > 0) params.set("studios", studios.join(","));
      if (consumed.length > 0) params.set("consumed", consumed.join(","));

      const res = await fetch(`/api/custom-recommend?${params}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json.odporucania ?? []);
    } catch {
      setError("Nepodarilo sa načítať odporúčania. Skúste to znova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Required: genres */}
      <div>
        <Label text="Žánre *" />
        <div className="flex flex-wrap gap-1.5">
          {ALL_GENRES.map((g) => (
            <TogglePill
              key={g}
              label={labelZaner(g)}
              active={genres.includes(g)}
              onClick={() => toggleGenre(g)}
            />
          ))}
        </div>
      </div>

      {/* Required: types */}
      <div>
        <Label text="Typ obsahu *" />
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => (
            <TogglePill
              key={t}
              label={labelTypPlural(t)}
              active={types.includes(t)}
              onClick={() => toggleType(t)}
            />
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <Label text="Minimálne hodnotenie" />
          <span className="rounded-lg bg-accent px-2.5 py-0.5 text-sm font-bold tabular-nums text-accent-foreground">
            {minRating}/10
          </span>
        </div>
        <Slider min={1} max={10} step={1} value={[minRating]} onValueChange={([v]) => setMinRating(v)} />
        <div className="mt-1.5 flex justify-between text-xs text-ink-faint">
          <span>1</span><span>10</span>
        </div>
      </div>

      {/* Optional: countries */}
      <div>
        <Label text="Krajiny pôvodu" optional />
        <MultiCombobox
          options={countryOptions}
          selected={countries}
          onChange={setCountries}
          placeholder="Vyhľadaj krajinu…"
        />
      </div>

      {/* Optional: creators */}
      <div>
        <Label text="Obľúbení tvorcovia" optional />
        <MultiCombobox
          options={creatorOptions}
          selected={creators}
          onChange={setCreators}
          placeholder="Vyhľadaj tvorcu…"
        />
      </div>

      {/* Optional: studios */}
      <div>
        <Label text="Obľúbené štúdiá" optional />
        <MultiCombobox
          options={studioOptions}
          selected={studios}
          onChange={setStudios}
          placeholder="Vyhľadaj štúdio…"
        />
      </div>

      {/* Optional: consumed items */}
      <div>
        <Label text="Už videl / čítal / hral" optional />
        <p className="mb-2 text-xs text-ink-faint">Tieto položky budú vylúčené z odporúčaní.</p>
        <MultiCombobox
          options={consumedOptions}
          selected={consumed}
          onChange={setConsumed}
          placeholder="Vyhľadaj titul…"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        {loading ? "Hľadám…" : "Odporučiť"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Results */}
      {results !== null && (
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {results.length > 0 ? `Výsledky (${results.length})` : "Žiadne výsledky"}
          </p>
          {results.length === 0 ? (
            <p className="text-sm text-ink-faint">
              Skúste zmeniť žánre, typy alebo znížiť minimálne hodnotenie.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ polozka: p, skore }) => (
                <div
                  key={p.id}
                  className={`rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm border-l-4 ${scoreColor(skore)}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TypIcon typ={p.typ} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{p.nazov}</p>
                        <p className="text-xs text-ink-faint">{p.rok}</p>
                      </div>
                    </div>
                    <ScoreBadge skore={skore} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.zanre.map((z) => (
                      <Pill key={z} tone={genres.includes(z) ? "accent" : "slate"}>
                        {labelZaner(z)}
                      </Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
