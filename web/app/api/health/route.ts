// =============================================================
// app/api/health/route.ts  -  Lokalny health-check pre Railway
// =============================================================
// Tento endpoint sa vyhodnocuje v Next.js runtime, takze Railway
// vie overit, ci web sluzba bezi - bez toho, aby musel volat
// Prolog backend.  Staticka cesta ma v Next.js prioritu pred
// dynamickym [endpoint] catch-all, takze proxy ho neprebere.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "web",
    timestamp: new Date().toISOString(),
  });
}
