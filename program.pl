% =============================================================
% program.pl  -  Odporucaci system filmov, knih, videohier a serialov v Prologu
% Predmet: Logicke programovanie a inferencia (LPI), TUKE
% Tema 9: Program odporucajuci filmy/knihy/technologie na zaklade
%         definovanych pravidiel.
% =============================================================
%
% Struktura programu:
%   1) ZNALOSTNA BAZA  - fakty o polozkach (film/kniha/hra/serial)
%                        a o pouzivateloch
%   2) INFERENCNE PRAVIDLA
%        2.A pomocne predikaty
%        2.B hlavne odporucanie + skorovanie + vysvetlenie
%        2.C collaborative filtering
%        2.D CROSS-DOMAIN odporucanie (paci sa mi film -> hra)
%        2.E FILTER "kto ma rad X" (fanusikovia)
%        2.F ROBUSTNE CESTOVANIE po grafe vztahov
%   3) STATISTIKA
%
% Spustenie:
%   ?- consult('program.pl').
%   ?- odporucam(jan, P).
%   ?- cross_domain_odporucam(peter, dune, Ciel, Dovod).
%   ?- fanusikovia(witcher3, Users).
%   ?- pribuzne_polozky(dune, X, S).
%
% =============================================================

:- encoding(utf8).
:- set_prolog_flag(double_quotes, codes).
:- use_module(library(clpfd)).

% Multifile / discontiguous declarations - kvoli prehladnosti
% maju polozky toho isteho typu pokope, a fakty su rozdelene
% do logickych blokov.
:- discontiguous polozka/4.
:- discontiguous zaner/2.
:- discontiguous hodnotenie/2.
:- discontiguous krajina/2.
:- discontiguous studio/2.
:- discontiguous tvorca/3.
:- discontiguous dlzka/2.
:- discontiguous strany/2.
:- discontiguous dlzka_hry/2.
:- discontiguous epizody/2.
:- discontiguous adaptacia/2.
:- discontiguous univerzum/2.

% =============================================================
% 1) ZNALOSTNA BAZA - FAKTY
% =============================================================
%
% Unifikovany datovy model: polozka(+Id, +Typ, +Nazov, +Rok)
%   Typ in {film, kniha, hra, serial}
%
% Spolocne atributy pre vsetky typy: zaner, hodnotenie, krajina,
% studio, tvorca.
% Typovo specificke atributy:
%   - dlzka (minuty)      ... iba pre filmy
%   - strany              ... iba pre knihy
%   - dlzka_hry (hodiny)  ... iba pre hry
%   - epizody             ... iba pre serialy
%
% =============================================================


% --- 1.A FILMY (15) ------------------------------------------
polozka(inception,    film, 'Inception',         2010).
polozka(matrix,       film, 'The Matrix',        1999).
polozka(interstellar, film, 'Interstellar',      2014).
polozka(amelie,       film, 'Amelie',            2001).
polozka(parasite,     film, 'Parasite',          2019).
polozka(joker,        film, 'Joker',             2019).
polozka(forrest_gump, film, 'Forrest Gump',      1994).
polozka(dune,         film, 'Dune',              2021).
polozka(shining,      film, 'The Shining',       1980).
polozka(godfather,    film, 'The Godfather',     1972).
polozka(arrival,      film, 'Arrival',           2016).
polozka(blade_runner, film, 'Blade Runner',      1982).
polozka(dark_knight,  film, 'The Dark Knight',   2008).
polozka(lotr_film,    film, 'The Fellowship of the Ring', 2001).
polozka(spirited_away, film, 'Spirited Away',    2001).

% žánre filmov
zaner(inception,    sci_fi).
zaner(inception,    thriller).
zaner(inception,    akcia).
zaner(matrix,       sci_fi).
zaner(matrix,       akcia).
zaner(interstellar, sci_fi).
zaner(interstellar, drama).
zaner(amelie,       romansa).
zaner(amelie,       komedia).
zaner(parasite,     thriller).
zaner(parasite,     drama).
zaner(joker,        drama).
zaner(joker,        thriller).
zaner(forrest_gump, drama).
zaner(forrest_gump, romansa).
zaner(dune,         sci_fi).
zaner(dune,         akcia).
zaner(shining,      horor).
zaner(shining,      thriller).
zaner(godfather,    drama).
zaner(godfather,    krimi).
zaner(arrival,      sci_fi).
zaner(arrival,      drama).
zaner(blade_runner, sci_fi).
zaner(blade_runner, thriller).
zaner(dark_knight,  akcia).
zaner(dark_knight,  krimi).
zaner(dark_knight,  drama).
zaner(lotr_film,    fantasy).
zaner(lotr_film,    dobrodruzny).
zaner(spirited_away, fantasy).
zaner(spirited_away, dobrodruzny).

% hodnotenia filmov (1-10)
hodnotenie(inception,    9).
hodnotenie(matrix,       9).
hodnotenie(interstellar, 9).
hodnotenie(amelie,       8).
hodnotenie(parasite,     9).
hodnotenie(joker,        8).
hodnotenie(forrest_gump, 9).
hodnotenie(dune,         8).
hodnotenie(shining,      9).
hodnotenie(godfather,    10).
hodnotenie(arrival,      9).
hodnotenie(blade_runner, 9).
hodnotenie(dark_knight,  9).
hodnotenie(lotr_film,    9).
hodnotenie(spirited_away,9).

% dlzka filmov v minutach
dlzka(inception,    148).
dlzka(matrix,       136).
dlzka(interstellar, 169).
dlzka(amelie,       122).
dlzka(parasite,     132).
dlzka(joker,        122).
dlzka(forrest_gump, 142).
dlzka(dune,         155).
dlzka(shining,      144).
dlzka(godfather,    175).
dlzka(arrival,      116).
dlzka(blade_runner, 117).
dlzka(dark_knight,  152).
dlzka(lotr_film,    178).
dlzka(spirited_away,125).

% krajina povodu filmov
krajina(inception,    usa).
krajina(matrix,       usa).
krajina(interstellar, usa).
krajina(amelie,       francuzsko).
krajina(parasite,     juzna_korea).
krajina(joker,        usa).
krajina(forrest_gump, usa).
krajina(dune,         usa).
krajina(shining,      usa).
krajina(godfather,    usa).
krajina(arrival,      usa).
krajina(blade_runner, usa).
krajina(dark_knight,  usa).
krajina(lotr_film,    novy_zeland).
krajina(spirited_away,japonsko).

% filmove studio / producent
studio(inception,    warner_bros).
studio(matrix,       warner_bros).
studio(interstellar, paramount).
studio(amelie,       ugc).
studio(parasite,     cj_entertainment).
studio(joker,        warner_bros).
studio(forrest_gump, paramount).
studio(dune,         warner_bros).
studio(shining,      warner_bros).
studio(godfather,    paramount).
studio(arrival,      paramount).
studio(blade_runner, warner_bros).
studio(dark_knight,  warner_bros).
studio(lotr_film,    new_line_cinema).
studio(spirited_away,studio_ghibli).

% tvorca(+PolozkaId, +Rola, +Meno)
%   Rola pre filmy = reziser
tvorca(inception,    reziser, nolan).
tvorca(interstellar, reziser, nolan).
tvorca(matrix,       reziser, wachowski).
tvorca(parasite,     reziser, bong).
tvorca(joker,        reziser, phillips).
tvorca(amelie,       reziser, jeunet).
tvorca(forrest_gump, reziser, zemeckis).
tvorca(dune,         reziser, villeneuve).
tvorca(shining,      reziser, kubrick).
tvorca(godfather,    reziser, coppola).
tvorca(arrival,      reziser, villeneuve).
tvorca(blade_runner, reziser, ridley_scott).
tvorca(dark_knight,  reziser, nolan).
tvorca(lotr_film,    reziser, peter_jackson).
tvorca(spirited_away,reziser, miyazaki).


% --- 1.B KNIHY (15) ------------------------------------------
polozka(dune_book,        kniha, 'Dune',                       1965).
polozka(foundation,       kniha, 'Foundation',                 1951).
polozka(lotr,             kniha, 'The Lord of the Rings',      1954).
polozka(hobbit,           kniha, 'The Hobbit',                 1937).
polozka(crime_punishment, kniha, 'Crime and Punishment',       1866).
polozka(book_1984,        kniha, '1984',                       1949).
polozka(witcher_book,     kniha, 'The Last Wish',              1993).
polozka(pride_prejudice,  kniha, 'Pride and Prejudice',        1813).
polozka(name_of_wind,     kniha, 'The Name of the Wind',       2007).
polozka(it_book,          kniha, 'It',                         1986).
polozka(hyperion,         kniha, 'Hyperion',                   1989).
polozka(neuromancer,      kniha, 'Neuromancer',                1984).
polozka(martian,          kniha, 'The Martian',                2011).
polozka(gone_girl,        kniha, 'Gone Girl',                  2012).
polozka(american_gods,    kniha, 'American Gods',              2001).

% žánre knih
zaner(dune_book,        sci_fi).
zaner(dune_book,        dobrodruzny).
zaner(foundation,       sci_fi).
zaner(lotr,             fantasy).
zaner(lotr,             dobrodruzny).
zaner(hobbit,           fantasy).
zaner(hobbit,           dobrodruzny).
zaner(crime_punishment, drama).
zaner(crime_punishment, krimi).
zaner(book_1984,        sci_fi).
zaner(book_1984,        drama).
zaner(witcher_book,     fantasy).
zaner(witcher_book,     dobrodruzny).
zaner(pride_prejudice,  romansa).
zaner(pride_prejudice,  drama).
zaner(name_of_wind,     fantasy).
zaner(it_book,          horor).
zaner(it_book,          thriller).
zaner(hyperion,         sci_fi).
zaner(hyperion,         dobrodruzny).
zaner(neuromancer,      sci_fi).
zaner(neuromancer,      thriller).
zaner(martian,          sci_fi).
zaner(martian,          dobrodruzny).
zaner(gone_girl,        thriller).
zaner(gone_girl,        drama).
zaner(american_gods,    fantasy).
zaner(american_gods,    dobrodruzny).

% hodnotenia knih
hodnotenie(dune_book,        9).
hodnotenie(foundation,       9).
hodnotenie(lotr,            10).
hodnotenie(hobbit,           9).
hodnotenie(crime_punishment,10).
hodnotenie(book_1984,        9).
hodnotenie(witcher_book,     8).
hodnotenie(pride_prejudice,  8).
hodnotenie(name_of_wind,     9).
hodnotenie(it_book,          9).
hodnotenie(hyperion,         9).
hodnotenie(neuromancer,      8).
hodnotenie(martian,          8).
hodnotenie(gone_girl,        8).
hodnotenie(american_gods,    8).

% pocet stran
strany(dune_book,        412).
strany(foundation,       255).
strany(lotr,            1178).
strany(hobbit,           310).
strany(crime_punishment, 671).
strany(book_1984,        328).
strany(witcher_book,     320).
strany(pride_prejudice,  432).
strany(name_of_wind,     662).
strany(it_book,         1138).
strany(hyperion,         482).
strany(neuromancer,      271).
strany(martian,          369).
strany(gone_girl,        432).
strany(american_gods,    635).

% krajina autora / vydania
krajina(dune_book,        usa).
krajina(foundation,       usa).
krajina(lotr,             uk).
krajina(hobbit,           uk).
krajina(crime_punishment, rusko).
krajina(book_1984,        uk).
krajina(witcher_book,     polsko).
krajina(pride_prejudice,  uk).
krajina(name_of_wind,     usa).
krajina(it_book,          usa).
krajina(hyperion,         usa).
krajina(neuromancer,      kanada).
krajina(martian,          usa).
krajina(gone_girl,        usa).
krajina(american_gods,    uk).

% vydavatelstvo
studio(dune_book,        chilton_books).
studio(foundation,       gnome_press).
studio(lotr,             allen_unwin).
studio(hobbit,           allen_unwin).
studio(crime_punishment, russian_messenger).
studio(book_1984,        secker_warburg).
studio(witcher_book,     supernowa).
studio(pride_prejudice,  t_egerton).
studio(name_of_wind,     daw_books).
studio(it_book,          viking_press).
studio(hyperion,         doubleday).
studio(neuromancer,      ace_books).
studio(martian,          crown).
studio(gone_girl,        crown).
studio(american_gods,    headline).

% tvorca(+PolozkaId, +Rola, +Meno)
%   Rola pre knihy = autor
tvorca(dune_book,        autor, herbert).
tvorca(foundation,       autor, asimov).
tvorca(lotr,             autor, tolkien).
tvorca(hobbit,           autor, tolkien).
tvorca(crime_punishment, autor, dostojevskij).
tvorca(book_1984,        autor, orwell).
tvorca(witcher_book,     autor, sapkowski).
tvorca(pride_prejudice,  autor, austen).
tvorca(name_of_wind,     autor, rothfuss).
tvorca(it_book,          autor, king).
tvorca(hyperion,         autor, dan_simmons).
tvorca(neuromancer,      autor, william_gibson).
tvorca(martian,          autor, andy_weir).
tvorca(gone_girl,        autor, gillian_flynn).
tvorca(american_gods,    autor, neil_gaiman).


% --- 1.C VIDEOHRY (15) --------------------------------------
polozka(witcher3,     hra, 'The Witcher 3: Wild Hunt',    2015).
polozka(mass_effect,  hra, 'Mass Effect',                 2007).
polozka(skyrim,       hra, 'The Elder Scrolls V: Skyrim', 2011).
polozka(gta5,         hra, 'Grand Theft Auto V',          2013).
polozka(portal2,      hra, 'Portal 2',                    2011).
polozka(half_life2,   hra, 'Half-Life 2',                 2004).
polozka(red_dead2,    hra, 'Red Dead Redemption 2',       2018).
polozka(dark_souls,   hra, 'Dark Souls',                  2011).
polozka(horizon_zero, hra, 'Horizon Zero Dawn',           2017).
polozka(cyberpunk,    hra, 'Cyberpunk 2077',              2020).
polozka(disco_elysium,hra, 'Disco Elysium',               2019).
polozka(last_of_us,   hra, 'The Last of Us',              2013).
polozka(bioshock,     hra, 'BioShock',                    2007).
polozka(zelda_botw,   hra, 'The Legend of Zelda: Breath of the Wild', 2017).
polozka(stardew,      hra, 'Stardew Valley',              2016).

% žánre hier
zaner(witcher3,     rpg).
zaner(witcher3,     fantasy).
zaner(witcher3,     akcia).
zaner(mass_effect,  rpg).
zaner(mass_effect,  sci_fi).
zaner(skyrim,       rpg).
zaner(skyrim,       fantasy).
zaner(gta5,         akcia).
zaner(gta5,         krimi).
zaner(portal2,      puzzle).
zaner(portal2,      sci_fi).
zaner(half_life2,   sci_fi).
zaner(half_life2,   akcia).
zaner(red_dead2,    akcia).
zaner(red_dead2,    drama).
zaner(dark_souls,   rpg).
zaner(dark_souls,   fantasy).
zaner(horizon_zero, rpg).
zaner(horizon_zero, sci_fi).
zaner(horizon_zero, akcia).
zaner(cyberpunk,    rpg).
zaner(cyberpunk,    sci_fi).
zaner(disco_elysium,rpg).
zaner(disco_elysium,krimi).
zaner(disco_elysium,drama).
zaner(last_of_us,   akcia).
zaner(last_of_us,   drama).
zaner(last_of_us,   horor).
zaner(bioshock,     sci_fi).
zaner(bioshock,     akcia).
zaner(bioshock,     thriller).
zaner(zelda_botw,   fantasy).
zaner(zelda_botw,   dobrodruzny).
zaner(stardew,      rpg).
zaner(stardew,      dobrodruzny).

% hodnotenia hier (1-10)
hodnotenie(witcher3,    10).
hodnotenie(mass_effect,  9).
hodnotenie(skyrim,       9).
hodnotenie(gta5,        10).
hodnotenie(portal2,     10).
hodnotenie(half_life2,  10).
hodnotenie(red_dead2,   10).
hodnotenie(dark_souls,   9).
hodnotenie(horizon_zero, 9).
hodnotenie(cyberpunk,    8).
hodnotenie(disco_elysium,10).
hodnotenie(last_of_us,    10).
hodnotenie(bioshock,      9).
hodnotenie(zelda_botw,    10).
hodnotenie(stardew,       9).

% priemerna dlzka prehrania v hodinach
dlzka_hry(witcher3,    100).
dlzka_hry(mass_effect,  30).
dlzka_hry(skyrim,       80).
dlzka_hry(gta5,         35).
dlzka_hry(portal2,      10).
dlzka_hry(half_life2,   15).
dlzka_hry(red_dead2,    60).
dlzka_hry(dark_souls,   50).
dlzka_hry(horizon_zero, 35).
dlzka_hry(cyberpunk,    60).
dlzka_hry(disco_elysium,25).
dlzka_hry(last_of_us,   15).
dlzka_hry(bioshock,     12).
dlzka_hry(zelda_botw,   60).
dlzka_hry(stardew,      80).

% krajina herneho studia
krajina(witcher3,     polsko).
krajina(mass_effect,  kanada).
krajina(skyrim,       usa).
krajina(gta5,         usa).
krajina(portal2,      usa).
krajina(half_life2,   usa).
krajina(red_dead2,    usa).
krajina(dark_souls,   japonsko).
krajina(horizon_zero, holandsko).
krajina(cyberpunk,    polsko).
krajina(disco_elysium,estonsko).
krajina(last_of_us,   usa).
krajina(bioshock,     usa).
krajina(zelda_botw,   japonsko).
krajina(stardew,      usa).

% herne studio (vyvojar)
studio(witcher3,     cd_projekt_red).
studio(mass_effect,  bioware).
studio(skyrim,       bethesda).
studio(gta5,         rockstar).
studio(portal2,      valve).
studio(half_life2,   valve).
studio(red_dead2,    rockstar).
studio(dark_souls,   fromsoftware).
studio(horizon_zero, guerrilla).
studio(cyberpunk,    cd_projekt_red).
studio(disco_elysium,zaum).
studio(last_of_us,   naughty_dog).
studio(bioshock,     irrational_games).
studio(zelda_botw,   nintendo).
studio(stardew,      concernedape).

% tvorca(+PolozkaId, +Rola, +Meno)
%   Rola pre hry = vyvojar / lead designer
tvorca(witcher3,     autor_predlohy, sapkowski).
tvorca(mass_effect,  vyvojar, casey_hudson).
tvorca(skyrim,       vyvojar, todd_howard).
tvorca(gta5,         vyvojar, dan_houser).
tvorca(portal2,      vyvojar, valve_team).
tvorca(half_life2,   vyvojar, valve_team).
tvorca(red_dead2,    vyvojar, dan_houser).
tvorca(dark_souls,   vyvojar, miyazaki).
tvorca(horizon_zero, vyvojar, hermen_hulst).
tvorca(cyberpunk,    vyvojar, mike_pondsmith).
tvorca(disco_elysium,vyvojar, robert_kurvitz).
tvorca(last_of_us,   vyvojar, neil_druckmann).
tvorca(bioshock,     vyvojar, ken_levine).
tvorca(zelda_botw,   vyvojar, aonuma).
tvorca(stardew,      vyvojar, concernedape).


% --- 1.D SERIALY (10) ------------------------------------------
polozka(breaking_bad,    serial, 'Breaking Bad',       2008).
polozka(stranger_things, serial, 'Stranger Things',    2016).
polozka(game_of_thrones, serial, 'Game of Thrones',    2011).
polozka(the_expanse,     serial, 'The Expanse',        2015).
polozka(black_mirror,    serial, 'Black Mirror',       2011).
polozka(chernobyl,       serial, 'Chernobyl',          2019).
polozka(true_detective,   serial, 'True Detective',    2014).
polozka(westworld,        serial, 'Westworld',         2016).
polozka(arcane,           serial, 'Arcane',            2021).
polozka(mandalorian,      serial, 'The Mandalorian',   2019).

% žánre serialov
zaner(breaking_bad,    drama).
zaner(breaking_bad,    krimi).
zaner(breaking_bad,    thriller).
zaner(stranger_things, sci_fi).
zaner(stranger_things, horor).
zaner(stranger_things, thriller).
zaner(game_of_thrones, fantasy).
zaner(game_of_thrones, drama).
zaner(game_of_thrones, dobrodruzny).
zaner(the_expanse,     sci_fi).
zaner(the_expanse,     drama).
zaner(black_mirror,    sci_fi).
zaner(black_mirror,    thriller).
zaner(black_mirror,    drama).
zaner(chernobyl,       drama).
zaner(chernobyl,       thriller).
zaner(true_detective,   krimi).
zaner(true_detective,   thriller).
zaner(true_detective,   drama).
zaner(westworld,        sci_fi).
zaner(westworld,        drama).
zaner(westworld,        thriller).
zaner(arcane,           fantasy).
zaner(arcane,           akcia).
zaner(arcane,           drama).
zaner(mandalorian,      sci_fi).
zaner(mandalorian,      akcia).
zaner(mandalorian,      dobrodruzny).

% hodnotenia serialov
hodnotenie(breaking_bad,    10).
hodnotenie(stranger_things,  8).
hodnotenie(game_of_thrones,  9).
hodnotenie(the_expanse,      9).
hodnotenie(black_mirror,     8).
hodnotenie(chernobyl,       10).
hodnotenie(true_detective,    9).
hodnotenie(westworld,         8).
hodnotenie(arcane,            9).
hodnotenie(mandalorian,       8).

% pocet epizod
epizody(breaking_bad,    62).
epizody(stranger_things, 34).
epizody(game_of_thrones, 73).
epizody(the_expanse,     62).
epizody(black_mirror,    27).
epizody(chernobyl,        5).
epizody(true_detective,   30).
epizody(westworld,        36).
epizody(arcane,            9).
epizody(mandalorian,      24).

% krajina produkcie serialu
krajina(breaking_bad,    usa).
krajina(stranger_things, usa).
krajina(game_of_thrones, usa).
krajina(the_expanse,     usa).
krajina(black_mirror,    uk).
krajina(chernobyl,       usa).
krajina(true_detective,   usa).
krajina(westworld,        usa).
krajina(arcane,           usa).
krajina(mandalorian,      usa).

% produkcna platforma / studio
studio(breaking_bad,    amc).
studio(stranger_things, netflix).
studio(game_of_thrones, hbo).
studio(the_expanse,     amazon_prime).
studio(black_mirror,    netflix).
studio(chernobyl,       hbo).
studio(true_detective,   hbo).
studio(westworld,        hbo).
studio(arcane,           netflix).
studio(mandalorian,      disney).

% tvorca(+PolozkaId, +Rola, +Meno)
%   Rola pre serialy = showrunner / tvorca
tvorca(breaking_bad,    showrunner, vince_gilligan).
tvorca(stranger_things, tvorca, duffer_brothers).
tvorca(game_of_thrones, showrunner, benioff_weiss).
tvorca(the_expanse,     tvorca, mark_fergus).
tvorca(black_mirror,    tvorca, charlie_brooker).
tvorca(chernobyl,       tvorca, craig_mazin).
tvorca(true_detective,   tvorca, nic_pizzolatto).
tvorca(westworld,        showrunner, jonathan_nolan).
tvorca(arcane,           tvorca, christian_linke).
tvorca(mandalorian,      tvorca, jon_favreau).


% =============================================================
% 1.E POUZIVATELIA A PREFERENCIE
% =============================================================
%
% pouzivatel(+Id, +Meno)
pouzivatel(jan,    'Jan Novak').
pouzivatel(anna,   'Anna Kovacova').
pouzivatel(peter,  'Peter Horvath').
pouzivatel(maria,  'Maria Toth').
pouzivatel(tomas,  'Tomas Varga').

% oblubeny_zaner(+P, +Zaner)
oblubeny_zaner(jan,    sci_fi).
oblubeny_zaner(jan,    thriller).
oblubeny_zaner(anna,   drama).
oblubeny_zaner(anna,   romansa).
oblubeny_zaner(peter,  akcia).
oblubeny_zaner(peter,  sci_fi).
oblubeny_zaner(peter,  thriller).
oblubeny_zaner(maria,  fantasy).
oblubeny_zaner(maria,  dobrodruzny).
oblubeny_zaner(maria,  rpg).
oblubeny_zaner(tomas,  sci_fi).
oblubeny_zaner(tomas,  akcia).
oblubeny_zaner(tomas,  rpg).

% oblubeny_typ(+P, +Typ)  - aky obsah vobec pouzivatel konzumuje
oblubeny_typ(jan,   film).
oblubeny_typ(jan,   kniha).
oblubeny_typ(jan,   serial).
oblubeny_typ(anna,  film).
oblubeny_typ(anna,  kniha).
oblubeny_typ(anna,  serial).
oblubeny_typ(peter, film).
oblubeny_typ(peter, hra).
oblubeny_typ(peter, serial).
oblubeny_typ(maria, kniha).
oblubeny_typ(maria, hra).
oblubeny_typ(maria, film).
oblubeny_typ(maria, serial).
oblubeny_typ(tomas, hra).
oblubeny_typ(tomas, film).
oblubeny_typ(tomas, serial).

% oblubeny_tvorca(+P, +Meno)
oblubeny_tvorca(jan,   nolan).
oblubeny_tvorca(peter, villeneuve).
oblubeny_tvorca(anna,  austen).
oblubeny_tvorca(maria, tolkien).
oblubeny_tvorca(maria, sapkowski).
oblubeny_tvorca(tomas, valve_team).

% oblubena_krajina(+P, +Krajina)
oblubena_krajina(jan,   usa).
oblubena_krajina(anna,  uk).
oblubena_krajina(peter, usa).
oblubena_krajina(maria, polsko).
oblubena_krajina(maria, uk).
oblubena_krajina(tomas, polsko).
oblubena_krajina(tomas, usa).

% oblubene_studio(+P, +Studio)
oblubene_studio(peter, warner_bros).
oblubene_studio(maria, cd_projekt_red).
oblubene_studio(tomas, valve).
oblubene_studio(tomas, cd_projekt_red).

% min_hodnotenie(+P, +Min)
min_hodnotenie(jan,   8).
min_hodnotenie(anna,  7).
min_hodnotenie(peter, 8).
min_hodnotenie(maria, 8).
min_hodnotenie(tomas, 9).

% Typovo specificke "rozmerove" prahy
% max_dlzka(+P, +Minuty)        ... pre filmy
max_dlzka(jan,   170).
max_dlzka(anna,  150).
max_dlzka(peter, 180).
max_dlzka(maria, 180).
max_dlzka(tomas, 180).

% max_strany(+P, +PocetStran)   ... pre knihy
max_strany(jan,    600).
max_strany(anna,   500).
max_strany(maria, 1300).
max_strany(peter,  800).
max_strany(tomas,  600).

% max_hodiny_hry(+P, +Hodiny)   ... pre hry
max_hodiny_hry(peter,  60).
max_hodiny_hry(maria, 120).
max_hodiny_hry(tomas, 120).
max_hodiny_hry(jan,    50).
max_hodiny_hry(anna,   20).

% max_epizody(+P, +PocetEpizod) ... pre serialy
max_epizody(jan,    70).
max_epizody(anna,   80).
max_epizody(peter,  80).
max_epizody(maria,  90).
max_epizody(tomas,  70).

% uz_konzumoval(+P, +PolozkaId)
% (premenovane z uz_videl - pokryva videl/precital/odohral)
uz_konzumoval(jan,   inception).
uz_konzumoval(jan,   matrix).
uz_konzumoval(jan,   book_1984).
uz_konzumoval(jan,   black_mirror).
uz_konzumoval(anna,  amelie).
uz_konzumoval(anna,  pride_prejudice).
uz_konzumoval(anna,  chernobyl).
uz_konzumoval(peter, matrix).
uz_konzumoval(peter, dune).
uz_konzumoval(peter, gta5).
uz_konzumoval(peter, stranger_things).
uz_konzumoval(maria, hobbit).
uz_konzumoval(maria, witcher3).
uz_konzumoval(maria, game_of_thrones).
uz_konzumoval(tomas, half_life2).
uz_konzumoval(tomas, portal2).
uz_konzumoval(tomas, the_expanse).


% =============================================================
% 1.F ADAPTACIE A SPOLOCNE UNIVERZA
% =============================================================
%
% adaptacia(+Zdroj, +Ciel)  - Zdroj je adaptaciou (prepracovanim)
%                              Ciela.  Konvencia: od noveho diela
%                              k povodnemu.
adaptacia(dune,     dune_book).      % film 2021 podla knihy 1965
adaptacia(witcher3, witcher_book).   % hra podla Sapkowskeho knih

% univerzum(+Polozka, +Univerzum)  - polozka patri do fikc. sveta
univerzum(dune,         dune_universe).
univerzum(dune_book,    dune_universe).
univerzum(witcher3,     witcher_universe).
univerzum(witcher_book, witcher_universe).
univerzum(hobbit,       middle_earth).
univerzum(lotr,         middle_earth).


% =============================================================
% 2) INFERENCNE PRAVIDLA
% =============================================================

% --- 2.A POMOCNE PREDIKATY -----------------------------------

% Polozka vyhovuje zanerovej preferencii pouzivatela
vyhovuje_zaneru(P, Polozka) :-
    oblubeny_zaner(P, Z),
    zaner(Polozka, Z).

% Polozka splna minimalne hodnotenie pouzivatela
vyhovuje_hodnoteniu(P, Polozka) :-
    min_hodnotenie(P, Min),
    hodnotenie(Polozka, H),
    H >= Min.

% Typovo zavisly rozmerovy filter
%   filmy -> dlzka v minutach
%   knihy -> pocet stran
%   hry   -> priemerna dlzka prehrania v hodinach
%   serialy -> pocet epizod
vyhovuje_rozmeru(P, F, film) :-
    max_dlzka(P, Max), dlzka(F, D),       D =< Max.
vyhovuje_rozmeru(P, K, kniha) :-
    max_strany(P, Max), strany(K, S),     S =< Max.
vyhovuje_rozmeru(P, H, hra) :-
    max_hodiny_hry(P, Max), dlzka_hry(H, Hod), Hod =< Max.
vyhovuje_rozmeru(P, S, serial) :-
    max_epizody(P, Max), epizody(S, E),   E =< Max.

% Pouzivatel polozku este nekonzumoval
este_nekonzumoval(P, Polozka) :-
    \+ uz_konzumoval(P, Polozka).

% Pouzivatel chce dany typ obsahu
pouzivatel_chce_typ(P, Typ) :-
    oblubeny_typ(P, Typ).


% --- 2.B HLAVNE PRAVIDLO ODPORUCANIA -------------------------
%
%  odporucam(P, Polozka) je pravdive prave vtedy, ked:
%    - Polozka je v znalostnej baze nejaky typ (film/kniha/hra/serial),
%    - pouzivatel P konzumuje tento typ obsahu,
%    - Polozka vyhovuje obl. zanerom P,
%    - splna minimalne hodnotenie P,
%    - splna typovo zavisly rozmerovy filter (dlzka/strany/hodiny/epizody),
%    - P ju este nekonzumoval.
%
odporucam(P, Polozka) :-
    polozka(Polozka, Typ, _, _),
    pouzivatel_chce_typ(P, Typ),
    once(vyhovuje_zaneru(P, Polozka)),
    vyhovuje_hodnoteniu(P, Polozka),
    vyhovuje_rozmeru(P, Polozka, Typ),
    este_nekonzumoval(P, Polozka).


% --- 2.B.1 SKOROVANIE A ZORADENIE ----------------------------

% Bonus za oblubeneho tvorcu (reziser/autor/vyvojar)
bonus_tvorcu(P, Polozka) :-
    oblubeny_tvorca(P, Meno),
    tvorca(Polozka, _, Meno).

% Bonus za oblubenu krajinu povodu
bonus_krajiny(P, Polozka) :-
    oblubena_krajina(P, K),
    krajina(Polozka, K).

% Bonus za oblubene studio
bonus_studia(P, Polozka) :-
    oblubene_studio(P, S),
    studio(Polozka, S).

% Skore odporucania = hodnotenie + zaner +2 + tvorca +3
%                    + krajina +1 + studio +1
skore_odporucania(P, Polozka, Skore) :-
    hodnotenie(Polozka, H),
    ( vyhovuje_zaneru(P, Polozka) -> BZ = 2 ; BZ = 0 ),
    ( bonus_tvorcu(P, Polozka)   -> BT = 3 ; BT = 0 ),
    ( bonus_krajiny(P, Polozka)  -> BK = 1 ; BK = 0 ),
    ( bonus_studia(P, Polozka)   -> BS = 1 ; BS = 0 ),
    Skore is H + BZ + BT + BK + BS.

% Top odporucania - zoradene zostupne podla skore
top_odporucania(P, Zoradene) :-
    findall(Skore-Polozka,
            ( odporucam(P, Polozka),
              skore_odporucania(P, Polozka, Skore) ),
            Pary),
    sort(0, @>=, Pary, Zoradene).


% --- 2.B.1.5 HYBRIDNE SKORE ----------------------------------
%
%  hybridne_skore(+P, +Polozka, -Skore)
%
%  Kombinuje content-based skore (skore_odporucania) s bonusmi
%  z dalsich zdrojov:
%    +3  ak ju uz konzumoval podobny pouzivatel (collab signal)
%    +2  ak pouzivatel konzumoval ineho clena adaptacneho paru
%    +2  ak pouzivatel konzumoval inu polozku zo zhodneho univerza
%
hybridne_skore(P, Polozka, Skore) :-
    skore_odporucania(P, Polozka, Content),
    ( bonus_collab(P, Polozka)    -> BC = 3 ; BC = 0 ),
    ( bonus_adaptacia(P, Polozka) -> BA = 2 ; BA = 0 ),
    ( bonus_univerzum(P, Polozka) -> BU = 2 ; BU = 0 ),
    Skore is Content + BC + BA + BU.

% Bonus +3: niektory podobny pouzivatel uz polozku konzumoval.
bonus_collab(P, Polozka) :-
    podobni_pouzivatelia(P, Q),
    uz_konzumoval(Q, Polozka), !.

% Bonus +2: pouzivatel konzumoval ineho clena adaptacneho paru.
bonus_adaptacia(P, Polozka) :-
    ( adaptacia(Polozka, Iny)
    ; adaptacia(Iny, Polozka) ),
    uz_konzumoval(P, Iny), !.

% Bonus +2: pouzivatel konzumoval inu polozku z toho isteho univerza.
bonus_univerzum(P, Polozka) :-
    univerzum(Polozka, U),
    univerzum(Iny, U),
    Iny \= Polozka,
    uz_konzumoval(P, Iny), !.

% Top odporucania zoradene zostupne podla hybridneho skore.
top_hybridne(P, Zoradene) :-
    findall(Skore-Polozka,
            ( odporucam(P, Polozka),
              hybridne_skore(P, Polozka, Skore) ),
            Pary),
    sort(0, @>=, Pary, Zoradene).


% --- 2.B.2 DOVODY A VYSVETLENIE ODPORUCANIA -------------------
%
%  dovody_odporucania(+P, +Polozka, -Dovody)
%     Cisty predikat: vrati zoznam dovodov bez vypisu na obrazovku.
%
%  vysvetli(+P, +Polozka)
%     Pouzivatelsky vypis nad dovody_odporucania/3.
%
dovody_odporucania(P, Polozka, Dovody) :-
    odporucam(P, Polozka),
    findall(D, dovod_odporucania(P, Polozka, D), Dovody0),
    list_to_set(Dovody0, Dovody).

dovod_odporucania(P, Polozka, typ(Typ)) :-
    polozka(Polozka, Typ, _, _),
    pouzivatel_chce_typ(P, Typ).
dovod_odporucania(P, Polozka, zaner(Z)) :-
    oblubeny_zaner(P, Z),
    zaner(Polozka, Z).
dovod_odporucania(P, Polozka, hodnotenie(H, minimum(Min))) :-
    min_hodnotenie(P, Min),
    hodnotenie(Polozka, H),
    H >= Min.
dovod_odporucania(P, Polozka, rozmer(film, Dlzka, maximum(Max))) :-
    polozka(Polozka, film, _, _),
    max_dlzka(P, Max),
    dlzka(Polozka, Dlzka),
    Dlzka =< Max.
dovod_odporucania(P, Polozka, rozmer(kniha, Strany, maximum(Max))) :-
    polozka(Polozka, kniha, _, _),
    max_strany(P, Max),
    strany(Polozka, Strany),
    Strany =< Max.
dovod_odporucania(P, Polozka, rozmer(hra, Hodiny, maximum(Max))) :-
    polozka(Polozka, hra, _, _),
    max_hodiny_hry(P, Max),
    dlzka_hry(Polozka, Hodiny),
    Hodiny =< Max.
dovod_odporucania(P, Polozka, rozmer(serial, Epizody, maximum(Max))) :-
    polozka(Polozka, serial, _, _),
    max_epizody(P, Max),
    epizody(Polozka, Epizody),
    Epizody =< Max.
dovod_odporucania(P, Polozka, tvorca(Rola, Meno)) :-
    oblubeny_tvorca(P, Meno),
    tvorca(Polozka, Rola, Meno).
dovod_odporucania(P, Polozka, krajina(K)) :-
    oblubena_krajina(P, K),
    krajina(Polozka, K).
dovod_odporucania(P, Polozka, studio(S)) :-
    oblubene_studio(P, S),
    studio(Polozka, S).
dovod_odporucania(P, Polozka, podobny_pouzivatel(Podobny)) :-
    podobni_pouzivatelia(P, Podobny),
    uz_konzumoval(Podobny, Polozka).
dovod_odporucania(P, Polozka, adaptacia(Iny)) :-
    ( adaptacia(Polozka, Iny)
    ; adaptacia(Iny, Polozka) ),
    uz_konzumoval(P, Iny).
dovod_odporucania(P, Polozka, univerzum(U, Iny)) :-
    univerzum(Polozka, U),
    univerzum(Iny, U),
    Iny \= Polozka,
    uz_konzumoval(P, Iny).

vysvetli(P, Polozka) :-
    dovody_odporucania(P, Polozka, Dovody),
    polozka(Polozka, Typ, Nazov, Rok),
    format("Polozka: ~w (~w, ~w)~n", [Nazov, Typ, Rok]),
    forall(member(D, Dovody), vypis_dovod(D)).

vypis_dovod(typ(Typ)) :-
    format("  - Typ: ~w (pouzivatel ho chce)~n", [Typ]).
vypis_dovod(zaner(Z)) :-
    format("  - Zaner: ~w (oblubeny)~n", [Z]).
vypis_dovod(hodnotenie(H, minimum(Min))) :-
    format("  - Hodnotenie: ~w/10 (minimum ~w)~n", [H, Min]).
vypis_dovod(rozmer(film, Dlzka, maximum(Max))) :-
    format("  - Dlzka filmu: ~w min (maximum ~w)~n", [Dlzka, Max]).
vypis_dovod(rozmer(kniha, Strany, maximum(Max))) :-
    format("  - Pocet stran: ~w (maximum ~w)~n", [Strany, Max]).
vypis_dovod(rozmer(hra, Hodiny, maximum(Max))) :-
    format("  - Dlzka hry: ~w h (maximum ~w)~n", [Hodiny, Max]).
vypis_dovod(rozmer(serial, Epizody, maximum(Max))) :-
    format("  - Pocet epizod: ~w (maximum ~w)~n", [Epizody, Max]).
vypis_dovod(tvorca(Rola, Meno)) :-
    format("  - ~w: ~w (oblubeny)~n", [Rola, Meno]).
vypis_dovod(krajina(K)) :-
    format("  - Krajina: ~w (oblubena)~n", [K]).
vypis_dovod(studio(S)) :-
    format("  - Studio: ~w (oblubene)~n", [S]).
vypis_dovod(podobny_pouzivatel(P)) :-
    format("  - Podobny pouzivatel uz polozku konzumoval: ~w~n", [P]).
vypis_dovod(adaptacia(Iny)) :-
    format("  - Adaptacia / predloha uz konzumovanej polozky: ~w~n", [Iny]).
vypis_dovod(univerzum(U, Iny)) :-
    format("  - Spolocne univerzum ~w s polozkou ~w~n", [U, Iny]).


% --- 2.B.3 KATEGORIZACIA ZHODY -------------------------------
%
%   "Vyborna zhoda" - obl. zaner aj obl. tvorca
%   "Dobra zhoda"   - aspon obl. zaner
%   "Slaba zhoda"   - inak
%
kategoria_odporucania(P, F, 'Vyborna zhoda') :-
    bonus_tvorcu(P, F),
    vyhovuje_zaneru(P, F), !.
kategoria_odporucania(P, F, 'Dobra zhoda') :-
    vyhovuje_zaneru(P, F), !.
kategoria_odporucania(_, _, 'Slaba zhoda').


% --- 2.C COLLABORATIVE FILTERING -----------------------------
%
% Podobnost pouzivatelov je skore nad spolocnymi preferenciami.
% Vahy:
%   zaner +2, typ +1, tvorca +2, krajina +1, studio +1
%
podobnost_pouzivatelov(P1, P2, Skore) :-
    podobnost_pouzivatelov(P1, P2, Skore, _).

podobnost_pouzivatelov(P1, P2, Skore, Dovody) :-
    pouzivatel(P1, _),
    pouzivatel(P2, _),
    P1 \= P2,
    findall(Vaha-D,
            spolocna_preferencia(P1, P2, D, Vaha),
            Hrube),
    list_to_set(Hrube, Unikatne),
    vahy(Unikatne, Vahy),
    sum_list(Vahy, Skore),
    dovody_podobnosti(Unikatne, Dovody).

vahy([], []).
vahy([Vaha-_|Rest], [Vaha|Vahy]) :-
    vahy(Rest, Vahy).

dovody_podobnosti([], []).
dovody_podobnosti([_-D|Rest], [D|Dovody]) :-
    dovody_podobnosti(Rest, Dovody).

spolocna_preferencia(P1, P2, zaner(Z), 2) :-
    oblubeny_zaner(P1, Z),
    oblubeny_zaner(P2, Z).
spolocna_preferencia(P1, P2, typ(T), 1) :-
    oblubeny_typ(P1, T),
    oblubeny_typ(P2, T).
spolocna_preferencia(P1, P2, tvorca(M), 2) :-
    oblubeny_tvorca(P1, M),
    oblubeny_tvorca(P2, M).
spolocna_preferencia(P1, P2, krajina(K), 1) :-
    oblubena_krajina(P1, K),
    oblubena_krajina(P2, K).
spolocna_preferencia(P1, P2, studio(S), 1) :-
    oblubene_studio(P1, S),
    oblubene_studio(P2, S).

% Dvaja pouzivatelia su podobni, ak ich skore podobnosti dosiahne 4.
podobni_pouzivatelia(P1, P2) :-
    podobnost_pouzivatelov(P1, P2, Skore),
    Skore >= 4.

%  Odporucanie cez podobneho pouzivatela:
%  "co konzumoval podobny pouzivatel, co ja este nie a ma to
%   dobre hodnotenie".
odporucam_collaborative(P, Polozka) :-
    podobni_pouzivatelia(P, Podobny),
    uz_konzumoval(Podobny, Polozka),
    polozka(Polozka, Typ, _, _),
    pouzivatel_chce_typ(P, Typ),
    este_nekonzumoval(P, Polozka),
    vyhovuje_hodnoteniu(P, Polozka),
    vyhovuje_rozmeru(P, Polozka, Typ).


% --- 2.D CROSS-DOMAIN ODPORUCANIE ----------------------------
%
%  "Paci sa mi film X (sci_fi) -> odporuc mi knihu/hru rovnakeho
%   zaneru".  Most medzi domenami su zdielane atributy (zaner,
%   krajina, tvorca, studio).
%
% cross_domain_odporucam(+Pouzivatel, +ZdrojPolozka,
%                        -CielPolozka, -Dovod)
%
cross_domain_odporucam(P, Zdroj, Ciel, Dovod) :-
    uz_konzumoval(P, Zdroj),
    polozka(Zdroj, TypZdroj, _, _),
    polozka(Ciel, TypCiel, _, _),
    TypZdroj \= TypCiel,
    pouzivatel_chce_typ(P, TypCiel),
    este_nekonzumoval(P, Ciel),
    vyhovuje_hodnoteniu(P, Ciel),
    vyhovuje_rozmeru(P, Ciel, TypCiel),
    cross_dovod(Zdroj, Ciel, Dovod).

% Most medzi dvomi polozkami z roznych domen.
cross_dovod(Zdroj, Ciel, spolocny_zaner(Z)) :-
    zaner(Zdroj, Z), zaner(Ciel, Z).
cross_dovod(Zdroj, Ciel, spolocny_tvorca(M)) :-
    tvorca(Zdroj, _, M), tvorca(Ciel, _, M).
cross_dovod(Zdroj, Ciel, spolocna_krajina(K)) :-
    krajina(Zdroj, K), krajina(Ciel, K).
cross_dovod(Zdroj, Ciel, spolocne_studio(S)) :-
    studio(Zdroj, S), studio(Ciel, S).
cross_dovod(Zdroj, Ciel, spolocne_univerzum(U)) :-
    univerzum(Zdroj, U), univerzum(Ciel, U).
cross_dovod(Zdroj, Ciel, adaptacia) :-
    ( adaptacia(Zdroj, Ciel)
    ; adaptacia(Ciel, Zdroj) ).


% --- 2.E FILTER "KTO MA RAD X" (FANUSIKOVIA) -----------------
%
%  fanusikovia(+Polozka, -ZoznamPouzivatelov)
%
%  Vrati zoznam vsetkych pouzivatelov, ktorym by polozku
%  hlavne pravidlo odporucam/2 odporucilo (alebo ju uz konzumovali).
%
fanusikovia(Polozka, Pouzivatelia) :-
    findall(P,
            ( pouzivatel(P, _),
              ( odporucam(P, Polozka) ; uz_konzumoval(P, Polozka) )
            ),
            Zoznam),
    sort(Zoznam, Pouzivatelia).

%  fanusikovia_s_dovodmi(+Polozka, -Pary)
%
%  Vrati zoznam parov P-Dovody, kde Dovody su konkretne
%  zhody (zaner / tvorca / krajina / studio).
%
fanusikovia_s_dovodmi(Polozka, Pary) :-
    findall(P-Dovody,
            ( pouzivatel(P, _),
              ( odporucam(P, Polozka) ; uz_konzumoval(P, Polozka) ),
              zhromazdi_dovody(P, Polozka, Dovody),
              Dovody \= []
            ),
            ParyHrube),
    sort(ParyHrube, Pary).

zhromazdi_dovody(P, Polozka, Dovody) :-
    findall(D, dovod_zhody(P, Polozka, D), Dovody0),
    list_to_set(Dovody0, Dovody).

dovod_zhody(P, F, zaner(Z)) :-
    oblubeny_zaner(P, Z), zaner(F, Z).
dovod_zhody(P, F, tvorca(M)) :-
    oblubeny_tvorca(P, M), tvorca(F, _, M).
dovod_zhody(P, F, krajina(K)) :-
    oblubena_krajina(P, K), krajina(F, K).
dovod_zhody(P, F, studio(S)) :-
    oblubene_studio(P, S), studio(F, S).


% --- 2.F ROBUSTNE CESTOVANIE PO GRAFE VZTAHOV ----------------
%
%  Polozky v znalostnej baze tvoria orientovany (resp.
%  symetricky) graf prepojeny cez zdielane atributy: zaner,
%  krajina, tvorca, studio.
%
%  zdielany_atribut(+P1, +P2, -Atribut)
%     Atribut je jeden z {zaner(_), krajina(_), tvorca(_), studio(_)}.
%
zdielany_atribut(P1, P2, zaner(Z))   :- zaner(P1, Z),    zaner(P2, Z).
zdielany_atribut(P1, P2, krajina(K)) :- krajina(P1, K), krajina(P2, K).
zdielany_atribut(P1, P2, studio(S))  :- studio(P1, S),  studio(P2, S).
zdielany_atribut(P1, P2, tvorca(M))  :- tvorca(P1, _, M), tvorca(P2, _, M).

%  pribuzne_polozky(+P1, -P2, -Sila)
%     Sila = pocet roznych zdielanych atributov medzi P1 a P2.
%
pribuzne_polozky(P1, P2, Sila) :-
    polozka(P1, _, _, _),
    polozka(P2, _, _, _),
    P1 \= P2,
    findall(A, zdielany_atribut(P1, P2, A), Atribuy),
    list_to_set(Atribuy, Spolocne),
    length(Spolocne, Sila),
    Sila > 0.

%  top_pribuzne(+P, -ZoradeneSPodlaSily)
%     Vrati pribuzne polozky zoradene podla sily zostupne.
%
top_pribuzne(P, Top) :-
    findall(Sila-P2,
            pribuzne_polozky(P, P2, Sila),
            Pary),
    sort(0, @>=, Pary, Top).

%  retazec(+Od, ?Na, +MaxKrokov, -Cesta)
%     Najde cestu v grafe pribuznosti dlzky <= MaxKrokov.
%     Cesta je zoznam polozka_idov od Od po Na.
%
retazec(Od, Na, Max, Cesta) :-
    retazec_(Od, Na, Max, [Od], CestaR),
    reverse(CestaR, Cesta).

retazec_(P, P, _, Acc, Acc).
retazec_(Od, Na, Max, Acc, Cesta) :-
    Max > 0,
    pribuzne_polozky(Od, Medzi, _),
    \+ member(Medzi, Acc),     % zabranenie cyklom
    Max1 is Max - 1,
    retazec_(Medzi, Na, Max1, [Medzi|Acc], Cesta).


% --- 2.G CONSTRAINT ODPORUCANIE: FILMOVY VECER -----------------
%
%  filmovy_vecer(+Pouzivatel, +MaxMinut, -Vyber, -Dlzka, -Skore)
%     Vyberie neprázdny zoznam odporucanych filmov tak, aby sa
%     zmestili do casoveho limitu a maximalizovali celkove skore.
%
filmovy_vecer(P, MaxMinut, Vyber, CelkovaDlzka, CelkoveSkore) :-
    integer(MaxMinut),
    MaxMinut > 0,
    findall(F-D-S,
            ( odporucam(P, F),
              polozka(F, film, _, _),
              dlzka(F, D),
              skore_odporucania(P, F, S)
            ),
            Kandidati),
    Kandidati \= [],
    length(Kandidati, N),
    length(VybraneBity, N),
    VybraneBity ins 0..1,
    kandidat_dlzky(Kandidati, Dlzky),
    kandidat_skore(Kandidati, Skore),
    scalar_product(Dlzky, VybraneBity, #=, CelkovaDlzka),
    scalar_product(Skore, VybraneBity, #=, CelkoveSkore),
    CelkovaDlzka #=< MaxMinut,
    sum(VybraneBity, #>=, 1),
    labeling([max(CelkoveSkore)], VybraneBity),
    vybrane_filmy(Kandidati, VybraneBity, Vyber).

kandidat_dlzky([], []).
kandidat_dlzky([_-D-_|Rest], [D|Dlzky]) :-
    kandidat_dlzky(Rest, Dlzky).

kandidat_skore([], []).
kandidat_skore([_-_-S|Rest], [S|Skore]) :-
    kandidat_skore(Rest, Skore).

vybrane_filmy([], [], []).
vybrane_filmy([F-_-_|Rest], [1|Bity], [F|Vyber]) :-
    vybrane_filmy(Rest, Bity, Vyber).
vybrane_filmy([_-_-_|Rest], [0|Bity], Vyber) :-
    vybrane_filmy(Rest, Bity, Vyber).


% =============================================================
% 3) STATISTIKA
% =============================================================

%  pocet_odporucani(+P, -N)
pocet_odporucani(P, Pocet) :-
    findall(F, odporucam(P, F), Zoznam),
    length(Zoznam, Pocet).

%  pocet_odporucani_typu(+P, +Typ, -N)
pocet_odporucani_typu(P, Typ, Pocet) :-
    findall(F, ( odporucam(P, F), polozka(F, Typ, _, _) ),
            Zoznam),
    length(Zoznam, Pocet).


% =============================================================
%  KONIEC SUBORU program.pl
% =============================================================
