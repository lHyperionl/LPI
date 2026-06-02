// =============================================================
// types.ts  -  TS typy zodpovedajuce JSON odpovediam z Prolog API
// =============================================================

export type Typ = "film" | "kniha" | "hra" | "serial";

export interface Rozmer {
  druh: "dlzka" | "strany" | "dlzka_hry" | "epizody";
  hodnota: number;
  jednotka: string;
}

export interface Tvorca {
  rola: string;
  meno: string;
}

export interface Polozka {
  id: string;
  typ: Typ;
  nazov: string;
  rok: number;
  hodnotenie: number | null;
  zanre: string[];
  krajina: string | null;
  studio: string | null;
  tvorcovia: Tvorca[];
  rozmer: Rozmer | null;
}

export interface Pouzivatel {
  id: string;
  meno: string;
  oblubene_zanre: string[];
  oblubene_typy: string[];
  oblubeni_tvorcovia: string[];
  oblubene_krajiny: string[];
  oblubene_studia: string[];
  min_hodnotenie: number | null;
  uz_konzumoval: { id: string; nazov: string; typ: Typ }[];
}

// Strukturovany "dovod" - vsetky varianty zo vsetkych zdrojov.
export interface Dovod {
  druh: string;
  hodnota?: string | number;
  minimum?: number;
  maximum?: number;
  typ?: string;
  rola?: string;
  meno?: string;
  univerzum?: string;
  polozka?: string;
  args?: unknown[];
}

export interface Odporucanie {
  polozka: Polozka;
  skore: number;
  kategoria: string;
}

export interface HybridOdporucanie {
  polozka: Polozka;
  hybrid: number;
  content: number;
  bonus: number;
}

export interface PodobnyPouzivatel {
  pouzivatel: { id: string; meno: string };
  skore: number;
  dovody: Dovod[];
}

export interface CrossDomainItem {
  polozka: Polozka;
  dovody: Dovod[];
}

export interface Fanusik {
  pouzivatel: { id: string; meno: string };
  dovody: Dovod[];
}

export interface PribuznaPolozka {
  polozka: Polozka;
  sila: number;
  atributy: Dovod[];
}

export interface MovieNightFilm {
  polozka: Polozka;
  dlzka: number;
  skore: number;
}

export interface Statistika {
  pouzivatel: string;
  meno: string;
  spolu: number;
  filmy: number;
  knihy: number;
  hry: number;
  serialy: number;
}

export interface VlastnyOdporucanie {
  polozka: Polozka;
  skore: number;
}

// Vysvetlenie odporucania (z /api/explain)
export interface Vysvetlenie {
  pouzivatel: string;
  polozka?: Polozka;
  polozka_id?: string;
  odporucane: boolean;
  existuje?: boolean;
  dovody: Dovod[];
}
