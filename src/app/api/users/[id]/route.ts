import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin();
    if (!adminUser) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating role
    if (!body.role || !["admin", "member"].includes(body.role)) {
      return NextResponse.json(
        { error: "Rol invalido. Usar 'admin' o 'member'" },
        { status: 400 }
      );
    }

    // Prevent self-demotion
    if (id === adminUser.id && body.role !== "admin") {
      return NextResponse.json(
        { error: "No podes cambiar tu propio rol" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({ role: body.role, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, email, full_name, role, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
