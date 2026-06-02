import { Sparkles, AlertTriangle } from "lucide-react";
import { prologApi } from "@/lib/api";
import { Nav } from "@/components/Nav";
import { Playground } from "@/components/Playground";
import { HeroStatsGroup } from "@/components/HeroStats";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SmoothLink } from "@/components/SmoothLink";

// Vzdy dynamicky render - data citame zo ziveho Prolog backendu.
export const dynamic = "force-dynamic";

export default async function Home() {
    // Nacitaj pociatocne data server-side. Ak backend nebezi, ukaz hlasku.
    let users = null;
    let items = null;
    let chyba: string | null = null;

    try {
        const [u, i] = await Promise.all([
            prologApi.users(),
            prologApi.items(),
        ]);
        users = u.pouzivatelia;
        items = i.polozky;
    } catch (e) {
        chyba = String(e);
    }

    return (
        <main id="top">
            {/* Fixed aurora background — blobs scroll behind the whole page */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
                <div className="absolute -right-48 -top-48 h-[650px] w-[650px] rounded-full bg-teal-400/15 blur-[100px]" />
                <div className="absolute -bottom-40 -left-40 h-[550px] w-[550px] rounded-full bg-cyan-500/10 blur-[90px]" />
                <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/[0.06] blur-[80px]" />
            </div>

            <Nav />

            {/* HERO */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-grid-animated"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            SWI-Prolog engine
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
                            Odporúčací systém{" "}
                            <span className="text-primary">v Prologu</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-faint">
                            Filmy, knihy, videohry a seriály prepojené jednou
                            znalostnou bázou.
                        </p>
                        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                            <SmoothLink
                                href="#odporucania"
                                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90"
                            >
                                Vyskúšaj playground
                            </SmoothLink>
                            <SmoothLink
                                href="#graf"
                                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-ink-soft transition hover:border-slate-400"
                            >
                                Pozri graf vzťahov
                            </SmoothLink>
                        </div>

                        {/* Statisticke cisla znalostnej bazy — animated on viewport entry */}
                        <HeroStatsGroup />
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
                            <h2 className="font-bold text-amber-900">
                                Prolog backend je nedostupný
                            </h2>
                            <p className="mt-1 text-sm text-amber-800">
                                Frontend beží, ale nepodarilo sa spojiť s
                                SWI-Prolog API. Spusti celý stack príkazom{" "}
                                <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono">
                                    docker compose up
                                </code>
                                .
                            </p>
                            <p className="mt-2 break-all text-xs text-amber-700/80">
                                {chyba}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <footer className="relative border-t border-slate-100 py-12">
                <div
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/60 pointer-events-none"
                    aria-hidden
                />
                <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
                    <p className="mb-6 text-center text-sm text-ink-faint">
                        Tímový projekt{" "}
                        <strong className="text-ink-soft">LPI</strong> ·
                        TUKE — odporúčací systém v Prologu.
                    </p>
                    <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-ink-faint sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { meno: "Jozef Belušák", popis: "Hlavná logika odporúčania, štruktúra systému a prezentácia" },
                            { meno: "Ján Kapurík", popis: "Databáza položiek, žánre a atribúty obsahu" },
                            { meno: "Adam Peško", popis: "Používatelia, preferencie, limity a história konzumácie" },
                            { meno: "Robert Kardoš", popis: "Skórovanie, top odporúčania a hybridné skóre" },
                            { meno: "Branislav Zurian", popis: "Podobní používatelia, cross-domain odporúčanie a graf vzťahov" },
                            { meno: "Dávid Tkáč", popis: "Frontend, API napojenie, demo a testovanie" },
                        ].map(({ meno, popis }) => (
                            <li key={meno} className="flex gap-2">
                                <span className="font-semibold text-ink-soft whitespace-nowrap">{meno}</span>
                                <span className="text-ink-faint">– {popis}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </footer>

            <ScrollToTop />
        </main>
    );
}
