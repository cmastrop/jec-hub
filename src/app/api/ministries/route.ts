import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("ministries")
      .select("*")
      .eq("active", true)
      .order("slug");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
