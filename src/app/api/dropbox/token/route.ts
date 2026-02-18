import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshAccessToken } from "@/lib/dropbox/oauth";

/**
 * GET /api/dropbox/token
 * Returns a fresh Dropbox access token using the stored refresh token.
 * Called by migration components before making Dropbox API calls.
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
    .select("refresh_token")
    .eq("user_id", user.id)
    .single();

  if (!tokenRow?.refresh_token) {
    return NextResponse.json(
      { error: "Dropbox no conectado", connected: false },
      { status: 404 }
    );
  }

  try {
    const { access_token, expires_in } = await refreshAccessToken(
      tokenRow.refresh_token
    );

    return NextResponse.json({ access_token, expires_in, connected: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Token refresh failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dropbox/token
 * Disconnect Dropbox (delete stored refresh token).
 */
export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  await admin.from("dropbox_tokens").delete().eq("user_id", user.id);

  return NextResponse.json({ disconnected: true });
}
