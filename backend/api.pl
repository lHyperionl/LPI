% =============================================================
% api.pl  -  HTTP JSON API nad odporucacim systemom (program.pl)
% =============================================================
%
% Tenka HTTP vrstva, ktora vystavuje predikaty z program.pl ako
% JSON endpointy.  Logika sa NEDUPLIKUJE - kazdy handler iba pozbiera
% riesenia cez findall/setof a posle reply_json_dict.
%
% Spustenie (lokalne):
%     swipl api.pl
%   -> server pocuva na porte 4000 (alebo $PORT)
%
% V kontajneri ho spusti CMD ["swipl", "api.pl"] a thread_httpd
% drzi proces nazive.
% =============================================================

:- encoding(utf8).
:- set_prolog_flag(encoding, utf8).

:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/http_cors)).
:- use_module(library(http/http_server)).

% Znalostna baza + pravidla (NEZMENENE).
% Resolved relative to this file's directory so `swipl backend/api.pl`
% from the project root works alongside Docker (CWD = /app).
:- prolog_load_context(directory, Dir),
   directory_file_path(Dir, 'program.pl', ProgramPl),
   consult(ProgramPl).

% Povol CORS len pre explicitne zname originy.
% Pridaj dalsi origin sem ak potrebujes priamy pristup z browsera.
:- set_setting_default(http:cors, [
    'http://localhost:3000',
    'http://web:3000'
]).


% =============================================================
% REGISTRACIA ENDPOINTOV
% =============================================================
:- http_handler(root(api/health),       handle_health,       []).
:- http_handler(root(api/users),         handle_users,        []).
:- http_handler(root(api/items),         handle_items,        []).
:- http_handler(root(api/recommend),     handle_recommend,    []).
:- http_handler(root(api/explain),       handle_explain,      []).
:- http_handler(root(api/hybrid),        handle_hybrid,       []).
:- http_handler(root(api/collaborative), handle_collaborative,[]).
:- http_handler('/api/cross-domain',     handle_cross_domain, []).
:- http_handler(root(api/fans),          handle_fans,         []).
:- http_handler(root(api/related),       handle_related,      []).
:- http_handler(root(api/path),          handle_path,         []).
:- http_handler('/api/movie-night',      handle_movie_night,  []).
:- http_handler(root(api/stats),         handle_stats,        []).
:- http_handler('/api/custom-recommend', handle_custom_recommend, []).


% =============================================================
% SPUSTENIE SERVERA
% =============================================================
server(Port) :-
    http_server(http_dispatch, [port(Port)]).

start :-
    ( getenv('PORT', PortAtom)
    -> atom_number(PortAtom, Port)
    ;  Port = 4000
    ),
    server(Port),
    format(user_error, "Prolog API pocuva na porte ~w~n", [Port]).

% Pri spusteni `swipl api.pl` rovno nastartuj server a drz proces.
:- initialization(start_and_wait, main).

start_and_wait :-
    start,
    thread_get_message(_Never).


% =============================================================
% POMOCNE: jednotny JSON wrapper + CORS hlavicky
% =============================================================
reply(Request, Dict) :-
    cors_enable(Request,
                [ methods([get, options]) ]),
    reply_json_dict(Dict).

% Bezpecne nacitanie atomovej hodnoty parametra (zlyha ak chyba).
param_atom(Request, Name, Value) :-
    Spec =.. [Name, Raw, [optional(true)]],
    http_parameters(Request, [ Spec ]),
    nonvar(Raw),
    ( atom(Raw) -> Value = Raw ; atom_string(Value, Raw) ).

% Bezpecne nacitanie cisla (vrati Default ak chyba alebo nie je cislo).
param_number(Request, Name, Default, Value) :-
    Spec =.. [Name, Raw, [optional(true)]],
    ( catch(http_parameters(Request, [ Spec ]), _, fail),
      nonvar(Raw),
      ( number(Raw) -> N = Raw ; atom_number(Raw, N) )
    -> Value = N
    ;  Value = Default
    ).


% =============================================================
% PREVOD POLOZKY / POUZIVATELA NA DICT
% =============================================================

% polozka_dict(+Id, -Dict)
polozka_dict(Id, _{ id: Id, typ: Typ, nazov: Nazov, rok: Rok,
                    hodnotenie: H, zanre: Zanre, krajina: Kraj,
                    studio: Studio, tvorcovia: Tvorcovia,
                    rozmer: Rozmer }) :-
    polozka(Id, Typ, Nazov, Rok),
    ( hodnotenie(Id, H) -> true ; H = null ),
    findall(Z, zaner(Id, Z), Zanre),
    ( krajina(Id, Kraj) -> true ; Kraj = null ),
    ( studio(Id, Studio) -> true ; Studio = null ),
    findall(_{rola: R, meno: M}, tvorca(Id, R, M), Tvorcovia),
    polozka_rozmer(Id, Typ, Rozmer).

% Typovo specificky rozmer -> {druh, hodnota, jednotka}.
polozka_rozmer(Id, film, _{druh: dlzka, hodnota: D, jednotka: min}) :-
    dlzka(Id, D), !.
polozka_rozmer(Id, kniha, _{druh: strany, hodnota: S, jednotka: strany}) :-
    strany(Id, S), !.
polozka_rozmer(Id, hra, _{druh: dlzka_hry, hodnota: Hd, jednotka: hod}) :-
    dlzka_hry(Id, Hd), !.
polozka_rozmer(Id, serial, _{druh: epizody, hodnota: E, jednotka: epizody}) :-
    epizody(Id, E), !.
polozka_rozmer(_, _, null).

% pouzivatel_dict(+Id, -Dict)
pouzivatel_dict(Id, _{ id: Id, meno: Meno,
                       oblubene_zanre: Zanre,
                       oblubene_typy: Typy,
                       oblubeni_tvorcovia: Tvorcovia,
                       oblubene_krajiny: Krajiny,
                       oblubene_studia: Studia,
                       min_hodnotenie: Min,
                       uz_konzumoval: Konzumoval }) :-
    pouzivatel(Id, Meno),
    findall(Z, oblubeny_zaner(Id, Z), Zanre),
    findall(T, oblubeny_typ(Id, T), Typy),
    findall(C, oblubeny_tvorca(Id, C), Tvorcovia),
    findall(K, oblubena_krajina(Id, K), Krajiny),
    findall(S, oblubene_studio(Id, S), Studia),
    ( min_hodnotenie(Id, Min) -> true ; Min = null ),
    findall(_{id: Pid, nazov: Nazov, typ: Typ},
            ( uz_konzumoval(Id, Pid),
              polozka(Pid, Typ, Nazov, _) ),
            Konzumoval).


% =============================================================
% PREVOD "DOVODOV" (Prolog termy) NA STRUKTUROVANY JSON
% =============================================================
% Dovody z dovody_odporucania/3, cross_dovod/3 a dovod_zhody/3 maju
% rozne arity.  Zjednotime ich na {druh, ...}.

dovod_json(typ(T),                 _{druh: typ, hodnota: T}).
dovod_json(zaner(Z),               _{druh: zaner, hodnota: Z}).
dovod_json(hodnotenie(H, minimum(M)),
                                   _{druh: hodnotenie, hodnota: H, minimum: M}).
dovod_json(rozmer(Typ, V, maximum(M)),
                                   _{druh: rozmer, typ: Typ, hodnota: V, maximum: M}).
dovod_json(tvorca(Rola, Meno),     _{druh: tvorca, rola: Rola, meno: Meno}).
dovod_json(tvorca(Meno),           _{druh: tvorca, meno: Meno}).
dovod_json(krajina(K),             _{druh: krajina, hodnota: K}).
dovod_json(studio(S),              _{druh: studio, hodnota: S}).
dovod_json(podobny_pouzivatel(P),  _{druh: podobny_pouzivatel, hodnota: P}).
dovod_json(adaptacia(I),           _{druh: adaptacia, hodnota: I}).
dovod_json(adaptacia,              _{druh: adaptacia}).
dovod_json(univerzum(U, I),        _{druh: univerzum, univerzum: U, polozka: I}).
% cross_dovod/3 specificke
dovod_json(spolocny_zaner(Z),      _{druh: spolocny_zaner, hodnota: Z}).
dovod_json(spolocny_tvorca(M),     _{druh: spolocny_tvorca, hodnota: M}).
dovod_json(spolocna_krajina(K),    _{druh: spolocna_krajina, hodnota: K}).
dovod_json(spolocne_studio(S),     _{druh: spolocne_studio, hodnota: S}).
dovod_json(spolocne_univerzum(U),  _{druh: spolocne_univerzum, hodnota: U}).
% fallback: zachovaj funktor a argumenty
dovod_json(Term, _{druh: Funktor, args: Args}) :-
    compound(Term), !,
    Term =.. [Funktor | Args].
dovod_json(Atom, _{druh: Atom}) :-
    atom(Atom).

dovody_json(List, JsonList) :-
    maplist([D, J]>>(once(dovod_json(D, J))), List, JsonList).


% =============================================================
% HANDLERY
% =============================================================

% --- /api/health ---------------------------------------------
handle_health(Request) :-
    reply(Request, _{ status: ok, engine: "SWI-Prolog" }).


% --- /api/users ----------------------------------------------
handle_users(Request) :-
    findall(D, ( pouzivatel(Id, _), pouzivatel_dict(Id, D) ), Users),
    reply(Request, _{ pouzivatelia: Users }).


% --- /api/items ----------------------------------------------
handle_items(Request) :-
    findall(D, ( polozka(Id, _, _, _), polozka_dict(Id, D) ), Items),
    reply(Request, _{ polozky: Items }).


% --- /api/recommend?user=jan ---------------------------------
handle_recommend(Request) :-
    param_atom(Request, user, User),
    ( pouzivatel(User, _)
    -> top_odporucania(User, Zoradene),
       findall(_{ polozka: PD, skore: Skore, kategoria: Kat },
               ( member(Skore-Id, Zoradene),
                 polozka_dict(Id, PD),
                 kategoria_odporucania(User, Id, Kat) ),
               Odp),
       reply(Request, _{ pouzivatel: User, odporucania: Odp })
    ;  reply(Request, _{ error: "neznamy pouzivatel", pouzivatel: User })
    ).


% --- /api/explain?user=jan&item=interstellar -----------------
handle_explain(Request) :-
    param_atom(Request, user, User),
    param_atom(Request, item, Item),
    ( dovody_odporucania(User, Item, Dovody)
    -> dovody_json(Dovody, JsonDovody),
       polozka_dict(Item, PD),
       reply(Request, _{ pouzivatel: User, polozka: PD,
                         odporucane: true, dovody: JsonDovody })
    ;  ( polozka(Item, _, _, _) -> PolExists = true ; PolExists = false ),
       reply(Request, _{ pouzivatel: User, polozka_id: Item,
                         odporucane: false, existuje: PolExists,
                         dovody: [] })
    ).


% --- /api/hybrid?user=maria ----------------------------------
handle_hybrid(Request) :-
    param_atom(Request, user, User),
    ( pouzivatel(User, _)
    -> top_hybridne(User, Zoradene),
       findall(_{ polozka: PD, hybrid: Hyb, content: Content,
                  bonus: Bonus },
               ( member(Hyb-Id, Zoradene),
                 polozka_dict(Id, PD),
                 skore_odporucania(User, Id, Content),
                 Bonus is Hyb - Content ),
               Vysledok),
       reply(Request, _{ pouzivatel: User, odporucania: Vysledok })
    ;  reply(Request, _{ error: "neznamy pouzivatel", pouzivatel: User })
    ).


% --- /api/collaborative?user=peter ---------------------------
handle_collaborative(Request) :-
    param_atom(Request, user, User),
    ( pouzivatel(User, _)
    -> findall(_{ pouzivatel: PD, skore: Skore, dovody: JsonDovody },
               ( podobni_pouzivatelia(User, Iny),
                 podobnost_pouzivatelov(User, Iny, Skore, Dovody),
                 pouzivatel(Iny, Meno),
                 dovody_json(Dovody, JsonDovody),
                 PD = _{ id: Iny, meno: Meno } ),
               Podobni),
       ( setof(Id, odporucam_collaborative(User, Id), Ids)
       -> maplist(polozka_dict, Ids, OdpItems)
       ;  OdpItems = []
       ),
       reply(Request, _{ pouzivatel: User,
                         podobni: Podobni,
                         odporucania: OdpItems })
    ;  reply(Request, _{ error: "neznamy pouzivatel", pouzivatel: User })
    ).


% --- /api/cross-domain?user=peter&item=dune ------------------
handle_cross_domain(Request) :-
    param_atom(Request, user, User),
    param_atom(Request, item, Item),
    ( setof(Ciel-Dovod, cross_domain_odporucam(User, Item, Ciel, Dovod), Pary)
    -> % unikatne ciele, kazdy s pozbieranymi dovodmi
       setof(Ciel, D2^member(Ciel-D2, Pary), Ciele),
       findall(_{ polozka: PD, dovody: JsonDovody },
               ( member(Ciel, Ciele),
                 findall(D, member(Ciel-D, Pary), Ds),
                 list_to_set(Ds, DsU),
                 dovody_json(DsU, JsonDovody),
                 polozka_dict(Ciel, PD) ),
               Vysledok),
       reply(Request, _{ pouzivatel: User, zdroj: Item,
                         odporucania: Vysledok })
    ;  reply(Request, _{ pouzivatel: User, zdroj: Item, odporucania: [] })
    ).


% --- /api/fans?item=witcher3 ---------------------------------
handle_fans(Request) :-
    param_atom(Request, item, Item),
    ( polozka(Item, _, _, _)
    -> ( fanusikovia_s_dovodmi(Item, Pary) -> true ; Pary = [] ),
       findall(_{ pouzivatel: _{id: Uid, meno: Meno}, dovody: JsonDovody },
               ( member(Uid-Dovody, Pary),
                 pouzivatel(Uid, Meno),
                 dovody_json(Dovody, JsonDovody) ),
               Fanusikovia),
       polozka_dict(Item, PD),
       reply(Request, _{ polozka: PD, fanusikovia: Fanusikovia })
    ;  reply(Request, _{ error: "neznama polozka", polozka_id: Item })
    ).


% --- /api/related?item=dune ----------------------------------
handle_related(Request) :-
    param_atom(Request, item, Item),
    ( polozka(Item, _, _, _)
    -> top_pribuzne(Item, Top),
       findall(_{ polozka: PD, sila: Sila, atributy: AtrJson },
               ( member(Sila-Id, Top),
                 polozka_dict(Id, PD),
                 findall(A, zdielany_atribut(Item, Id, A), Atr0),
                 list_to_set(Atr0, Atr),
                 dovody_json(Atr, AtrJson) ),
               Pribuzne),
       polozka_dict(Item, PD0),
       reply(Request, _{ polozka: PD0, pribuzne: Pribuzne })
    ;  reply(Request, _{ error: "neznama polozka", polozka_id: Item })
    ).


% --- /api/path?from=amelie&to=dark_souls&max=4 ---------------
handle_path(Request) :-
    param_atom(Request, from, From),
    param_atom(Request, to, To),
    param_number(Request, max, 4, Max),
    ( ( polozka(From, _, _, _), polozka(To, _, _, _) )
    -> ( retazec(From, To, Max, Cesta)
       -> maplist(polozka_dict, Cesta, CestaDicts),
          reply(Request, _{ od: From, do: To, max: Max,
                            najdena: true, cesta: CestaDicts })
       ;  reply(Request, _{ od: From, do: To, max: Max,
                            najdena: false, cesta: [] })
       )
    ;  reply(Request, _{ error: "neznama polozka", od: From, do: To })
    ).


% --- /api/movie-night?user=jan&limit=300 ---------------------
handle_movie_night(Request) :-
    param_atom(Request, user, User),
    param_number(Request, limit, 300, Limit),
    LimitInt is integer(Limit),
    ( pouzivatel(User, _)
    -> ( filmovy_vecer(User, LimitInt, Vyber, Dlzka, Skore)
       -> findall(_{ polozka: PD, dlzka: D, skore: S },
                  ( member(F, Vyber),
                    polozka_dict(F, PD),
                    dlzka(F, D),
                    skore_odporucania(User, F, S) ),
                  Filmy),
          reply(Request, _{ pouzivatel: User, limit: LimitInt,
                            najdene: true,
                            celkova_dlzka: Dlzka,
                            celkove_skore: Skore,
                            filmy: Filmy })
       ;  reply(Request, _{ pouzivatel: User, limit: LimitInt,
                            najdene: false, filmy: [] })
       )
    ;  reply(Request, _{ error: "neznamy pouzivatel", pouzivatel: User })
    ).


% --- /api/custom-recommend?genres=sci_fi,akcia&types=film,serial&min_rating=7 ---
handle_custom_recommend(Request) :-
    ( param_atom(Request, genres, GenresAtom)
    ->  atomic_list_concat(Zanre, ',', GenresAtom)
    ;   Zanre = []
    ),
    ( Zanre = []
    ->  reply(Request, _{ error: "Vyber aspon jeden zaner", odporucania: [] })
    ;
        ( param_atom(Request, types, TypesAtom)
        ->  atomic_list_concat(Typy, ',', TypesAtom)
        ;   Typy = [film, kniha, hra, serial]
        ),
        param_number(Request, min_rating, 1, MinH),
        ( param_atom(Request, creators, CreatorsAtom)
        ->  atomic_list_concat(Tvorcovia, ',', CreatorsAtom)
        ;   Tvorcovia = []
        ),
        ( param_atom(Request, countries, CountriesAtom)
        ->  atomic_list_concat(Krajiny, ',', CountriesAtom)
        ;   Krajiny = []
        ),
        ( param_atom(Request, studios, StudiosAtom)
        ->  atomic_list_concat(Studia, ',', StudiosAtom)
        ;   Studia = []
        ),
        ( param_atom(Request, consumed, ConsumedAtom)
        ->  atomic_list_concat(Konzumovane, ',', ConsumedAtom)
        ;   Konzumovane = []
        ),
        top_vlastne_odporucania(Zanre, Typy, MinH, Tvorcovia, Krajiny, Studia, Konzumovane, Zoradene),
        findall(_{ polozka: PD, skore: Skore },
                ( member(Skore-Id, Zoradene),
                  polozka_dict(Id, PD) ),
                Odp),
        reply(Request, _{ odporucania: Odp })
    ).


% --- /api/stats?user=jan -------------------------------------
handle_stats(Request) :-
    ( param_atom(Request, user, User), pouzivatel(User, _)
    -> stat_pouzivatel(User, D),
       reply(Request, D)
    ;  % bez parametra user -> stat pre vsetkych
       findall(D, ( pouzivatel(U, _), stat_pouzivatel(U, D) ), Vsetci),
       reply(Request, _{ statistiky: Vsetci })
    ).

stat_pouzivatel(User, _{ pouzivatel: User, meno: Meno, spolu: N,
                         filmy: Nf, knihy: Nk, hry: Nh, serialy: Ns }) :-
    pouzivatel(User, Meno),
    pocet_odporucani(User, N),
    pocet_odporucani_typu(User, film, Nf),
    pocet_odporucani_typu(User, kniha, Nk),
    pocet_odporucani_typu(User, hra, Nh),
    pocet_odporucani_typu(User, serial, Ns).
