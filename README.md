# Odporúčací systém filmov, seriálov, kníh a videohier v Prologu

> Tímový projekt — predmet **Logické programovanie a inferencia (LPI)**, TUKE
> Téma 9: _Program odporúčajúci filmy/knihy/technológie na základe definovaných pravidiel._

Implementácia **vysvetliteľného odporúčacieho systému** v jazyku **SWI-Prolog**.
Doména pokrýva štyri prepojené typy obsahu — **filmy, seriály, knihy a videohry** — modelované
cez unifikovaný dátový model `polozka/4`. Systém kombinuje **content-based filtering**
(žáner, hodnotenie, rozmer, krajina, štúdio, tvorca) so **collaborative filteringom**
(podobnosť používateľov), pridáva **cross-domain odporúčania** (z filmu → na knihu/hru/seriál),
**reverzný filter fanúšikov** (kto by mal rád konkrétnu položku) a **robustné cestovanie
po grafe vzťahov** medzi položkami.

---

## Štruktúra projektu

```
prolog_recommend_system/
├── README.md             <- tento súbor
├── report.pdf            <- elaborát (PDF — vyžaduje zadanie)
├── program.pl            <- hlavný Prolog program (znalostná báza + pravidlá)
├── examples.pl           <- 10 demonštračných príkladov
├── tests.pl              <- PlUnit regresné testy
└── src/
    ├── report.tex        <- LaTeX zdrojový kód elaborátu
    ├── bibliography.bib  <- BibTeX bibliografia
    └── report.pdf        <- kompilovaný výstup
```

---

## Inštalácia SWI-Prolog

### Linux (Debian / Ubuntu)

```bash
sudo apt install swi-prolog
```

### macOS

```bash
brew install swi-prolog
```

### Windows

Stiahni inštalátor zo stránky <https://www.swi-prolog.org/Download.html>.

---

## Spustenie

### 1. Spustiť všetkých 10 príkladov naraz (neinteraktívne)

```bash
swipl -q -g run_all -t halt examples.pl
```

### 1b. Spustiť automatické testy (PlUnit)

```bash
swipl -q -g run_tests -t halt tests.pl
```

### 2. Interaktívne dopyty

```bash
swipl program.pl
```

Príklady dopytov v `?-` prompt-e:

```prolog
%% Základné odporúčanie (filmy + seriály + knihy + hry naprieč doménami)
?- odporucam(jan, P).
?- odporucam(maria, P), polozka(P, T, N, _).

%% Top odporúčania zoradené podľa skóre
?- top_odporucania(anna, T).

%% Vysvetlenie konkrétneho odporúčania
?- vysvetli(jan, interstellar).
?- dovody_odporucania(jan, interstellar, Dovody).

%% Collaborative filtering
?- podobni_pouzivatelia(jan, P).
?- podobnost_pouzivatelov(peter, jan, Skore, Dovody).
?- odporucam_collaborative(peter, F).

%% Cross-domain odporúčanie (páči sa mi film → odporuč hru)
?- cross_domain_odporucam(peter, dune, Ciel, Dovod).

%% Filter "kto má rád X"
?- fanusikovia(witcher3, Pouzivatelia).
?- fanusikovia_s_dovodmi(parasite, Pary).

%% Robustné cestovanie po grafe vzťahov
?- pribuzne_polozky(dune, X, Sila), Sila >= 2.
?- top_pribuzne(witcher3, Top).
?- retazec(amelie, dark_souls, 4, Cesta).

%% Adaptácie, univerzá a hybridné skóre
?- adaptacia(X, Y).
?- univerzum(X, U).
?- hybridne_skore(maria, lotr, S).
?- top_hybridne(maria, T).

%% Constraint odporúčanie: filmový večer do 300 minút
?- filmovy_vecer(jan, 300, Vyber, Dlzka, Skore).

%% Štatistika
?- pocet_odporucani(peter, N).
?- pocet_odporucani_typu(maria, hra, N).
```

### 3. Spustenie jednotlivých príkladov

```bash
swipl examples.pl
?- priklad1.   % základné odporúčanie pre Jana
?- priklad2.   % top odporúčania zoradené podľa skóre (Anna)
?- priklad3.   % vysvetlenie odporúčania (Jan, Interstellar)
?- priklad4.   % collaborative filtering pre Petra
?- priklad5.   % štatistika a kategorizácia
?- priklad6.   % cross-domain odporúčanie (Peter videl Dune)
?- priklad7.   % filter fanúšikov (Witcher 3, Parasite)
?- priklad8.   % robustné cestovanie po grafe vzťahov
?- priklad9.   % adaptácie, univerzá, hybridné skóre
?- priklad10.  % filmový večer do časového limitu
?- halt.
```

---

## Stručný prehľad implementácie

### Znalostná báza

| Typ          | Počet | Atribúty                                                                 |
| ------------ | ----- | ------------------------------------------------------------------------ |
| **filmy**    | 15    | žáner, hodnotenie, dĺžka (min), krajina, štúdio, režisér                 |
| **knihy**    | 15    | žáner, hodnotenie, počet strán, krajina, vydavateľstvo, autor            |
| **videohry** | 15    | žáner, hodnotenie, dĺžka prejdenia (hod), krajina, herné štúdio, vývojár |
| **seriály**  | 10    | žáner, hodnotenie, počet epizód, krajina, platforma/štúdio, tvorca       |

**5 používateľov** s preferenciami naprieč doménami: obľúbené žánre, obľúbené typy
obsahu, obľúbení tvorcovia, obľúbené krajiny a štúdiá, minimálne hodnotenie,
maximálne rozmery (zvlášť pre filmy/knihy/hry/seriály), história konzumácie.

### Inferenčné pravidlá

| Predikát                                         | Význam                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `odporucam(P, Polozka)`                          | Hlavné pravidlo odporúčania naprieč všetkými typmi                   |
| `skore_odporucania(P, F, S)`                     | Skóre 0–17 (hodnotenie + zaner +2, tvorca +3, krajina +1, studio +1) |
| `top_odporucania(P, T)`                          | Zoradený zoznam podľa skóre zostupne                                 |
| `dovody_odporucania(P, F, D)`                    | Vráti čistý zoznam dôvodov odporúčania                               |
| `vysvetli(P, F)`                                 | Vypíše prečo bola položka odporúčaná                                 |
| `kategoria_odporucania(P, F, K)`                 | Vyborná / Dobrá / Slabá zhoda                                        |
| `podobnost_pouzivatelov(P1, P2, S)`              | Číselné skóre podobnosti preferencií                                 |
| `podobnost_pouzivatelov(P1, P2, S, D)`           | Skóre podobnosti aj s dôvodmi                                        |
| `podobni_pouzivatelia(P1, P2)`                   | Podobnosť pri skóre aspoň 4                                          |
| `odporucam_collaborative(P, F)`                  | Odporúčanie cez podobného používateľa, rešpektuje typ a rozmer       |
| **`cross_domain_odporucam(P, Z, C, D)`**         | **Cross-domain: páči sa mi Z → odporuč C s dôvodom D**               |
| **`fanusikovia(Polozka, Pouz)`**                 | **Komu by sa páčila daná položka?**                                  |
| **`fanusikovia_s_dovodmi(Polozka, Pary)`**       | **Detail s konkrétnymi dôvodmi zhody**                               |
| **`pribuzne_polozky(P1, P2, Sila)`**             | **Sila = počet zdieľaných atribútov**                                |
| **`top_pribuzne(P, Top)`**                       | **Top príbuzné položky zoradené podľa sily**                         |
| **`retazec(Od, Na, Max, Cesta)`**                | **Tranzitívna cesta v grafe vzťahov**                                |
| **`adaptacia(Z, C)`**                            | **Z je adaptácia diela C (napr. film podľa knihy)**                  |
| **`univerzum(Polozka, U)`**                      | **Príslušnosť k fiktívnemu svetu (Stredozemie, dune_universe, …)**   |
| **`hybridne_skore(P, F, S)`**                    | **Content-based skóre + collab/adaptácia/univerzum bonus**           |
| **`top_hybridne(P, Top)`**                       | **Zoradenie podľa hybridného skóre**                                 |
| **`filmovy_vecer(P, Max, Vyber, Dlzka, Skore)`** | **Constraint výber filmov do časového limitu**                       |
| `pocet_odporucani(P, N)`                         | Štatistika — koľko položiek odporúčame                               |
| `pocet_odporucani_typu(P, Typ, N)`               | Štatistika podľa typu                                                |

### Demonštračné príklady (`examples.pl`)

1. **`priklad1`** — základné odporúčanie pre Jana naprieč typmi obsahu
2. **`priklad2`** — top odporúčania pre Annu zoradené podľa rozšíreného skóre
3. **`priklad3`** — vysvetlenie odporúčania (Interstellar pre Jana)
4. **`priklad4`** — collaborative filtering pre Petra
5. **`priklad5`** — štatistika a kategorizácia (rozpis filmy/knihy/hry/seriály)
6. **`priklad6`** — cross-domain: Peter videl Dune → ktoré hry a seriály mu odporúčiť
7. **`priklad7`** — komu by sa páčila hra Witcher 3, komu film Parasite
8. **`priklad8`** — cestovanie po grafe vzťahov z filmu Dune
9. **`priklad9`** — adaptácie, spoločné univerzá a hybridné skóre pre Mariu
10. **`priklad10`** — filmový večer do časového limitu cez CLP(FD)

### Regresné testy (`tests.pl`)

Suite v `library(plunit)` s viacerými blokmi: **znalostna_baza** (počty,
úplnosť atribútov), **odporucanie** (Jan dostane film+knihu, Anna nedostane hry,
neopakovanie videného, validita skóre, monotónnosť top zoznamu, čisté dôvody),
**cross_domain** (adaptácia Dune, univerzum Witcher, type-disjointness),
**collaborative** (skóre podobnosti, rešpektovanie typu a rozmeru),
**graf** (symetria, acyklickosť), **hybridne_skore** (hybrid ≥ content,
universe bonus pre Mariu na LOTR) a **constraint_odporucanie** (filmový večer
do časového limitu).

---

## Ukážka výstupu

---

## Webová aplikácia (Next.js + SWI-Prolog)

Súčasťou projektu je moderná single-page webová aplikácia (interaktívny _playground_), ktorá predvádza schopnosti systému tým, že volá reálny SWI-Prolog engine. frontend je napísaný v **Next.js** a komunikuje s tenkým HTTP backendom v Prologu.

### Spustenie webovej aplikácie

Najjednoduchšia cesta je použiť Docker Compose, ktorý spustí oba kontajnery (frontend aj backend) naraz.

```bash
docker compose up --build
```

Následne otvor prehliadač na `http://localhost:3000`.

### Architektúra webu

1. **`backend/` (Prolog API)**:
    - Tenký obal `api.pl` nad `program.pl`.
    - Vystavuje niekoľko HTTP endpointov napr. `/api/recommend`, `/api/movie-night`.
    - Využíva štandardný `library(http/thread_httpd)` a beží na porte 4000.
2. **`web/` (Next.js)**:
    - Aplikácia v React/Next.js s Tailwind CSS.
    - Všetka logika zostala zachovaná v Prologu — frontend robí cez route handlery len proxy dopytov a vizualizáciu.
    - Zabraňuje duplicite kódu a dovoľuje použiť Prolog-špecifickejové funkcie ako je napr. CLP(FD).

_Poznámka pre nasadenie: Aplikácia sa na Vercel nehodí (Vercel nepodporuje Docker/perzistentné servery). Pre verejné nasadenie ju odporúčame hostovať na platforme podporujúcej Docker kontajnery (Render, Fly.io, Railway)._

```
==============================================
 PRIKLAD 6: Cross-domain odporucanie (Peter videl Dune)
==============================================
 -> [serial] Arcane              (spolocna_krajina(usa))
 -> [serial] Arcane              (spolocny_zaner(akcia))
 -> [hra] BioShock               (spolocna_krajina(usa))
 -> [hra] BioShock               (spolocny_zaner(akcia))
 -> [hra] BioShock               (spolocny_zaner(sci_fi))
 -> [serial] Black Mirror        (spolocny_zaner(sci_fi))
 -> [serial] Breaking Bad        (spolocna_krajina(usa))
 -> [serial] Chernobyl           (spolocna_krajina(usa))
 -> [hra] Cyberpunk 2077         (spolocny_zaner(sci_fi))
 -> [serial] Game of Thrones     (spolocna_krajina(usa))
 -> [hra] Half-Life 2            (spolocna_krajina(usa))
 -> [hra] Half-Life 2            (spolocny_zaner(akcia))
 -> [hra] Half-Life 2            (spolocny_zaner(sci_fi))
 -> [hra] Horizon Zero Dawn      (spolocny_zaner(akcia))
 -> [hra] Horizon Zero Dawn      (spolocny_zaner(sci_fi))
 -> [hra] The Last of Us         (spolocna_krajina(usa))
 -> [hra] The Last of Us         (spolocny_zaner(akcia))
 -> [serial] The Mandalorian     (spolocna_krajina(usa))
 -> [serial] The Mandalorian     (spolocny_zaner(akcia))
 -> [serial] The Mandalorian     (spolocny_zaner(sci_fi))
 -> [hra] Mass Effect            (spolocny_zaner(sci_fi))
 -> [hra] Portal 2               (spolocna_krajina(usa))
 -> [hra] Portal 2               (spolocny_zaner(sci_fi))
 -> [hra] Red Dead Redemption 2  (spolocna_krajina(usa))
 -> [hra] Red Dead Redemption 2  (spolocny_zaner(akcia))
 -> [serial] The Expanse         (spolocna_krajina(usa))
 -> [serial] The Expanse         (spolocny_zaner(sci_fi))
 -> [serial] True Detective      (spolocna_krajina(usa))
 -> [serial] Westworld           (spolocna_krajina(usa))
 -> [serial] Westworld           (spolocny_zaner(sci_fi))

==============================================
 PRIKLAD 7: Komu by sa pacila hra The Witcher 3?
==============================================
  - Maria Toth :: [zaner(fantasy), zaner(rpg), tvorca(sapkowski),
                   krajina(polsko), studio(cd_projekt_red)]
  - Tomas Varga :: [zaner(akcia), zaner(rpg), krajina(polsko),
                    studio(cd_projekt_red)]

==============================================
 PRIKLAD 8: Cesta z 'amelie' (film) do 'dark_souls' (hra)
==============================================
    [film]  Amelie  -->
    [film]  Forrest Gump  -->
    [film]  Inception  -->
    [kniha] The Name of the Wind  -->
    [hra]   Dark Souls

==============================================
 PRIKLAD 10: Filmovy vecer do casoveho limitu
==============================================
 Celkova dlzka: 286 minut, celkove skore: 27
 - Interstellar (2014), 169 min, skore 15
 - Blade Runner (1982), 117 min, skore 12
```

---

## Kompilácia elaborátu (LaTeX)

```bash
cd src
pdflatex report.tex
bibtex report
pdflatex report.tex
pdflatex report.tex
```

Výstup: `src/report.pdf` (a kópia v koreni projektu).

---

## Tím

| Člen   | Zodpovednosť                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Člen 1 | Dátový model `polozka/4`, znalostná báza (55 položiek, 5 používateľov)                                                           |
| Člen 2 | Hlavné inferenčné pravidlo `odporucam/2`, polymorfný filter rozmerov                                                             |
| Člen 3 | Pokročilé pravidlá: skórovanie, top, vysvetlenie, collaborative, cross-domain, fanúšikovia, graf vzťahov, constraint odporúčanie |
| Člen 4 | Demonštračné príklady (10 scenárov) a testovanie                                                                                 |
| Člen 5 | Elaborát (LaTeX) a prezentácia                                                                                                   |

---

## Licencia a zdroje

- Materiály kurzu **LPI** (TUKE FEI KKUI) — <https://kurzy.kpi.fei.tuke.sk/lpi/>
- SWI-Prolog dokumentácia — <https://www.swi-prolog.org/pldoc/>
- L. Sterling, E. Shapiro: _The Art of Prolog_ (MIT Press, 1994)
- I. Bratko: _Prolog Programming for AI_ (Addison-Wesley, 2011)
