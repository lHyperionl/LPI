"use client";

import { useState } from "react";
import type { Pouzivatel, Polozka } from "@/lib/types";
import { SectionHeading } from "./ui";
import { Reveal } from "./Reveal";
import { UserSwitcher } from "./UserSwitcher";
import { RecommendSection } from "./RecommendSection";
import { HybridSection } from "./HybridSection";
import { CollaborativeSection } from "./CollaborativeSection";
import { CrossDomainSection } from "./CrossDomainSection";
import { FansSection } from "./FansSection";
import { RelationGraph } from "./RelationGraph";
import { MovieNightSection } from "./MovieNightSection";
import { StatsSection } from "./StatsSection";

export function Playground({
  users,
  items,
}: {
  users: Pouzivatel[];
  items: Polozka[];
}) {
  const [user, setUser] = useState<string>(users[0]?.id ?? "jan");
  const aktualny = users.find((u) => u.id === user);

  return (
    <>
      {/* 2 — Vyber pouzivatela */}
      <Section id="pouzivatel">
        <SectionHeading
          eyebrow="01 — Profil"
          title="Vyber si používateľa"
          desc="Každý používateľ má vlastné preferencie naprieč doménami. Výber riadi celý playground nižšie."
        />
        <UserSwitcher users={users} items={items} selected={user} onSelect={setUser} />
      </Section>

      {/* 3 — Odporucania */}
      <Section id="odporucania">
        <SectionHeading
          eyebrow="02 — Content-based"
          title="Odporúčania so skóre"
          desc="Zoradené podľa skóre (hodnotenie + bonusy za žáner, tvorcu, krajinu, štúdio). Klikni na kartu a uvidíš presné dôvody."
        />
        <RecommendSection user={user} />
      </Section>

      {/* 4 — Hybridne skore */}
      <Section id="hybrid">
        <SectionHeading
          eyebrow="03 — Hybridné skóre"
          title="Content + collaborative + univerzá"
          desc="Hybridné skóre pridáva bonusy: +3 ak položku konzumoval podobný používateľ, +2 za adaptáciu, +2 za spoločné univerzum."
        />
        <HybridSection user={user} />
      </Section>

      {/* 5 — Collaborative */}
      <Section id="collaborative">
        <SectionHeading
          eyebrow="04 — Collaborative filtering"
          title="Podobní používatelia"
          desc="Systém nájde používateľov s podobnými preferenciami a odporučí, čo už konzumovali oni."
        />
        <CollaborativeSection user={user} />
      </Section>

      {/* 6 — Cross-domain */}
      <Section id="cross-domain">
        <SectionHeading
          eyebrow="05 — Cross-domain"
          title="Z filmu na hru, knihu či seriál"
          desc="Most medzi doménami tvoria zdieľané atribúty — žáner, krajina, tvorca, štúdio, univerzum, adaptácia."
        />
        <CrossDomainSection
          user={user}
          items={items}
          consumed={aktualny?.uz_konzumoval ?? []}
        />
      </Section>

      {/* 7 — Fanusikovia */}
      <Section id="fanusikovia">
        <SectionHeading
          eyebrow="06 — Reverzný filter"
          title="Komu by sa páčila daná položka?"
          desc="Obrátený dopyt nad hlavným pravidlom — pre vybranú položku nájde všetkých potenciálnych fanúšikov s dôvodmi."
        />
        <FansSection items={items} />
      </Section>

      {/* 8 — Graf vztahov */}
      <Section id="graf">
        <SectionHeading
          eyebrow="07 — Graf vzťahov"
          title="Sieť príbuzných diel"
          desc="Položky tvoria graf prepojený cez zdieľané atribúty. Sila hrany = počet spoločných atribútov."
        />
        <RelationGraph items={items} />
      </Section>

      {/* 9 — Filmovy vecer (CLP(FD)) */}
      <Section id="filmovy-vecer">
        <SectionHeading
          eyebrow="08 — Constraint solving"
          title="Filmový večer do limitu"
          desc="CLP(FD) vyberie filmy tak, aby sa zmestili do časového limitu a maximalizovali celkové skóre."
        />
        <MovieNightSection user={user} />
      </Section>

      {/* 10 — Statistiky */}
      <Section id="statistiky">
        <SectionHeading
          eyebrow="09 — Štatistiky"
          title="Prehľad odporúčaní"
          desc="Koľko položiek vieme odporučiť aktuálnemu používateľovi, rozpísané po typoch obsahu."
        />
        <StatsSection user={user} />
      </Section>
    </>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-slate-100 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>{children}</Reveal>
      </div>
    </section>
  );
}
