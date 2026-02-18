import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/dropbox/status
 * Check if the current user has Dropbox connected.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: tokenRow } = await admin
    .from("dropbox_tokens")
    .select("account_id, created_at")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    connected: !!tokenRow,
    accountId: tokenRow?.account_id || null,
    connectedAt: tokenRow?.created_at || null,
  });
}
