import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCodeForTokens } from "@/lib/dropbox/oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/importar?dropbox_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/importar?dropbox_error=missing_code`
    );
  }

  // Verify the user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || (state && user.id !== state)) {
    return NextResponse.redirect(
      `${appUrl}/importar?dropbox_error=auth_mismatch`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // Store refresh token in database
    const admin = createAdminClient();
    await admin.from("dropbox_tokens").upsert(
      {
        user_id: user.id,
        refresh_token: tokens.refresh_token,
        account_id: tokens.account_id,
      },
      { onConflict: "user_id" }
    );

    return NextResponse.redirect(`${appUrl}/importar?dropbox_connected=true`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.redirect(
      `${appUrl}/importar?dropbox_error=${encodeURIComponent(message)}`
    );
  }
}
