% =============================================================
% tests.pl  -  Automatizovane regresne testy (PlUnit)
% =============================================================
%
% Spustenie:
%
%     swipl -q -g run_tests -t halt tests.pl
%
% Alebo interaktivne:
%
%     ?- consult('tests.pl').
%     ?- run_tests.
%
% =============================================================

:- consult('program.pl').
:- use_module(library(plunit)).

test_zoradene_zostupne([]) :- !.
test_zoradene_zostupne([_]) :- !.
test_zoradene_zostupne([A-_, B-X | Rest]) :-
    A >= B,
    test_zoradene_zostupne([B-X | Rest]).


% --- Test suite: ZNALOSTNA BAZA ------------------------------
:- begin_tests(znalostna_baza).

test(pocet_filmov) :-
    aggregate_all(count, polozka(_, film, _, _), N),
    assertion(N == 15).

test(pocet_knih) :-
    aggregate_all(count, polozka(_, kniha, _, _), N),
    assertion(N == 15).

test(pocet_hier) :-
    aggregate_all(count, polozka(_, hra, _, _), N),
    assertion(N == 15).

test(pocet_serialov) :-
    aggregate_all(count, polozka(_, serial, _, _), N),
    assertion(N == 10).

test(pocet_pouzivatelov) :-
    aggregate_all(count, pouzivatel(_, _), N),
    assertion(N == 5).

test(polozky_maju_unikatne_id) :-
    findall(Id, polozka(Id, _, _, _), Ids),
    sort(Ids, Unikatne),
    length(Ids, Pocet),
    length(Unikatne, PocetUnikatnych),
    assertion(Pocet == PocetUnikatnych).

test(kazdy_film_ma_dlzku) :-
    forall( polozka(F, film, _, _),
            ( dlzka(F, _) ) ).

test(kazda_kniha_ma_strany) :-
    forall( polozka(K, kniha, _, _),
            ( strany(K, _) ) ).

test(kazda_hra_ma_dlzku_hry) :-
    forall( polozka(H, hra, _, _),
            ( dlzka_hry(H, _) ) ).

test(kazdy_serial_ma_epizody) :-
    forall( polozka(S, serial, _, _),
            ( epizody(S, _) ) ).

test(kazda_polozka_ma_hodnotenie) :-
    forall( polozka(X, _, _, _),
            ( hodnotenie(X, _) ) ).

test(kazda_polozka_ma_krajinu) :-
    forall( polozka(X, _, _, _),
            ( krajina(X, _) ) ).

test(kazda_polozka_ma_studio) :-
    forall( polozka(X, _, _, _),
            ( studio(X, _) ) ).

test(kazda_polozka_ma_zaner) :-
    forall( polozka(X, _, _, _),
            once(zaner(X, _)) ).

test(kazda_polozka_ma_tvorcu) :-
    forall( polozka(X, _, _, _),
            once(tvorca(X, _, _)) ).

test(hodnotenia_su_v_rozsahu) :-
    forall( hodnotenie(_, H),
            ( integer(H), H >= 1, H =< 10 ) ).

test(rozmery_su_kladne) :-
    forall( dlzka(_, D),      ( integer(D), D > 0 ) ),
    forall( strany(_, S),     ( integer(S), S > 0 ) ),
    forall( dlzka_hry(_, H),  ( integer(H), H > 0 ) ),
    forall( epizody(_, E),    ( integer(E), E > 0 ) ).

test(nove_knihy_su_v_baze) :-
    forall( member(K, [hyperion, neuromancer, martian, gone_girl, american_gods]),
            polozka(K, kniha, _, _) ).

test(nove_hry_su_v_baze) :-
    forall( member(H, [disco_elysium, last_of_us, bioshock, zelda_botw, stardew]),
            polozka(H, hra, _, _) ).

test(nove_serialy_su_v_baze) :-
    forall( member(S, [true_detective, westworld, arcane, mandalorian]),
            polozka(S, serial, _, _) ).

:- end_tests(znalostna_baza).


% --- Test suite: ODPORUCANIE --------------------------------
:- begin_tests(odporucanie).

%  Jan dostane aspon 1 film a 1 knihu.
test(jan_dostane_film) :-
    once( ( odporucam(jan, X), polozka(X, film, _, _) ) ).

test(jan_dostane_knihu) :-
    once( ( odporucam(jan, X), polozka(X, kniha, _, _) ) ).

test(jan_dostane_serial) :-
    once( ( odporucam(jan, X), polozka(X, serial, _, _) ) ).

%  Anna NEKONZUMUJE hry => ziadna hra v jej odporucaniach.
test(anna_nedostane_hru, [fail]) :-
    odporucam(anna, X), polozka(X, hra, _, _).

%  Nikdy nevratit polozku, ktoru pouzivatel uz konzumoval.
test(neopakuje_videne) :-
    \+ ( pouzivatel(P, _),
         odporucam(P, X),
         uz_konzumoval(P, X) ).

%  Skore je vzdy v rozsahu 1..17.
test(skore_v_rozsahu) :-
    forall( ( pouzivatel(P, _), odporucam(P, X),
              skore_odporucania(P, X, S) ),
            ( S >= 1, S =< 17 ) ).

%  Top_odporucania zoradzuje korektne zostupne (pre kazdeho pouz.).
test(top_je_zoradene) :-
    forall( pouzivatel(P, _),
            ( top_odporucania(P, Top),
              test_zoradene_zostupne(Top) ) ).

test(dovody_odporucania_su_ciste_data) :-
    once(dovody_odporucania(jan, interstellar, Dovody)),
    memberchk(typ(film), Dovody),
    memberchk(zaner(sci_fi), Dovody),
    memberchk(tvorca(reziser, nolan), Dovody).

test(dovody_serialu_obsahuju_epizody) :-
    once(dovody_odporucania(jan, chernobyl, Dovody)),
    memberchk(typ(serial), Dovody),
    memberchk(rozmer(serial, 5, maximum(70)), Dovody).

test(tomas_dostane_hru_z_novych_poloziek) :-
    once(odporucam(tomas, bioshock)).

test(peter_dostane_serial_z_novych_poloziek) :-
    once(odporucam(peter, mandalorian)).

:- end_tests(odporucanie).


% --- Test suite: CROSS DOMAIN -------------------------------
:- begin_tests(cross_domain).

%  Z filmu Dune sa cez 'adaptaciu' dostane na knihu Dune
%  (pre pouzivatela, ktory videl film Dune a chce knihy).
test(dune_film_kniha_adaptacia) :-
    once( cross_dovod(dune, dune_book, adaptacia) ).

%  Witcher3 (hra) a witcher_book (kniha) zdielaju univerzum.
test(witcher_zdielanie_univerza) :-
    once( cross_dovod(witcher3, witcher_book,
                      spolocne_univerzum(witcher_universe)) ).

%  Cross domain nikdy nevracia polozku rovnakeho typu.
test(cross_iba_medzi_domenami) :-
    \+ ( cross_domain_odporucam(_, Z, C, _),
         polozka(Z, T, _, _),
         polozka(C, T, _, _) ).

%  Cross domain rešpektuje 'pouzivatel chce typ ciela'.
test(cross_resp_oblubeny_typ) :-
    \+ ( cross_domain_odporucam(P, _, C, _),
         polozka(C, T, _, _),
         \+ oblubeny_typ(P, T) ).

test(cross_respektuje_rozmer) :-
    \+ ( cross_domain_odporucam(P, _, C, _),
         polozka(C, T, _, _),
         \+ vyhovuje_rozmeru(P, C, T) ).

test(dune_ma_cross_domain_serial) :-
    once(cross_domain_odporucam(peter, dune, mandalorian,
                                spolocny_zaner(sci_fi))).

:- end_tests(cross_domain).


% --- Test suite: COLLABORATIVE FILTERING ----------------------
:- begin_tests(collaborative).

test(podobnost_ma_ciselne_skore) :-
    once(podobnost_pouzivatelov(peter, jan, Skore, Dovody)),
    assertion(Skore >= 4),
    memberchk(zaner(sci_fi), Dovody).

test(collaborative_respektuje_oblubeny_typ) :-
    \+ ( odporucam_collaborative(P, X),
         polozka(X, T, _, _),
         \+ oblubeny_typ(P, T) ).

test(collaborative_respektuje_rozmer) :-
    \+ ( odporucam_collaborative(P, X),
         polozka(X, T, _, _),
         \+ vyhovuje_rozmeru(P, X, T) ).

test(collaborative_neopakuje_konzumovane) :-
    \+ ( odporucam_collaborative(P, X),
         uz_konzumoval(P, X) ).

test(collaborative_vrati_serial) :-
    once( ( odporucam_collaborative(peter, X),
            polozka(X, serial, _, _) ) ).

:- end_tests(collaborative).


% --- Test suite: FANUSIKOVIA ----------------------------------
:- begin_tests(fanusikovia).

test(witcher3_fanusikovia_obsahuju_mariu_tomasa) :-
    fanusikovia(witcher3, Fanusikovia),
    assertion(Fanusikovia == [maria, tomas]).

test(parasite_ma_aspon_troch_fanusikov) :-
    fanusikovia(parasite, Fanusikovia),
    length(Fanusikovia, Pocet),
    assertion(Pocet >= 3).

test(fanusikovia_s_dovodmi_nevracia_prazdne_dovody) :-
    fanusikovia_s_dovodmi(witcher3, Pary),
    forall(member(_-Dovody, Pary), assertion(Dovody \= [])).

:- end_tests(fanusikovia).


% --- Test suite: GRAF PRIBUZNOSTI ---------------------------
:- begin_tests(graf).

%  pribuzne_polozky je symetricke (P1-P2 <=> P2-P1).
test(symetria_pribuznosti) :-
    pribuzne_polozky(dune, dune_book, S1),
    pribuzne_polozky(dune_book, dune, S2),
    assertion(S1 == S2).

%  retazec nikdy nevracia cestu s opakovanou polozkou.
test(retazec_acyklicky) :-
    once( retazec(amelie, dark_souls, 4, Cesta) ),
    sort(Cesta, Set),
    length(Cesta, L1),
    length(Set,   L2),
    assertion(L1 == L2).

%  retazec(X, X, _, [X]) je vzdy uspesny (start == ciel).
test(retazec_self) :-
    once( retazec(dune, dune, 3, [dune]) ).

test(top_pribuzne_je_zoradene) :-
    once(top_pribuzne(dune, Top)),
    test_zoradene_zostupne(Top).

test(pribuzne_polozky_maju_kladnu_silu) :-
    forall( pribuzne_polozky(_, _, Sila),
            assertion(Sila > 0) ).

:- end_tests(graf).


% --- Test suite: HYBRIDNE SKORE -----------------------------
:- begin_tests(hybridne_skore).

%  hybridne_skore je vzdy >= content-based skore_odporucania.
test(hybrid_aspon_content) :-
    forall( ( pouzivatel(P, _), odporucam(P, X) ),
            ( skore_odporucania(P, X, C),
              hybridne_skore(P, X, H),
              H >= C ) ).

%  Maria, ktora citala hobbit (middle_earth), dostane bonus
%  +2 za univerzum na lotr (rovnake middle_earth).
test(maria_lotr_universe_bonus) :-
    skore_odporucania(maria, lotr, C),
    hybridne_skore(maria, lotr, H),
    Delta is H - C,
    assertion(Delta >= 2).

test(top_hybridne_je_zoradene) :-
    forall( pouzivatel(P, _),
            ( top_hybridne(P, Top),
              test_zoradene_zostupne(Top) ) ).

:- end_tests(hybridne_skore).


% --- Test suite: CONSTRAINT ODPORUCANIE -----------------------
:- begin_tests(constraint_odporucanie).

test(filmovy_vecer_respektuje_limit) :-
    once(filmovy_vecer(jan, 300, Vyber, Dlzka, Skore)),
    assertion(Vyber \= []),
    assertion(Dlzka =< 300),
    assertion(Skore > 0).

test(filmovy_vecer_vracia_filmy) :-
    once(filmovy_vecer(jan, 300, Vyber, _, _)),
    forall(member(X, Vyber), polozka(X, film, _, _)).

test(filmovy_vecer_ocakavany_vyber) :-
    once(filmovy_vecer(jan, 300, Vyber, Dlzka, Skore)),
    assertion(Vyber == [interstellar, blade_runner]),
    assertion(Dlzka == 286),
    assertion(Skore == 27).

test(filmovy_vecer_nevrati_prilis_dlhe_filmy) :-
    once(filmovy_vecer(jan, 250, Vyber, Dlzka, _)),
    assertion(Dlzka =< 250),
    forall(member(F, Vyber), dlzka(F, _)).

:- end_tests(constraint_odporucanie).


% =============================================================
%  KONIEC SUBORU tests.pl
% =============================================================
