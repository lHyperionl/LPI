import { Sparkles, Film, BookOpen, Gamepad2, Tv, AlertTriangle } from "lucide-react";
import { prologApi } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";

// Vzdy dynamicky render - data citame zo ziveho Prolog backendu.
export const dynamic = "force-dynamic";

export default async function Home() {
  // Nacitaj pociatocne data server-side. Ak backend nebezi, ukaz hlasku.
  let users = null;
  let items = null;
  let chyba: string | null = null;

  try {
    const [u, i] = await Promise.all([prologApi.users(), prologApi.items()]);
    users = u.pouzivatelia;
    items = i.polozky;
  } catch (e) {
    chyba = String(e);
  }

  return (
    <main id="top">
      <Nav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Poháňané reálnym SWI-Prolog enginom
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
              Vysvetliteľný odporúčací systém{" "}
              <span className="text-accent">v Prologu</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-faint">
              Filmy, knihy, videohry a seriály prepojené jednou znalostnou bázou. Každé odporúčanie
              vie systém transparentne <strong className="text-ink-soft">vysvetliť</strong> — pretože
              za ním stoja logické pravidlá, nie čierna skrinka.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#odporucania"
                className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-soft"
              >
                Vyskúšaj playground
              </a>
              <a
                href="#graf"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink-soft transition hover:border-slate-400"
              >
                Pozri graf vzťahov
              </a>
            </div>

            {/* Statisticke cisla znalostnej bazy */}
            <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              <HeroStat icon={<Film className="h-4 w-4" />} n={15} label="filmov" />
              <HeroStat icon={<BookOpen className="h-4 w-4" />} n={15} label="kníh" />
              <HeroStat icon={<Gamepad2 className="h-4 w-4" />} n={15} label="hier" />
              <HeroStat icon={<Tv className="h-4 w-4" />} n={10} label="seriálov" />
            </div>
          </div>
        </div>
      </section>

      {/* PLAYGROUND alebo chybova hlaska */}
      {users && items ? (
        <Playground users={users} items={items} />
      ) : (
        <section className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-bold text-amber-900">Prolog backend je nedostupný</h2>
              <p className="mt-1 text-sm text-amber-800">
                Frontend beží, ale nepodarilo sa spojiť s SWI-Prolog API. Spusti celý stack príkazom{" "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
                  docker compose up
                </code>
                .
              </p>
              <p className="mt-2 break-all text-xs text-amber-700/80">{chyba}</p>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-ink-faint sm:flex-row">
            <p>
              Tímový projekt <strong className="text-ink-soft">LPI</strong> · TUKE — odporúčací
              systém v Prologu.
            </p>
            <p className="flex items-center gap-1.5">
              Beží na <span className="font-semibold text-ink-soft">SWI-Prolog</span> +{" "}
              <span className="font-semibold text-ink-soft">Next.js</span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroStat({
  icon,
  n,
  label,
}: {
  icon: React.ReactNode;
  n: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur">
      <div className="mb-1 flex items-center justify-center gap-1.5 text-accent">{icon}</div>
      <div className="text-2xl font-bold tabular-nums text-ink">{n}</div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}
