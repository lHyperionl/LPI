"use client";

import { useEffect, useState } from "react";
import { Braces } from "lucide-react";

const LINKS = [
  { href: "#pouzivatel", label: "Profil" },
  { href: "#odporucania", label: "Odporúčania" },
  { href: "#collaborative", label: "Collaborative" },
  { href: "#cross-domain", label: "Cross-domain" },
  { href: "#graf", label: "Graf" },
  { href: "#filmovy-vecer", label: "Filmový večer" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition ${
        scrolled ? "border-b border-slate-200 bg-paper/85 backdrop-blur" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-white">
            <Braces className="h-4 w-4" />
          </span>
          <span className="text-sm">Prolog Recommender</span>
        </a>
        <ul className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-ink-faint transition hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#odporucania"
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-soft"
        >
          Spustiť demo
        </a>
      </nav>
    </header>
  );
}
