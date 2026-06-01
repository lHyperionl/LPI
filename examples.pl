% =============================================================
% examples.pl  -  Demonstracne priklady k odporucaciemu systemu
%                 (filmy + knihy + videohry)
% =============================================================
%
% Spustenie vsetkych prikladov naraz (z prikazoveho riadku):
%
%     swipl -q -g run_all -t halt examples.pl
%
% Alebo interaktivne v SWI-Prolog:
%
%     ?- consult('examples.pl').
%     ?- run_all.
%     ?- priklad1.
%     ?- priklad2.
%     ?- ...
%
% =============================================================

:- consult('program.pl').


% --- Pomocny vypis nadpisu prikladu --------------------------
nadpis(T) :-
    nl,
    format("==============================================~n", []),
    format(" ~w~n", [T]),
    format("==============================================~n", []).


% =============================================================
% PRIKLAD 1 - Zakladne odporucanie
%   "Ake polozky mozeme odporucit Janovi napriec vsetkymi typmi?"
%
% Ukazuje: hlavne pravidlo odporucam/2, generalizovane pre
%          filmy / knihy / hry / serialy, backtracking + forall.
% =============================================================
priklad1 :-
    nadpis('PRIKLAD 1: Vsetky odporucenia pre Jana'),
    forall( odporucam(jan, P),
            ( polozka(P, T, Nazov, Rok),
              format("  -> [~w] ~w (~w)~n", [T, Nazov, Rok]) )
          ).


% =============================================================
% PRIKLAD 2 - Top odporucania zoradene podla skore
%   "Zorad odporucania pre Annu od najlepsieho po najhorsi."
%
% Ukazuje: skore_odporucania/3 s bonusmi (zaner +2, tvorca +3,
%          krajina +1, studio +1), top_odporucania/2.
% =============================================================
priklad2 :-
    nadpis('PRIKLAD 2: Top odporucania pre Annu (zostupne podla skore)'),
    top_odporucania(anna, Top),
    forall( member(Skore-P, Top),
            ( polozka(P, T, Nazov, _),
              format("  [~w bodov]  [~w] ~w~n", [Skore, T, Nazov]) )
          ).


% =============================================================
% PRIKLAD 3 - Vysvetlenie konkretneho odporucania
%   "Preco je 'interstellar' odporuceny Janovi?"
%
% Ukazuje: dovody_odporucania/3, vysvetli/2 - transparentnost
%          a vysvetlitelnost
%          (silna stranka logickeho programovania).
% =============================================================
priklad3 :-
    nadpis('PRIKLAD 3: Vysvetlenie odporucania (jan, interstellar)'),
    ( vysvetli(jan, interstellar)
        -> true
        ;  format("  Interstellar nie je odporuceny pre Jana.~n", [])
    ),
    dovody_odporucania(jan, interstellar, Dovody),
    format("  Ciste dovody ako Prolog termy: ~w~n", [Dovody]).


% =============================================================
% PRIKLAD 4 - Collaborative filtering
%   "Co konzumovali pouzivatelia podobni Petrovi?"
%
% Ukazuje: podobnost_pouzivatelov/4, podobni_pouzivatelia/2,
%          odporucam_collaborative/2.
% =============================================================
priklad4 :-
    nadpis('PRIKLAD 4: Collaborative filtering pre Petra'),
    format("  Podobni pouzivatelia so skore podobnosti:~n", []),
    forall( ( podobni_pouzivatelia(peter, U),
              podobnost_pouzivatelov(peter, U, Skore, Dovody) ),
            ( pouzivatel(U, Meno),
              format("    - ~w: skore ~w, dovody ~w~n",
                     [Meno, Skore, Dovody]) )
          ),
    nl,
    format("  Odporucania od podobnych pouzivatelov:~n", []),
    ( setof(P, odporucam_collaborative(peter, P), Polozky)
        -> forall( member(P, Polozky),
                   ( polozka(P, T, Nazov, _),
                     format("  -> [~w] ~w  (videli/citali/hrali podobni)~n",
                            [T, Nazov]) ) )
        ;  format("  Ziadne odporucania od podobnych pouzivatelov.~n", [])
    ).


% =============================================================
% PRIKLAD 5 - Statistika a kategorizacia
%   "Kolko polozak vieme odporucit kazdemu pouzivatelovi,
%    rozpisane po typoch?"
%
% Ukazuje: pocet_odporucani/2, pocet_odporucani_typu/3,
%          kategoria_odporucania/3.
% =============================================================
priklad5 :-
    nadpis('PRIKLAD 5: Statistika odporucani'),
    forall( pouzivatel(P, Meno),
            ( pocet_odporucani(P, N),
              pocet_odporucani_typu(P, film,  Nf),
              pocet_odporucani_typu(P, kniha, Nk),
              pocet_odporucani_typu(P, hra,   Nh),
              pocet_odporucani_typu(P, serial, Ns),
              format("  ~w: spolu ~w (filmy=~w, knihy=~w, hry=~w, serialy=~w)~n",
                     [Meno, N, Nf, Nk, Nh, Ns]) )
          ),
    nl,
    format("  Kategorizacia top polozky pre kazdeho pouzivatela:~n", []),
    forall( pouzivatel(P, Meno),
            ( ( top_odporucania(P, [_-Top|_]),
                kategoria_odporucania(P, Top, K),
                polozka(Top, _, Nazov, _),
                format("    ~w  ->  ~w  [~w]~n", [Meno, Nazov, K])
              )
              ; format("    ~w  ->  ziadne odporucania~n", [Meno])
            )
          ).


% =============================================================
% PRIKLAD 6 - CROSS-DOMAIN ODPORUCANIE
%   "Petrovi sa pacil film Dune (2021).  Mozno sa mu bude
%    pacit aj kniha Dune alebo nejaka sci-fi/akcna hra."
%
% Ukazuje: cross_domain_odporucam/4 - presahy medzi domenami
%          (filmy <-> knihy <-> hry) cez zdielany zaner,
%          krajinu, studio, tvorcu.
% =============================================================
priklad6 :-
    nadpis('PRIKLAD 6: Cross-domain odporucanie (Peter videl Dune)'),
    ( setof(Ciel-Dovod,
            cross_domain_odporucam(peter, dune, Ciel, Dovod),
            Vysledky)
        -> forall( member(Ciel-Dovod, Vysledky),
                   ( polozka(Ciel, T, Nazov, _),
                     format("  -> [~w] ~w  (~w)~n",
                            [T, Nazov, Dovod]) ) )
        ;  format("  Ziadne cross-domain odporucania.~n", [])
    ).


% =============================================================
% PRIKLAD 7 - FILTER "KTO MA RAD X" (FANUSIKOVIA)
%   "Komu vsetkemu by sa pacila hra The Witcher 3?"
%
% Ukazuje: fanusikovia/2 a fanusikovia_s_dovodmi/2 - reverzny
%          dopyt nad pravidlom odporucam.  Najprv vypiseme
%          plochy zoznam, potom s konkretnymi dovodmi zhody.
% =============================================================
priklad7 :-
    nadpis('PRIKLAD 7: Komu by sa pacila hra The Witcher 3?'),
    fanusikovia(witcher3, Fanus),
    polozka(witcher3, _, Nazov, _),
    format("  Polozka: ~w~n", [Nazov]),
    format("  Fanusikovia:~n", []),
    forall( member(U, Fanus),
            ( pouzivatel(U, Meno),
              format("    - ~w (~w)~n", [Meno, U]) )
          ),
    nl,
    format("  Detail s dovodmi zhody:~n", []),
    fanusikovia_s_dovodmi(witcher3, Pary),
    forall( member(U-Dovody, Pary),
            ( pouzivatel(U, Meno),
              format("    - ~w :: ~w~n", [Meno, Dovody]) )
          ),
    nl,
    nadpis('PRIKLAD 7b: Komu by sa pacil film Parasite?'),
    polozka(parasite, _, ParNazov, _),
    format("  Polozka: ~w~n", [ParNazov]),
    fanusikovia(parasite, Fp),
    forall( member(U, Fp),
            ( pouzivatel(U, Meno),
              format("    - ~w~n", [Meno]) )
          ).


% =============================================================
% PRIKLAD 8 - ROBUSTNE CESTOVANIE PO GRAFE VZTAHOV
%   "Z filmu Dune (2021) sa pohnut po grafe pribuzných diel."
%
% Ukazuje: pribuzne_polozky/3, top_pribuzne/2, retazec/4.
%          Polozky tvoria graf cez zdielane atributy:
%          zaner, krajina, studio, tvorca.
% =============================================================
priklad8 :-
    nadpis('PRIKLAD 8: Robustne cestovanie - graf pribuznosti'),
    polozka(dune, _, ZNazov, _),
    format("  Vychodisko: ~w~n", [ZNazov]),
    nl,
    format("  -- Top 5 pribuznych polozak --~n", []),
    top_pribuzne(dune, Top),
    forall( ( nth1(I, Top, Sila-X), I =< 5 ),
            ( polozka(X, T, N, _),
              format("    ~w. [~w] ~w (sila ~w)~n", [I, T, N, Sila]) )
          ),
    nl,
    format("  -- Cesta z 'dune' (film) do 'witcher3' (hra), max 3 kroky --~n", []),
    ( retazec(dune, witcher3, 3, Cesta)
        -> vypis_cestu(Cesta)
        ;  format("    Cesta nenajdena.~n", [])
    ),
    nl,
    format("  -- Cesta z 'amelie' (film) do 'dark_souls' (hra), max 4 kroky --~n", []),
    ( retazec(amelie, dark_souls, 4, Cesta2)
        -> vypis_cestu(Cesta2)
        ;  format("    Cesta nenajdena (mozno potrebuje viac krokov).~n", [])
    ).

% Pomocny predikat na vypis cesty.
vypis_cestu([]) :- !.
vypis_cestu([X]) :-
    polozka(X, T, N, _),
    format("    [~w] ~w~n", [T, N]).
vypis_cestu([X|Rest]) :-
    polozka(X, T, N, _),
    format("    [~w] ~w  -->~n", [T, N]),
    vypis_cestu(Rest).


% =============================================================
% PRIKLAD 9 - ADAPTACIE, UNIVERZA, HYBRIDNE SKORE
%   (a) zoznam adaptacii a spolocnych univerz
%   (b) cross-domain s novymi dovodmi (adaptacia/univerzum)
%   (c) top hybridne skore pre Mariu (kombinuje content +
%       collaborative + adaptacia + univerzum bonus)
%
% Ukazuje: adaptacia/2, univerzum/2, rozsirene cross_dovod/3,
%          hybridne_skore/3, top_hybridne/2.
% =============================================================
priklad9 :-
    nadpis('PRIKLAD 9: Adaptacie, univerza, hybridne skore'),
    %% (a)
    format("  -- Adaptacie v znalostnej baze --~n", []),
    forall( adaptacia(A, B),
            ( polozka(A, TA, NA, _), polozka(B, TB, NB, _),
              format("    [~w] ~w  <-  [~w] ~w~n",
                     [TA, NA, TB, NB]) )
          ),
    nl,
    format("  -- Spolocne univerzá (zoradene podla nazvu) --~n", []),
    findall(U-X, univerzum(X, U), Pary),
    sort(Pary, Setrenne),
    forall( member(U-X, Setrenne),
            ( polozka(X, T, N, _),
              format("    ~w  ::  [~w] ~w~n", [U, T, N]) )
          ),
    nl,
    %% (b)
    format("  -- Cross-domain odporucania pre Mariu (zdroj witcher3) --~n", []),
    format("  Iba dovody adaptacia / spolocne_univerzum:~n", []),
    forall( ( cross_domain_odporucam(maria, witcher3, C, D),
              ( D = adaptacia ; D = spolocne_univerzum(_) ) ),
            ( polozka(C, T, N, _),
              format("    -> [~w] ~w  (~w)~n", [T, N, D]) )
          ),
    nl,
    %% (c)
    format("  -- Top 5 hybridnych odporucani pre Mariu --~n", []),
    format("  (content + collab +3 + adaptacia +2 + univerzum +2)~n", []),
    top_hybridne(maria, Top),
    forall( ( nth1(I, Top, S-X), I =< 5 ),
            ( polozka(X, T, N, _),
              skore_odporucania(maria, X, C),
              format("    ~w. [~w] ~w  (content=~w, hybrid=~w)~n",
                     [I, T, N, C, S]) )
            ).


% =============================================================
% PRIKLAD 10 - CONSTRAINT ODPORUCANIE
%   "Vyber Janovi filmovy vecer do 300 minut s maximalnym skore."
%
% Ukazuje: filmovy_vecer/5, pouzitie CLP(FD) obmedzeni
%          a optimalizaciu cez labeling([max(...)]).
% =============================================================
priklad10 :-
    nadpis('PRIKLAD 10: Filmovy vecer do casoveho limitu'),
    Limit = 300,
    filmovy_vecer(jan, Limit, Vyber, Dlzka, Skore),
    format("  Pouzivatel: jan, limit: ~w minut~n", [Limit]),
    format("  Celkova dlzka: ~w minut, celkove skore: ~w~n", [Dlzka, Skore]),
    format("  Vybrane filmy:~n", []),
    forall( member(F, Vyber),
            ( polozka(F, _, Nazov, Rok),
              dlzka(F, D),
              skore_odporucania(jan, F, S),
              format("    - ~w (~w), ~w min, skore ~w~n",
                     [Nazov, Rok, D, S]) )
          ).


% =============================================================
% RUN_ALL  -  spusti vsetky priklady za sebou
% =============================================================
run_all :-
    priklad1,
    priklad2,
    priklad3,
    priklad4,
    priklad5,
    priklad6,
    priklad7,
    priklad8,
    priklad9,
    priklad10,
    nl,
    format("==============================================~n", []),
    format(" Vsetky priklady uspesne dobehli.~n", []),
    format("==============================================~n", []).
