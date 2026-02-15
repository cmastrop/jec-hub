import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, full_name, role, notation_preference, font_size_preference")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        role: "member",
      });
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.full_name === "string") {
      updates.full_name = body.full_name.trim();
    }
    if (body.notation_preference === "letter" || body.notation_preference === "solfege") {
      updates.notation_preference = body.notation_preference;
    }
    if (typeof body.font_size_preference === "number" && body.font_size_preference >= 12 && body.font_size_preference <= 32) {
      updates.font_size_preference = body.font_size_preference;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No hay campos validos para actualizar" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, full_name, role, notation_preference, font_size_preference")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
