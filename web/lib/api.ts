// =============================================================
// api.ts  -  Typovany klient na SWI-Prolog backend
// =============================================================
// Bezi IBA na serveri (route handlery / server komponenty).  Base URL
// je interna docker adresa (http://prolog-api:4000) z env premennej,
// takze prehliadac ju nikdy nevidi.

import type {
  Pouzivatel,
  Polozka,
  Odporucanie,
  HybridOdporucanie,
  PodobnyPouzivatel,
  CrossDomainItem,
  Fanusik,
  PribuznaPolozka,
  MovieNightFilm,
  Statistika,
  Vysvetlenie,
} from "./types";

const BASE = process.env.PROLOG_API_URL || "http://localhost:4000";

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(path, BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    // Vzdy cerstve - dopyt je lacny a chceme zive vysledky.
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Prolog API ${path} -> HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const prologApi = {
  health: () => get<{ status: string; engine: string }>("/api/health"),

  users: () => get<{ pouzivatelia: Pouzivatel[] }>("/api/users"),

  items: () => get<{ polozky: Polozka[] }>("/api/items"),

  recommend: (user: string) =>
    get<{ pouzivatel: string; odporucania: Odporucanie[] }>("/api/recommend", { user }),

  explain: (user: string, item: string) =>
    get<Vysvetlenie>("/api/explain", { user, item }),

  hybrid: (user: string) =>
    get<{ pouzivatel: string; odporucania: HybridOdporucanie[] }>("/api/hybrid", { user }),

  collaborative: (user: string) =>
    get<{ pouzivatel: string; podobni: PodobnyPouzivatel[]; odporucania: Polozka[] }>(
      "/api/collaborative",
      { user },
    ),

  crossDomain: (user: string, item: string) =>
    get<{ pouzivatel: string; zdroj: string; odporucania: CrossDomainItem[] }>(
      "/api/cross-domain",
      { user, item },
    ),

  fans: (item: string) =>
    get<{ polozka: Polozka; fanusikovia: Fanusik[] }>("/api/fans", { item }),

  related: (item: string) =>
    get<{ polozka: Polozka; pribuzne: PribuznaPolozka[] }>("/api/related", { item }),

  path: (from: string, to: string, max: number) =>
    get<{ od: string; do: string; max: number; najdena: boolean; cesta: Polozka[] }>(
      "/api/path",
      { from, to, max },
    ),

  movieNight: (user: string, limit: number) =>
    get<{
      pouzivatel: string;
      limit: number;
      najdene: boolean;
      celkova_dlzka?: number;
      celkove_skore?: number;
      filmy: MovieNightFilm[];
    }>("/api/movie-night", { user, limit }),

  stats: (user: string) => get<Statistika>("/api/stats", { user }),
};
