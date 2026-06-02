"use client";

import { useEffect, useState } from "react";
import { Braces, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#pouzivatel", label: "Profil", num: "01" },
  { href: "#odporucania", label: "Odporúčania", num: "02" },
  { href: "#hybrid", label: "Hybridné", num: "03" },
  { href: "#collaborative", label: "Collaborative", num: "04" },
  { href: "#cross-domain", label: "Cross-domain", num: "05" },
  { href: "#fanusikovia", label: "Fanúšikovia", num: "06" },
  { href: "#graf", label: "Graf", num: "07" },
  { href: "#filmovy-vecer", label: "Filmový večer", num: "08" },
  { href: "#statistiky", label: "Štatistiky", num: "09" },
];

const SECTION_IDS = LINKS.map((l) => l.href.slice(1));

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0);

      // Find the section closest to the top of the viewport
      let current = "";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 96) {
          current = id;
        }
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 transition ${
        scrolled ? "border-b border-slate-200 bg-paper/85 backdrop-blur" : "bg-transparent"
      }`}
    >
      {/* Reading progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] bg-primary transition-[width] duration-75"
        style={{ width: `${progress}%` }}
        aria-hidden
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Braces className="h-4 w-4" />
          </span>
          <span className="text-sm">Prolog Recommender</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-4 lg:flex">
          {LINKS.map((l) => {
            const isActive = activeId === l.href.slice(1);
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => scrollTo(e, l.href)}
                  className={`flex items-center gap-1 whitespace-nowrap text-xs font-medium transition hover:text-ink ${
                    isActive ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold tabular-nums transition ${
                      isActive ? "text-primary" : "text-primary/50"
                    }`}
                  >
                    {l.num}
                  </span>
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Otvoriť menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-14 items-center border-b border-slate-100 px-5">
                <a href="#top" className="flex items-center gap-2 font-bold text-ink">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-white">
                    <Braces className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm">Prolog</span>
                </a>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {LINKS.map((l) => {
                    const isActive = activeId === l.href.slice(1);
                    return (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        onClick={(e) => scrollTo(e, l.href)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-slate-50 hover:text-ink ${
                          isActive ? "bg-accent text-ink" : "text-ink-soft"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-primary transition ${
                          isActive ? "bg-primary/10" : "bg-accent"
                        }`}>
                          {l.num}
                        </span>
                        {l.label}
                      </a>
                    </li>
                    );
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
