// =============================================================
// app/api/[endpoint]/route.ts  -  Tenky proxy na Prolog backend
// =============================================================
// Klientske komponenty volaju /api/<endpoint>?...; tento handler
// preposle dopyt na interny Prolog HTTP server (PROLOG_API_URL).
// Mapovanie 1:1 - frontend nepozna internu adresu backendu.

import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.PROLOG_API_URL ?? "http://localhost:4000";

// Whitelist endpointov, ktore smieme proxovat (bezpecnost + presnost).
const ALLOWED = new Set([
  "users",
  "items",
  "recommend",
  "explain",
  "hybrid",
  "collaborative",
  "cross-domain",
  "fans",
  "related",
  "path",
  "movie-night",
  "stats",
  "health",
]);

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ endpoint: string }> },
) {
  const { endpoint } = await params;
  if (!ALLOWED.has(endpoint)) {
    return NextResponse.json({ error: "neznamy endpoint" }, { status: 404 });
  }

  const target = new URL(`/api/${endpoint}`, BASE);
  // Prenes vsetky query parametre.
  req.nextUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  try {
    const res = await fetch(target.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: "Prolog backend nedostupny", detail: String(e) },
      { status: 502 },
    );
  }
}
