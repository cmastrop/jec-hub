import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron diario (ver vercel.json). El plan Free de Supabase pausa el
// proyecto tras ~7 dias sin actividad de DB, asi que hacemos una query real.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("songs")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, songs: count });
}
