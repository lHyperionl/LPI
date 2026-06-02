"use client";

import { useEffect, useRef, useState } from "react";
import { Film, BookOpen, Gamepad2, Tv } from "lucide-react";

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, containerRef };
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
  const { count, containerRef } = useCountUp(n);

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur"
    >
      <div className="mb-1 flex items-center justify-center gap-1.5 text-primary">{icon}</div>
      <div className="text-2xl font-bold tabular-nums text-ink">{count}</div>
      <div className="text-xs text-ink-faint">{label}</div>
    </div>
  );
}

export function HeroStatsGroup() {
  return (
    <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
      <HeroStat icon={<Film className="h-4 w-4" />} n={15} label="filmov" />
      <HeroStat icon={<BookOpen className="h-4 w-4" />} n={15} label="kníh" />
      <HeroStat icon={<Gamepad2 className="h-4 w-4" />} n={15} label="hier" />
      <HeroStat icon={<Tv className="h-4 w-4" />} n={10} label="seriálov" />
    </div>
  );
}
