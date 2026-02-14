import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "missing",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "missing",
  });
}
