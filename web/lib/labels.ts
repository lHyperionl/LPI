// =============================================================
// labels.ts  -  Humanizacia Prolog atomov na slovenske texty
// =============================================================
// Vsetky slovenske retazce na jednom mieste.  Prolog pracuje s
// atomami ako `sci_fi`, `juzna_korea`, `reziser`; tu ich mapujeme
// na citatelne popisky.

import type { Dovod, Typ } from "./types";

const ZANRE: Record<string, string> = {
  sci_fi: "Sci-Fi",
  thriller: "Thriller",
  akcia: "Akcia",
  drama: "Dráma",
  romansa: "Romanca",
  komedia: "Komédia",
  horor: "Horor",
  krimi: "Krimi",
  fantasy: "Fantasy",
  dobrodruzny: "Dobrodružný",
  rpg: "RPG",
  puzzle: "Puzzle",
};

const KRAJINY: Record<string, string> = {
  usa: "USA",
  francuzsko: "Francúzsko",
  juzna_korea: "Južná Kórea",
  novy_zeland: "Nový Zéland",
  japonsko: "Japonsko",
  uk: "Veľká Británia",
  rusko: "Rusko",
  polsko: "Poľsko",
  kanada: "Kanada",
  holandsko: "Holandsko",
  estonsko: "Estónsko",
};

const ROLY: Record<string, string> = {
  reziser: "Režisér",
  autor: "Autor",
  vyvojar: "Vývojár",
  showrunner: "Showrunner",
  tvorca: "Tvorca",
  autor_predlohy: "Autor predlohy",
};

const TYPY: Record<Typ, string> = {
  film: "Film",
  kniha: "Kniha",
  hra: "Hra",
  serial: "Seriál",
};

const TYPY_PLURAL: Record<string, string> = {
  film: "Filmy",
  kniha: "Knihy",
  hra: "Hry",
  serial: "Seriály",
};

// Genericka humanizacia: skus slovnik, inak nahrad podtrzitka medzerou
// a daj velke prve pismeno.
function pretty(value: string | number | undefined, dict?: Record<string, string>): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (dict && dict[s]) return dict[s];
  const replaced = s.replace(/_/g, " ");
  return replaced.charAt(0).toUpperCase() + replaced.slice(1);
}

export const labelZaner = (z: string) => pretty(z, ZANRE);
export const labelKrajina = (k: string) => pretty(k, KRAJINY);
export const labelRola = (r: string) => pretty(r, ROLY);
export const labelTyp = (t: Typ) => TYPY[t] ?? pretty(t);
export const labelTypPlural = (t: string) => TYPY_PLURAL[t] ?? pretty(t);
export const labelTvorca = (m: string) => pretty(m);
export const labelStudio = (s: string) => pretty(s);

export function rozmerLabel(druh: string): string {
  switch (druh) {
    case "dlzka":
      return "Dĺžka";
    case "strany":
      return "Počet strán";
    case "dlzka_hry":
      return "Dĺžka hry";
    case "epizody":
      return "Epizódy";
    default:
      return pretty(druh);
  }
}

// Hlavna funkcia: prevedie strukturovany "Dovod" na slovensku vetu.
export function dovodVeta(d: Dovod): string {
  switch (d.druh) {
    case "typ":
      return `Obľúbený typ obsahu: ${labelTyp(d.hodnota as Typ)}`;
    case "zaner":
      return `Obľúbený žáner: ${labelZaner(String(d.hodnota))}`;
    case "hodnotenie":
      return `Hodnotenie ${d.hodnota}/10 (minimum ${d.minimum})`;
    case "rozmer": {
      const j =
        d.typ === "film"
          ? "min"
          : d.typ === "kniha"
            ? "strán"
            : d.typ === "hra"
              ? "h"
              : "epizód";
      return `Rozmer: ${d.hodnota} ${j} (maximum ${d.maximum})`;
    }
    case "tvorca":
      return d.rola
        ? `Obľúbený ${labelRola(d.rola).toLowerCase()}: ${labelTvorca(String(d.meno))}`
        : `Obľúbený tvorca: ${labelTvorca(String(d.meno))}`;
    case "krajina":
      return `Obľúbená krajina: ${labelKrajina(String(d.hodnota))}`;
    case "studio":
      return `Obľúbené štúdio: ${labelStudio(String(d.hodnota))}`;
    case "podobny_pouzivatel":
      return `Konzumoval to podobný používateľ: ${pretty(d.hodnota)}`;
    case "adaptacia":
      return d.hodnota
        ? `Adaptácia / predloha už konzumovaného diela: ${pretty(d.hodnota)}`
        : "Adaptácia prepojeného diela";
    case "univerzum":
      return `Spoločné univerzum „${pretty(d.univerzum)}" s ${pretty(d.polozka)}`;
    // cross_dovod / zdielany atribut
    case "spolocny_zaner":
      return `Spoločný žáner: ${labelZaner(String(d.hodnota))}`;
    case "spolocny_tvorca":
      return `Spoločný tvorca: ${labelTvorca(String(d.hodnota))}`;
    case "spolocna_krajina":
      return `Spoločná krajina: ${labelKrajina(String(d.hodnota))}`;
    case "spolocne_studio":
      return `Spoločné štúdio: ${labelStudio(String(d.hodnota))}`;
    case "spolocne_univerzum":
      return `Spoločné univerzum: ${pretty(d.hodnota)}`;
    default:
      return pretty(d.druh);
  }
}

// Kategoria zhody ostava v slovencine uz z Prologu ("Vyborna zhoda"...).
// Pridame opravu diakritiky.
export function kategoriaLabel(k: string): string {
  const map: Record<string, string> = {
    "Vyborna zhoda": "Výborná zhoda",
    "Dobra zhoda": "Dobrá zhoda",
    "Slaba zhoda": "Slabá zhoda",
  };
  return map[k] ?? k;
}

export function kategoriaTon(k: string): "green" | "amber" | "slate" {
  if (k.startsWith("Vyborna")) return "green";
  if (k.startsWith("Dobra")) return "amber";
  return "slate";
}
