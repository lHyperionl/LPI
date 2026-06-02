"use client";

import { Star, Clapperboard, Globe2, Building2, History } from "lucide-react";
import type { Pouzivatel } from "@/lib/types";
import { labelZaner, labelKrajina, labelTvorca, labelTypPlural, labelStudio } from "@/lib/labels";
import { Card, Pill } from "./ui";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function userHue(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 42%)`;
}

export function UserSwitcher({
  users,
  selected,
  onSelect,
}: {
  users: Pouzivatel[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const profil = users.find((u) => u.id === selected);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Prepinac pouzivatelov */}
      <div className="flex flex-col gap-2">
        {users.map((u) => {
          const active = u.id === selected;
          const initials = u.meno
            .split(" ")
            .map((s) => s[0])
            .join("");
          return (
            <button
              key={u.id}
              onClick={() => onSelect(u.id)}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                active
                  ? "border-primary/30 bg-accent shadow-card"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback
                  className="text-sm font-semibold text-white"
                  style={{
                    backgroundColor: active
                      ? "hsl(var(--primary))"
                      : userHue(u.id),
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span>
                <span className="block text-sm font-semibold text-ink">{u.meno}</span>
                <span className="block text-xs text-ink-faint">
                  {u.oblubene_zanre.slice(0, 3).map(labelZaner).join(" · ")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Profil vybraneho pouzivatela */}
      {profil ? (
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-ink">{profil.meno}</h3>
              <p className="text-sm text-ink-faint">
                Minimálne hodnotenie:{" "}
                <span className="font-semibold text-ink-soft">
                  {profil.min_hodnotenie ?? "—"}/10
                </span>
              </p>
            </div>
            <Pill tone="accent">{profil.id}</Pill>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ProfilBlok icon={<Star className="h-4 w-4" />} titul="Obľúbené žánre">
              {profil.oblubene_zanre.map((z) => (
                <Pill key={z}>{labelZaner(z)}</Pill>
              ))}
            </ProfilBlok>

            <ProfilBlok icon={<Clapperboard className="h-4 w-4" />} titul="Konzumuje">
              {profil.oblubene_typy.map((t) => (
                <Pill key={t}>{labelTypPlural(t)}</Pill>
              ))}
            </ProfilBlok>

            {profil.oblubeni_tvorcovia.length > 0 && (
              <ProfilBlok icon={<Star className="h-4 w-4" />} titul="Obľúbení tvorcovia">
                {profil.oblubeni_tvorcovia.map((c) => (
                  <Pill key={c}>{labelTvorca(c)}</Pill>
                ))}
              </ProfilBlok>
            )}

            <ProfilBlok icon={<Globe2 className="h-4 w-4" />} titul="Obľúbené krajiny">
              {profil.oblubene_krajiny.map((k) => (
                <Pill key={k}>{labelKrajina(k)}</Pill>
              ))}
            </ProfilBlok>

            {profil.oblubene_studia.length > 0 && (
              <ProfilBlok icon={<Building2 className="h-4 w-4" />} titul="Obľúbené štúdiá">
                {profil.oblubene_studia.map((s) => (
                  <Pill key={s}>{labelStudio(s)}</Pill>
                ))}
              </ProfilBlok>
            )}

            <ProfilBlok icon={<History className="h-4 w-4" />} titul="Už konzumoval">
              {profil.uz_konzumoval.map((p) => (
                <Pill key={p.id}>{p.nazov}</Pill>
              ))}
            </ProfilBlok>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function ProfilBlok({
  icon,
  titul,
  children,
}: {
  icon: React.ReactNode;
  titul: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        <span className="text-primary">{icon}</span>
        {titul}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
