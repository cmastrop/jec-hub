import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDropboxAuthUrl } from "@/lib/dropbox/oauth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Use user ID as state parameter to verify on callback
  const authUrl = getDropboxAuthUrl(user.id);
  return NextResponse.redirect(authUrl);
}
